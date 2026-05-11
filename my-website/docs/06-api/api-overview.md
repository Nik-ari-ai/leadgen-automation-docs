---
title: Обзор API
sidebar_position: 1
description: Краткое описание REST API LeadGen Automation
---

# Обзор API

Интерактивная документация API доступна на отдельной странице, сгенерированной через [redocusaurus](https://redocusaurus.vercel.app/) из OpenAPI-спецификации:

👉 [**Открыть Redoc API Reference**](/api/leadgen/)

## Сущности, нужные фронту

| Сущность | Зачем |
|---|---|
| Lead | Основная сущность для таблицы, карточки, enrichment, merge, export |
| ImportPreview | Preview перед импортом CSV / Google Sheets |
| ImportReport | Результат импорта, статистика, ошибки |
| DeduplicationGroup | Экран дедупликации, merge |
| EnrichmentJob | Запуск enrichment, прогресс фоновой задачи |
| EnrichmentLog | AI-ответ, review decision, ручная проверка |
| ExportJob | Экспорт под Instantly CSV |

## Группы endpoints

### Leads
- `GET /tenants/{tenantId}/leads`
- `GET /tenants/{tenantId}/leads/filters`
- `GET /tenants/{tenantId}/leads/{leadId}`
- `PATCH /tenants/{tenantId}/leads/{leadId}`
- `DELETE /tenants/{tenantId}/leads/{leadId}`

### Imports
- `POST /tenants/{tenantId}/imports/previews`
- `POST /tenants/{tenantId}/imports`
- `GET /tenants/{tenantId}/imports/{importId}`
- `DELETE /tenants/{tenantId}/imports/{importId}`

### Deduplication
- `GET /tenants/{tenantId}/deduplication/groups`
- `GET /tenants/{tenantId}/deduplication/groups/{groupId}`
- `POST /tenants/{tenantId}/deduplication/merges`

### Enrichment
- `POST /tenants/{tenantId}/enrichment/jobs`
- `GET /tenants/{tenantId}/enrichment/jobs/{jobId}`
- `GET /tenants/{tenantId}/enrichment/jobs/{jobId}/logs`

### Exports
- `POST /tenants/{tenantId}/exports`
- `GET /tenants/{tenantId}/exports/{exportId}`
- `DELETE /tenants/{tenantId}/exports/{exportId}`

## Особенности дизайна API

- **Multi-tenant.** Все эндпоинты начинаются с `/tenants/{tenantId}/...`. Tenant — обязательный сегмент пути, проверяется на каждый запрос (NFR-08).
- **Job-сущности для долгих операций.** Импорт, enrichment, экспорт — это `Job` со статусом, статистикой, ошибками. Создание = `POST` (возвращает `202 Accepted`), статус = `GET`.
- **Async + polling.** Долгие операции возвращают `jobId`, фронт опрашивает `GET .../jobs/{jobId}` каждые 5–10 сек.
- **`reviewDecision`.** Поле `auto_accept / needs_review / reject` в EnrichmentLog — соответствует логике DMN.
- **Унифицированные ошибки.** Формат ответа на ошибку: `{ "code": "...", "message": "...", "details": {} }`.

## Файл спецификации

OpenAPI 3.0 YAML — [`/api_specs/leadgen-api.yml`](https://github.com/Nik-ari-ai/leadgen-automation-docs/blob/main/my-website/api_specs/leadgen-api.yml).
