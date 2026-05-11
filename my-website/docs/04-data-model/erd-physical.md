---
title: ERD — Физическая модель
sidebar_position: 4
description: Уровень 3 — типы данных, индексы, NFR, денормализация
---

# Уровень 3: Физическая модель

С типами PostgreSQL, индексами и физическими решениями под NFR.

## Типы данных

| Что | Тип | Почему |
|---|---|---|
| id (все таблицы) | `SERIAL` | До 500k лидов — INTEGER (~2.1B) хватает с запасом |
| Все FK | `INTEGER` | Совпадает с типом PK, INDEX на каждом FK |
| email, name, company | `VARCHAR(255)` | Известная максимальная длина |
| prompt, raw_response, summary | `TEXT` | Длина заранее неизвестна (1–5 КБ) |
| created_at, updated_at | `TIMESTAMPTZ` | Разные часовые пояса |
| confidence_score | `DECIMAL(3,2)` | 0.00–1.00, нужна точность |
| estimated_cost_usd | `DECIMAL(10,4)` | Деньги — точность до сотых цента |
| mapping, errors, skipped_leads | `JSONB` | Полуструктурированные данные, разная структура |

## Индексы

INDEX на каждом FK (для JOIN и DELETE). Дополнительные составные индексы:

| Индекс | Зачем |
|---|---|
| `lead(tenant_id, status_id)` | Фильтрация по статусу — самый частый запрос (NFR-01: ≤ 0.7 сек) |
| `lead(tenant_id, email)` | Поиск дубликатов при импорте |
| `lead(tenant_id, needs_review)` | Фильтр "на проверку" |
| `lead(tenant_id, created_at)` | Сортировка по дате (дефолтная) |
| `enrichment_job(tenant_id, status)` | Polling активных задач |
| `enrichment_log(tenant_id, created_at)` | Аналитика расходов за период |
| `deduplication_group(tenant_id, status)` | Фильтр групп |
| `UNIQUE(tenant_id, email) WHERE deleted_at IS NULL` | Partial unique index — уникальность только для не удалённых (P6 + GDPR) |
| `UNIQUE(lead_id, tag_id)` в `lead_tag` | Один тег на лида один раз |
| `UNIQUE(group_id, lead_id)` в `deduplication_group_lead` | Без дублирования в группах |

## Физические решения по NFR

- **NFR-01 (≤ 0.7 сек):** составные индексы на `lead`. При 50k лидов PostgreSQL с B-tree укладывается.
- **NFR-07 (GDPR):** `Lead.deleted_at` — мягкое удаление (P6). Partial unique index на email.
- **NFR-08 (изоляция tenant):** `tenant_id` на каждой таблице, все индексы начинаются с `tenant_id`.
- **NFR-10 (логи):** `enrichment_log` хранит prompt, raw_response, usage. Append-only.

## Осознанная денормализация

| Поле | Что дублирует | Зачем |
|---|---|---|
| `lead.last_enrichment_job_id` | "Последний job" из enrichment_log | Без этого для каждого лида нужен подзапрос |
| `deduplication_group.lead_count` | COUNT(*) из deduplication_group_lead | Чтобы не считать каждый раз при отображении списка групп |
| `enrichment_job.progress` (счётчики) | Агрегации из enrichment_log | Polling каждые 5–10 сек требовал бы COUNT, а так worker обновляет после каждого лида |

## Сводная таблица паттернов

| Паттерн | Где | Зачем |
|---|---|---|
| L1 (M:N+) | `deduplication_group_lead` | Lead ↔ DeduplicationGroup с атрибутом `is_master` |
| L1 (M:N) | `lead_tag` | Lead ↔ FilterReference (теги), вместо массива строк |
| L2 (Справочник) | `filter_reference` | Статусы, источники, теги — добавляются через UI без деплоя |
| L3 (История) | `merge_history` | История merge: кто, когда, какие значения выбраны |
| P6 (Soft delete) | `lead.deleted_at` | GDPR (NFR-07): удаление без потери истории |
| Денормализация | `lead.last_enrichment_job_id` | Быстрый доступ к последнему enrichment без подзапроса |
| Денормализация | `deduplication_group.lead_count` | Счётчик без COUNT по промежуточной таблице |
| Денормализация | `enrichment_job.progress` | Счётчики для polling без агрегации по логам |

## Источник в PlantUML

Файл [`/diagrams/erd_3_physical.puml`](https://github.com/Nik-ari-ai/leadgen-automation-docs/blob/main/my-website/diagrams/erd_3_physical.puml).

> **TODO:** добавить в шапку каждой `CREATE TABLE` миграции комментарий с типом ресурса (например `-- @nfr NFR-08 NFR-07`) для трассируемости.
