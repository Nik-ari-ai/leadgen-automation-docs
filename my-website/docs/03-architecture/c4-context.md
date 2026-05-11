---
title: C4 — Context (Уровень 1)
sidebar_position: 1
description: Контекст системы LeadGen Automation — внешние пользователи и системы
---

# C4: System Context

Контекстная диаграмма показывает LeadGen Automation как чёрный ящик в окружении пользователей и внешних систем.

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

LAYOUT_WITH_LEGEND()

title System Context: LeadGen Automation

Person(sdr, "SDR / LeadGen", "Импортирует, обогащает и подготавливает базы лидов")
Person(growth, "Growth / Marketing", "Запускает кампании, выгружает финальную базу")
Person(admin, "Руководитель", "Управляет лимитами AI, смотрит аналитику")

System(leadgen, "LeadGen Automation", "Подготовка лидов к outbound: импорт → дедупликация → AI enrichment → экспорт")

System_Ext(openai, "OpenAI API", "AI-обогащение полей лида")
System_Ext(gsheets, "Google Sheets API", "Источник данных для импорта")
System_Ext(instantly, "Instantly.ai", "Outbound-инструмент, принимает CSV")

Rel(sdr, leadgen, "Импортирует лидов, запускает enrichment, правит вручную")
Rel(growth, leadgen, "Выгружает базу под кампанию")
Rel(admin, leadgen, "Настраивает лимиты, смотрит аналитику")

Rel(leadgen, openai, "Запросы на enrichment", "HTTPS")
Rel(leadgen, gsheets, "Читает данные таблицы", "HTTPS, OAuth 2.0")
Rel(leadgen, instantly, "Выгружает CSV", "Файл")
@enduml
```

## Описание

**LeadGen Automation** — единая точка работы с базой лидов. Система:
- принимает данные от пользователей (CSV / Google Sheets);
- хранит и обрабатывает их внутри (дедупликация, enrichment, экспорт);
- общается с OpenAI для AI-обогащения;
- отдаёт готовый CSV для загрузки в Instantly.

## Внешние пользователи

| Актор | Цель |
| --- | --- |
| SDR / LeadGen | Получить чистую обогащённую базу для outbound |
| Growth | Запустить кампанию по готовой базе |
| Руководитель | Контролировать расходы и качество результата |

## Внешние системы

| Система | Назначение |
| --- | --- |
| OpenAI API | LLM-провайдер для enrichment |
| Google Sheets API | Источник данных |
| Instantly.ai | Outbound-инструмент-получатель |
