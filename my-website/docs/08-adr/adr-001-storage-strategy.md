---
title: ADR-001 — Гибридное хранилище (PostgreSQL + MongoDB)
sidebar_position: 2
description: Решение использовать PostgreSQL для транзакций и MongoDB для логов
---

# ADR-001: Гибридное хранилище — PostgreSQL + MongoDB

> **Status:** Accepted
>
> **Date:** 2026-04-15
>
> **Authors:** Arina Nikolaeva

## Контекст

Системе нужно хранить:
1. Транзакционные данные с FK и unique constraints (Lead, EnrichmentJob, DeduplicationGroup).
2. Полуструктурированные данные с большими текстовыми полями (EnrichmentLog с prompt + raw_response, ImportReport с массивом ошибок разной длины).

NFR-01 требует ≤ 0.7 сек на запрос Leads с фильтрами, NFR-08 — изоляцию по tenant, NFR-10 — детальные логи enrichment.

## Решение

Использовать **PostgreSQL** для структурированных транзакционных данных и **MongoDB** для логов и отчётов с полуструктурированными полями.

| БД | Что храним |
|---|---|
| PostgreSQL | Lead, EnrichmentJob, DeduplicationGroup, Tenant, User, PromptTemplate, FilterReference |
| MongoDB | EnrichmentLog, ImportReport, ExportJob (skippedLeads) |

## Альтернативы

- **Только PostgreSQL.** Плюс: один стек, проще DevOps. Минус: JSONB-поля огромного размера (prompt+response 5–10 КБ × 50k записей) — нагрузка на индексы, vacuum, bloat. Аналитические запросы по логам неэффективны.
- **Только MongoDB.** Плюс: один стек. Минус: транзакции и FK для unique constraint email — слабая сторона MongoDB. Дедупликация через `unique` index в MongoDB менее предсказуема.
- **PostgreSQL + ElasticSearch.** Плюс: search по логам мощный. Минус: избыточно для MVP, дорогой DevOps.

## Последствия

### Положительные
- PostgreSQL делает то, что умеет лучше всего (транзакции, FK, unique).
- MongoDB снимает нагрузку с PG для тяжёлых append-only логов.
- Worker может писать лог без блокировок основной БД.

### Отрицательные
- Двойной DevOps (две БД, два бэкапа, два мониторинга).
- Бизнес-логика чуть сложнее: репозитории для двух БД.
- Транзакционность между логом и обновлением Lead — eventual consistency.

### Нейтральные
- Команде нужно знать обе БД.

## Связанные документы

- [Сущности и технологии хранения](../04-data-model/entities)
- [NFR-01, NFR-10](../02-requirements/non-functional)

## История изменений

| Дата | Изменение | Автор |
|---|---|---|
| 2026-04-15 | Создан, Accepted | Arina Nikolaeva |
