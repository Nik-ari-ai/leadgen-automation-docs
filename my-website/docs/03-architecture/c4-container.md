---
title: C4 — Container (Уровень 2)
sidebar_position: 2
description: Контейнерная диаграмма — приложения, сервисы, БД
---

# C4: Container

Контейнерная диаграмма показывает технические компоненты LeadGen Automation: фронтенд, бэкенд, БД, очередь, worker.

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

LAYOUT_WITH_LEGEND()

title Container Diagram: LeadGen Automation

Person(sdr, "SDR / LeadGen")
Person(admin, "Руководитель")

System_Boundary(leadgen, "LeadGen Automation") {
  Container(spa, "Web App", "React + TypeScript", "Single Page Application — таблица лидов, импорт, enrichment, дедупликация")
  Container(api, "Backend API", "FastAPI (Python)", "REST API: CRUD по лидам, импорты, экспорты, jobs")
  Container(worker, "Enrichment Worker", "Python", "Фоновая обработка enrichment-задач, вызовы OpenAI")
  Container(queue, "Message Queue", "RabbitMQ", "Очередь задач enrichment / import")
  ContainerDb(db, "PostgreSQL", "Реляционная БД", "Lead, EnrichmentJob, DeduplicationGroup, FilterReference, Tenant, User")
  ContainerDb(docdb, "MongoDB", "Документная БД", "EnrichmentLog (prompt + response), ImportReport, ExportJob")
  Container(cache, "Cache", "Redis", "Кеш статусов job для polling, фильтры")
}

System_Ext(openai, "OpenAI API")
System_Ext(gsheets, "Google Sheets API")

Rel(sdr, spa, "Использует", "HTTPS")
Rel(admin, spa, "Использует", "HTTPS")
Rel(spa, api, "REST", "HTTPS, JSON")
Rel(api, db, "Чтение/запись", "SQL")
Rel(api, docdb, "Чтение/запись логов", "MongoDB driver")
Rel(api, cache, "Чтение/запись", "Redis protocol")
Rel(api, queue, "Публикует задачи", "AMQP")
Rel(queue, worker, "Доставляет задачи", "AMQP")
Rel(worker, db, "Чтение/запись", "SQL")
Rel(worker, docdb, "Запись лога enrichment", "MongoDB driver")
Rel(worker, openai, "Запросы enrichment", "HTTPS")
Rel(api, gsheets, "Чтение таблиц", "HTTPS, OAuth 2.0")
@enduml
```

## Контейнеры

| Контейнер | Технология | Ответственность |
| --- | --- | --- |
| Web App | React + TypeScript | UI: таблица лидов, импорт, enrichment, дедупликация |
| Backend API | FastAPI | REST-API, авторизация, бизнес-логика |
| Enrichment Worker | Python | Фоновая обработка enrichment, вызовы OpenAI |
| Message Queue | RabbitMQ | Очередь задач |
| PostgreSQL | Реляционная БД | Структурированные транзакционные данные |
| MongoDB | Документная БД | Логи enrichment, отчёты импорта/экспорта (полуструктурированные) |
| Redis | Cache | Статусы job для polling, кеш фильтров |

## Обоснование выбора БД

Гибридное хранение (PostgreSQL + MongoDB) — отдельная статья в [04. Модель данных → Сущности](../04-data-model/entities). Кратко:

- **PostgreSQL** для Lead, EnrichmentJob, DeduplicationGroup — структурированные данные с транзакциями и FK.
- **MongoDB** для EnrichmentLog, ImportReport — большие текстовые поля (промпт, ответ), полуструктурированные массивы ошибок.
