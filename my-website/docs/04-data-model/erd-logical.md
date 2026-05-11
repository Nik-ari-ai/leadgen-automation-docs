---
title: ERD — Логическая модель
sidebar_position: 3
description: Уровень 2 — атрибуты, FK, паттерны нормализации
---

# Уровень 2: Логическая модель

С атрибутами, ключами и связями. Применены стандартные паттерны нормализации.

## Применённые паттерны

### L1 — M:N с атрибутом
- `deduplication_group_lead` — связь DeduplicationGroup ↔ Lead с атрибутом `is_master` (какой лид — master при merge).
- `lead_tag` — связь Lead ↔ FilterReference (для тегов через M:N).

### L2 — Справочник
`filter_reference` — справочник значений для фильтров (статусы, источники, теги). `lead.status_id` и `lead.source_id` — FK на этот справочник. Причина: новые значения добавляются руководителем через интерфейс без миграции схемы (INSERT вместо ALTER TYPE).

### L3 — История
`merge_history` — история merge-операций (FK на group, master_lead, merged_by user). Нужна для UC-FR-03 ("сохраняет историю merge").

### P6 — Soft delete
`Lead.deleted_at` — мягкое удаление. Физически не удаляем — нужно для GDPR (NFR-07). Merged-записи тоже помечаются `deleted_at`.

## Что enum, а что справочник

| Поле | Решение | Почему |
|---|---|---|
| `lead.status` | **Справочник** | Новые значения добавляются через UI без деплоя |
| `lead.source` | **Справочник** | То же самое |
| `tenant.plan` | enum | free/pro/enterprise — зашито в бизнес-логику тарифов |
| `user.role` | enum | admin/member — зашито в авторизацию |
| `prompt_template.model` | enum | Привязано к интеграции с OpenAI |
| `enrichment_log.review_decision` | enum | Зашито в DMN-логику |

## Нормализация

- **1NF:** нет списков в ячейках. Теги вынесены в отдельную таблицу `lead_tag` через M:N.
- **2NF:** все атрибуты зависят от всего ключа. `deduplication_group_lead` имеет составной уникальный ключ (group_id + lead_id), `is_master` зависит от обоих.
- **3NF:** нет транзитивных зависимостей. Статус и источник вынесены в `filter_reference`. Шаблон промпта — в `prompt_template`.

## Диаграмма

```plantuml
@startuml
!define table(x) entity x << (T,#FFAAAA) >>
hide circle
skinparam linetype ortho

table(tenant) {
  + id : PK
  --
  name
  plan : enum
  ai_settings : json
  created_at
}

table(user) {
  + id : PK
  --
  # tenant_id : FK
  email
  password_hash
  role : enum
  first_name
  last_name
  last_login_at
  created_at
}

table(lead) {
  + id : PK
  --
  # tenant_id : FK
  # status_id : FK → filter_reference
  # source_id : FK → filter_reference
  # last_enrichment_job_id : FK
  email
  linkedin_url
  first_name
  last_name
  company
  website
  title
  industry
  company_size
  summary
  flags : json
  deleted_at  // P6 soft delete
  created_at
  updated_at
}

table(filter_reference) {
  + id : PK
  --
  # tenant_id : FK
  filter_type : enum (status/source/tag)
  value
  label
  sort_order
  is_active
}

table(lead_tag) {
  + lead_id : FK
  + tag_id : FK → filter_reference
  --
  created_at
  // L1: M:N
}

table(deduplication_group) {
  + id : PK
  --
  # tenant_id : FK
  match_type : enum
  confidence_score
  lead_count  // денормализация
  status : enum
  created_at
}

table(deduplication_group_lead) {
  + group_id : FK
  + lead_id : FK
  --
  is_master : bool
  // L1: M:N с атрибутом
}

table(merge_history) {
  + id : PK
  --
  # group_id : FK
  # master_lead_id : FK
  # merged_by : FK → user
  selected_values : json
  created_at
  // L3: история
}

table(enrichment_job) {
  + id : PK
  --
  # tenant_id : FK
  # prompt_template_id : FK
  status : enum
  total_leads
  processed_leads  // денормализация
  success_count
  needs_review_count
  failed_count
  prompt_tokens
  completion_tokens
  estimated_cost_usd
  created_at
  finished_at
}

table(enrichment_log) {
  + id : PK
  --
  # lead_id : FK
  # job_id : FK
  # tenant_id : FK
  # prompt_template_id : FK
  provider
  model
  prompt : text
  raw_response : text
  parsed_fields : json
  review_decision : enum
  review_reason
  error_message
  prompt_tokens
  completion_tokens
  estimated_cost_usd
  created_at
}

table(prompt_template) {
  + id : PK
  --
  # tenant_id : FK
  name
  description
  system_prompt : text
  user_prompt_template : text
  model : enum
  temperature
  max_tokens
  is_default
  created_at
  updated_at
}

table(import_report) {
  + id : PK
  --
  # tenant_id : FK
  # source_type_id : FK → filter_reference
  status : enum
  file_name
  sheet_url
  mapping : json
  stats : json
  errors : json
  created_at
}

table(export_job) {
  + id : PK
  --
  # tenant_id : FK
  format : enum
  status : enum
  stats : json
  skipped_leads : json
  download_url
  created_at
}

' --- relationships ---
tenant ||--o{ user
tenant ||--o{ lead
tenant ||--o{ filter_reference
tenant ||--o{ deduplication_group
tenant ||--o{ enrichment_job
tenant ||--o{ enrichment_log
tenant ||--o{ prompt_template
tenant ||--o{ import_report
tenant ||--o{ export_job

lead }o--|| filter_reference : "status"
lead }o--|| filter_reference : "source"
lead }o--o{ filter_reference : "теги (через lead_tag)"
lead ||--o{ lead_tag
filter_reference ||--o{ lead_tag

lead }o--o{ deduplication_group : "через deduplication_group_lead"
deduplication_group ||--o{ deduplication_group_lead
lead ||--o{ deduplication_group_lead

deduplication_group ||--o{ merge_history
lead ||--o{ merge_history : "master"
user ||--o{ merge_history : "merged_by"

enrichment_job ||--o{ enrichment_log
enrichment_job }o--|| prompt_template
lead ||--o{ enrichment_log
import_report }o--|| filter_reference : "source_type"
@enduml
```

## ExportJob и связь с лидами

`ExportJob` **не имеет** отдельной промежуточной таблицы `export_job_lead`. Экспорт — это одноразовая операция: бэк берёт лидов по фильтру, генерирует CSV, сохраняет файл. Конкретные лиды, не попавшие в экспорт, хранятся в поле `skipped_leads` (JSONB) — массив `{leadId, reason}`. Для бизнеса важен результат (файл + статистика), а не полный перечень экспортированных лидов.
