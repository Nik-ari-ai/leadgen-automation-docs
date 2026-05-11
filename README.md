# LeadGen Automation — Documentation

Техническая документация продукта **LeadGen Automation**, собранная в формате Docs-as-Code на Docusaurus и опубликованная на GitHub Pages.

🌐 **Сайт:** https://nik-ari-ai.github.io/leadgen-automation-docs/

## Стек

- [Docusaurus 3](https://docusaurus.io/) — генератор статического сайта
- [redocusaurus](https://redocusaurus.vercel.app/) — рендер OpenAPI-спецификации
- [docusaurus-plugin-drawio](https://github.com/Mati365/docusaurus-plugin-drawio) — встраивание .drawio
- [@akebifiky/remark-simple-plantuml](https://github.com/akebifiky/remark-simple-plantuml) — PlantUML из markdown
- GitHub Actions + GitHub Pages — деплой

## Содержание

- **Концепция и стейкхолдеры** — описание продукта, заинтересованные лица, RACI-матрица
- **Требования** — функциональные (UC-FR-01..05), нефункциональные (NFR-01..11), use case диаграмма, sequence
- **Архитектура** — C4 (Context / Container / Component), BPMN, DMN
- **Модель данных** — ER-диаграммы трёх уровней
- **UI** — описание основных экранов
- **API** — OpenAPI 3.0 + Redoc
- **Стратегия платформизации**
- **ADR** — Architecture Decision Records

## Локальный запуск

```bash
cd my-website
npm install
npm start
# → http://localhost:3000/leadgen-automation-docs/
```

## Сборка для прода

```bash
cd my-website
npm run build
npm run serve  # локально проверить
```

## Деплой

Автоматический деплой на GitHub Pages при push в ветку `main` через GitHub Actions (см. `.github/workflows/deploy.yml`).

Подробная инструкция по первичной настройке — в [`INSTRUCTION.md`](./INSTRUCTION.md).

## Автор

Arina Nikolaeva ([@Nik-ari-ai](https://github.com/Nik-ari-ai))
