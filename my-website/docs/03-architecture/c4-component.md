---
title: C4 — Component (Уровень 3)
sidebar_position: 3
description: Компонентная диаграмма — модули внутри Backend API
---

# C4: Component (Backend API)

Декомпозиция контейнера **Backend API** на компоненты. Показано, как организованы модули внутри FastAPI-приложения.

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

LAYOUT_WITH_LEGEND()

title Component Diagram: Backend API

Container(spa, "Web App", "React")
ContainerDb(db, "PostgreSQL")
ContainerDb(docdb, "MongoDB")
Container(queue, "RabbitMQ")
System_Ext(openai, "OpenAI API")
System_Ext(gsheets, "Google Sheets API")

Container_Boundary(api, "Backend API") {
  Component(authCtrl, "Auth Controller", "FastAPI router", "Login, JWT, refresh")
  Component(leadsCtrl, "Leads Controller", "FastAPI router", "CRUD, поиск, фильтры")
  Component(importsCtrl, "Imports Controller", "FastAPI router", "Preview + execute CSV / Google Sheets")
  Component(dedupCtrl, "Dedup Controller", "FastAPI router", "Группы дублей, merge")
  Component(enrichCtrl, "Enrichment Controller", "FastAPI router", "Создание job, polling, логи")
  Component(exportsCtrl, "Exports Controller", "FastAPI router", "Создание экспорта, скачивание")

  Component(leadsService, "Leads Service", "Domain logic", "Бизнес-логика по лидам")
  Component(dedupService, "Dedup Service", "Domain logic", "Поиск и merge дублей")
  Component(enrichService, "Enrichment Service", "Domain logic", "Постановка задач в очередь, бюджет")
  Component(importService, "Import Service", "Domain logic", "Парсинг CSV, валидация, маппинг")

  Component(repos, "Repositories", "SQLAlchemy / Motor", "Доступ к БД")
  Component(integrations, "Integrations", "Adapters", "Google Sheets, OpenAI клиенты")
}

Rel(spa, authCtrl, "POST /auth/*")
Rel(spa, leadsCtrl, "GET/POST /leads/*")
Rel(spa, importsCtrl, "POST /imports/*")
Rel(spa, dedupCtrl, "GET/POST /deduplication/*")
Rel(spa, enrichCtrl, "POST/GET /enrichment/*")
Rel(spa, exportsCtrl, "POST/GET /exports/*")

Rel(leadsCtrl, leadsService, "вызывает")
Rel(importsCtrl, importService, "вызывает")
Rel(dedupCtrl, dedupService, "вызывает")
Rel(enrichCtrl, enrichService, "вызывает")

Rel(leadsService, repos, "")
Rel(dedupService, repos, "")
Rel(enrichService, repos, "")
Rel(importService, repos, "")

Rel(enrichService, queue, "Публикует задачи")
Rel(importService, integrations, "Через Google Sheets adapter")
Rel(integrations, gsheets, "OAuth 2.0")
Rel(repos, db, "SQL")
Rel(repos, docdb, "Mongo driver")
@enduml
```

## Слои

- **Controllers** — HTTP-роутеры, валидация входящих DTO, авторизация.
- **Services** — бизнес-логика, транзакции, оркестрация.
- **Repositories** — доступ к БД, абстракция над ORM/драйверами.
- **Integrations** — адаптеры к внешним системам (OpenAI, Google Sheets).

Такое разделение позволяет менять БД и провайдеров AI без изменения бизнес-логики.

## Шаблон для расширения

> **TODO:** при росте проекта вынести Worker в отдельный component diagram. Описать модули prompt-rendering, response-parsing, DMN-evaluator, retry-логика.
