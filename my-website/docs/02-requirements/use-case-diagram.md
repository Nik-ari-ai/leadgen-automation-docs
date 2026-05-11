---
title: Use Case диаграмма
sidebar_position: 3
description: Диаграмма вариантов использования (PlantUML)
---

# Use Case диаграмма

Диаграмма построена на основе use cases UC-FR-01 — UC-FR-05. Включает три типа акторов (SDR/LeadGen, Growth/Marketing, Руководитель), их ассоциации с use cases, отношения `<<include>>` и `<<extend>>`, наследование между Growth и SDR.

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "SDR / LeadGen" as sdr
actor "Growth / Marketing" as growth
actor "Руководитель" as boss

package "LeadGen Automation" {
  usecase "Импортировать лидов\n(CSV / Google Sheets)" as UC1
  usecase "Загрузить CSV-файл" as UC1a
  usecase "Подключить Google Sheets" as UC1b
  usecase "Файл без email\n→ импорт отклонён" as UC1c

  usecase "Просмотреть и подтвердить merge" as UC2
  usecase "Выбрать master-запись\nи подтвердить merge" as UC2a
  usecase "Дубли не найдены\n→ шаг пропущен" as UC2b

  usecase "Запустить AI Enrichment" as UC3
  usecase "Выбрать шаблон промпта" as UC3a
  usecase "Поправить результат\nвручную (human-in-the-loop)" as UC3b
  usecase "Лимит AI превышен\n→ enrichment не запущен" as UC3c

  usecase "Экспортировать лидов\nпод Instantly (CSV)" as UC4
  usecase "Отфильтровать лидов\n(статус Ready)" as UC4a

  usecase "Посмотреть аналитику\n(дубли / время / заполненность)" as UC5
  usecase "Управлять лимитами\nи бюджетом AI" as UC6
}

sdr --> UC1
sdr --> UC2
sdr --> UC3
sdr --> UC4
growth --> UC4
growth --> UC5
boss --> UC5
boss --> UC6

UC1 <.. UC1a : <<extend>>
UC1 <.. UC1b : <<extend>>
UC1 <.. UC1c : <<extend>>
UC2 ..> UC2a : <<include>>
UC2 <.. UC2b : <<extend>>
UC3 ..> UC3a : <<include>>
UC3 <.. UC3b : <<extend>>
UC3 <.. UC3c : <<extend>>
UC4 ..> UC4a : <<include>>
sdr <|-- growth : наследует\nвсе сценарии SDR
@enduml
```

## Описание

- **SDR / LeadGen** — основной актор, выполняет все ключевые сценарии: импорт, дедупликация, enrichment, экспорт.
- **Growth / Marketing** — наследует все сценарии SDR + смотрит аналитику.
- **Руководитель** — управляет аналитикой и лимитами AI.

## Отношения

- `<<include>>` — обязательная часть use case (например, выбор master-записи всегда часть merge).
- `<<extend>>` — расширение, выполняется при определённом условии (например, "лимит AI превышен" — отдельный поток исключения).
