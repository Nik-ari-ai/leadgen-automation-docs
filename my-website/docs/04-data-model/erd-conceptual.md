---
title: ERD — Концептуальная модель
sidebar_position: 2
description: Уровень 1 — сущности и связи без атрибутов
---

# Уровень 1: Концептуальная модель

Только сущности и связи. Атрибутов нет — уровень для обсуждения с бизнесом. Сущности определены из use cases UC-FR-01 — UC-FR-05.

## Ключевые связи

- **Tenant → всё остальное (1:N).** Изоляция данных по tenant (NFR-08).
- **Lead ↔ DeduplicationGroup (M:N).** Один лид может быть в нескольких группах дублей, одна группа содержит несколько лидов.
- **Lead ↔ FilterReference (M:N через теги).** Один лид может иметь несколько тегов.
- **EnrichmentJob → EnrichmentLog (1:N).** Одна задача = много логов (по одному на лида).
- **EnrichmentLog → Lead (N:1).** Каждый лог привязан к конкретному лиду.
- **EnrichmentJob → PromptTemplate (N:1).** Задача использует один шаблон промпта.

## Диаграмма

```plantuml
@startuml
!define ENTITY(name) entity name

skinparam linetype ortho
hide circle
hide members

ENTITY(Tenant)
ENTITY(User)
ENTITY(Lead)
ENTITY(ImportReport)
ENTITY(ExportJob)
ENTITY(DeduplicationGroup)
ENTITY(EnrichmentJob)
ENTITY(EnrichmentLog)
ENTITY(PromptTemplate)
ENTITY(FilterReference)

Tenant ||--o{ User
Tenant ||--o{ Lead
Tenant ||--o{ ImportReport
Tenant ||--o{ ExportJob
Tenant ||--o{ DeduplicationGroup
Tenant ||--o{ EnrichmentJob
Tenant ||--o{ EnrichmentLog
Tenant ||--o{ PromptTemplate
Tenant ||--o{ FilterReference

Lead }o--o{ DeduplicationGroup
Lead }o--o{ FilterReference : "теги"
Lead ||--o{ EnrichmentLog

EnrichmentJob ||--o{ EnrichmentLog
EnrichmentJob }o--|| PromptTemplate

User ||--o{ ImportReport : "запустил"
User ||--o{ ExportJob : "запустил"
@enduml
```

## Источник в PlantUML

Файл [`/diagrams/erd_1_conceptual.puml`](https://github.com/Nik-ari-ai/leadgen-automation-docs/blob/main/my-website/diagrams/erd_1_conceptual.puml).
