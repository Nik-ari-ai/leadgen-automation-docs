---
title: Sequence диаграмма (UC-FR-04)
sidebar_position: 4
description: Последовательность взаимодействий при AI Enrichment
---

# Sequence диаграмма: AI Enrichment

Диаграмма показывает асинхронное взаимодействие при запуске enrichment: фронт получает `202 Accepted` сразу, бэкенд ставит задачу в очередь, фронт опрашивает статус через polling каждые 5–10 секунд.

```plantuml
@startuml
actor SDR as user
participant "Frontend" as fe
participant "Backend API" as api
participant "Queue\n(RabbitMQ)" as q
participant "EnrichmentWorker" as worker
participant "OpenAI API" as ai
database "PostgreSQL" as db

user -> fe : Выбирает лидов и нажимает "Enrich with AI"
fe -> api : POST /enrichment/jobs\n{ leadIds, promptTemplateId }
api -> db : Создать EnrichmentJob (status=queued)
api -> q : Поставить задачу в очередь
api -->> fe : 202 Accepted\n{ jobId, status: "queued" }
fe -->> user : Показать прогресс-бар

== Запуск фоновой задачи ==
q ->> worker : Достать задачу
worker -> db : Прочитать лидов и шаблон промпта
worker -> db : Обновить status=processing

loop Для каждого лида
  worker ->> ai : POST /chat/completions\n{ prompt, model }
  ai -->> worker : { response, usage }
  worker -> worker : Парсинг + DMN: оценить качество
  worker -> db : Сохранить EnrichmentLog\n+ обновить Lead\n+ обновить progress в Job
end

worker -> db : Обновить status=completed/partial/failed

== Polling статуса (фронт) ==
loop Каждые 5–10 сек, пока status != completed
  fe ->> api : GET /enrichment/jobs/{jobId}
  api -> db : Прочитать Job
  api -->> fe : { status, progress }
  fe -->> user : Обновить прогресс
end

fe -->> user : Показать итог enrichment\n+ список "needs review"
@enduml
```

## Ключевые моменты

- **`202 Accepted`** вместо `200 OK` — фронт сразу получает ответ, фактическая работа идёт асинхронно.
- **Очередь** (RabbitMQ или эквивалент) разделяет API и worker — UI не зависит от скорости OpenAI.
- **Polling** каждые 5–10 секунд — выполняет NFR-02 ("Enrichment без зависания интерфейса").
- **DMN-оценка качества** на стороне worker — определяет, нужен ли human review (см. [DMN](../03-architecture/dmn)).
