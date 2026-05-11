---
title: Сущности и технологии хранения
sidebar_position: 1
description: Описание основных сущностей и обоснование выбора реляционной/документной БД
---

# Сущности и технологии хранения

## 1. Lead

**Что это:** основная сущность — контактные данные потенциального клиента для outbound-кампаний.

**Атрибуты:** `id`, `tenantId`, `email`, `linkedinUrl`, `firstName`, `lastName`, `fullName`, `company`, `website`, `title`, `industry`, `companySize`, `summary`, `status` (new/enriched/needs_review/ready/archived/merged), `source` (csv/google_sheets/manual/api), `tags[]`, `flags{needsReview, editedByHuman, duplicateCandidate}`, `lastEnrichment{jobId, status, reviewDecision, updatedAt}`, `createdAt`, `updatedAt`.

**Акторы:** SDR создаёт, просматривает, редактирует. Growth фильтрует и экспортирует. EnrichmentWorker обновляет.

**Характер:** транзакционные данные. Частые чтения с фильтрацией и пагинацией.

## 2. ImportReport / ExportJob

**ImportReport** — результат импорта из CSV / Google Sheets. **ExportJob** — результат экспорта под Instantly.

**Атрибуты ImportReport:** `id`, `tenantId`, `sourceType`, `status`, `fileName`, `sheetUrl`, `mapping{}`, `stats{totalRows, importedRows, rejectedRows}`, `errors[{rowNumber, code, message, rawRow}]`.

**Атрибуты ExportJob:** `id`, `tenantId`, `format`, `status`, `stats{}`, `skippedLeads[{leadId, reason}]`, `downloadUrl`.

**Характер:** аналитические — пишутся один раз, потом только читаются. Массивы errors / skippedLeads могут быть большими.

## 3. FilterReference

**Что это:** справочник значений для фильтров (статусы, источники, теги). Эндпоинт `GET /leads/filters` берёт данные отсюда — фронт не хардкодит.

**Атрибуты:** `id`, `tenantId`, `filterType` (status/source/tag), `value`, `label`, `sortOrder`, `isActive`.

**Характер:** справочные. Редко меняются, часто читаются.

## 4. EnrichmentJob

**Что это:** задача на AI-обогащение. Создаётся при нажатии Enrich with AI.

**Атрибуты:** `id`, `tenantId`, `status`, `promptTemplateId`, `progress{totalLeads, processedLeads, successCount, needsReviewCount, failedCount}`, `usage{promptTokens, completionTokens, estimatedCostUsd}`.

**Характер:** транзакционные. Частые обновления во время обработки, потом только чтение. Polling каждые 5–10 секунд.

## 5. EnrichmentLog

**Что это:** лог одного вызова OpenAI (один лог = один лид = один запрос).

**Атрибуты:** `id`, `leadId`, `jobId`, `tenantId`, `promptTemplateId`, `provider`, `model`, `prompt` (text), `rawResponse` (text), `parsedFields{}`, `reviewDecision` (auto_accept/needs_review/reject), `reviewReason`, `usage{}`.

**Характер:** транзакционные + аналитические. Append-only. Поля `prompt` и `rawResponse` — большой текст (1–5 КБ каждое).

## 6. DeduplicationGroup

**Что это:** группа дублей, найденных системой.

**Атрибуты:** `id`, `tenantId`, `matchType` (email/linkedin/domain_name_similarity), `confidenceScore`, `leadCount`, `status` (open/merged/ignored), `fieldComparison{sameFields, differentFields}`.

**Характер:** транзакционные. Связь с Lead через many-to-many.

## 7. Справочные: Tenant, User, PromptTemplate

- **Tenant** — организация-клиент. Все данные изолированы по tenant (NFR-08).
- **User** — пользователь системы. Атрибут `role` (admin/member). Проверяется на каждый запрос (JWT).
- **PromptTemplate** — шаблон промпта для AI. Per tenant.

## Технологии хранения — сравнительная таблица

| Параметр | Lead | ImportReport / ExportJob | EnrichmentJob | EnrichmentLog | DedupGroup | Справочные |
| --- | --- | --- | --- | --- | --- | --- |
| **Объём** | 10–50k на tenant, до 500k всего | 100–500 на tenant | 100–1k на tenant | 10–50k на tenant | 100–1k на tenant | Десятки записей |
| **Чтение/запись** | 80/20 | 95/5 | 50/50 → 99/1 | 95/5 | 80/20 | 99/1 |
| **Структура** | Структурированные + nested | Полуструктурированные (errors[] разной длины) | Структурированные + nested | Полуструктурированные (большой текст) | Структурированные | Структурированные |
| **Консистентность** | Строгая (unique email) | Eventual OK | Строгая (статус для polling) | Eventual OK | Строгая (merge = транзакция) | Строгая |
| **Связи** | Lead ↔ Log (1:N), ↔ Group (M:N) | Слабая | Job → Log (1:N) | Log → Lead (N:1) | Group ↔ Lead (M:N) | Tenant → всё |
| **Решение** | **PostgreSQL** | **MongoDB** | **PostgreSQL** | **MongoDB** | **PostgreSQL** | **PostgreSQL** |

## Что мониторить после запуска

- **Реальный объём лидов на tenant.** Если > 500k → шардирование или partitioning по `tenantId`.
- **Частота polling статуса enrichment.** Если 100+ пользователей одновременно → Redis для кеширования статуса.
- **Размер EnrichmentLog.** Если prompt + rawResponse в среднем > 5 КБ и логов > 100k → сжатие или вынос в отдельную коллекцию.
- **Нагрузка на GET /leads.** Если p95 > 0.7 сек → дополнительные индексы или materialized view для частых фильтров.
