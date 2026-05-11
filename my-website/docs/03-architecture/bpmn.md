---
title: BPMN — Бизнес-процесс
sidebar_position: 4
description: BPMN модель полного процесса подготовки базы лидов
---

# BPMN: Подготовка базы лидов к outbound

Модель покрывает полный путь от загрузки CSV до выгрузки в Instantly.ai. Содержит:

- **2 lane** — Система LeadGen и SDR / Пользователь
- **3 внешних pool** — Источник данных (CSV/Google Sheets), OpenAI API, Instantly.ai
- **4 message flow** — между внешними pool и системой
- **Шлюзы**: валидация данных, дубли найдены, бюджет OK, оценка качества AI
- **Business Rule Task** — оценка качества AI-ответа (ссылка на DMN)

## Файл BPMN

Исходник доступен в репозитории: [`/diagrams/leadgen.bpmn`](https://github.com/Nik-ari-ai/leadgen-automation-docs/blob/main/my-website/diagrams/leadgen.bpmn).

Открыть в [Camunda Modeler](https://camunda.com/download/modeler/) или [bpmn.io](https://demo.bpmn.io/).

## Поток процесса

### Импорт
1. SDR загружает CSV → система парсит → валидирует
2. Шлюз: данные валидны?
   - **Нет** → завершение с ошибкой "невалидные данные"
   - **Да** → создать лидов + сохранить отчёт импорта

### Дедупликация
3. Система ищет дубли
4. Шлюз: дубли найдены?
   - **Нет** → пропустить шаг
   - **Да** → SDR выбирает master → merge с логированием

### Enrichment
5. Проверить бюджет
6. Шлюз: бюджет OK?
   - **Нет** → завершение "лимит достигнут"
   - **Да** → SDR выбирает шаблон промпта → отправка в OpenAI
7. Парсинг ответа AI → заполнение полей → лог enrichment
8. **Business Rule Task**: оценить качество (DMN, см. [DMN](./dmn))
9. Шлюз: результат оценки?
   - **auto_accept** → дальше к экспорту
   - **needs_review** → SDR проверяет вручную, при необходимости правит
   - **reject** → поля не записываются

### Экспорт
10. Валидировать готовых лидов под Instantly
11. Сгенерировать CSV → отправить в Instantly.ai → лог экспорта

## Внешние участники

| Pool | Назначение | Тип взаимодействия |
| --- | --- | --- |
| Источник данных | CSV / Google Sheets | message flow → Start_Import |
| OpenAI API | AI-обогащение | message flow ↔ Task_SendAI / Task_ParseAI |
| Instantly.ai | Outbound-инструмент | message flow ← Task_GenCSV |

## Visual

> 📎 Файл `leadgen.bpmn` лежит в [`my-website/diagrams/`](https://github.com/Nik-ari-ai/leadgen-automation-docs/tree/main/my-website/diagrams). Открой в Camunda Modeler для редактирования и просмотра визуального представления.
>
> **TODO:** добавить экспортированный PNG / SVG диаграммы в `static/img/bpmn-leadgen.svg` и встроить сюда через `![BPMN](/img/bpmn-leadgen.svg)`.
