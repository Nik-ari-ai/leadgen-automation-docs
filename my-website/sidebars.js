// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'intro',
    {
      type: 'category',
      label: '1. Концепция и стейкхолдеры',
      collapsed: false,
      items: [
        '01-concept/overview',
        '01-concept/stakeholders',
        '01-concept/raci-matrix',
        '01-concept/interview-questions',
      ],
    },
    {
      type: 'category',
      label: '2. Требования',
      collapsed: false,
      items: [
        '02-requirements/functional',
        '02-requirements/non-functional',
        '02-requirements/use-case-diagram',
        '02-requirements/sequence-diagram',
      ],
    },
    {
      type: 'category',
      label: '3. Архитектура',
      collapsed: false,
      items: [
        '03-architecture/c4-context',
        '03-architecture/c4-container',
        '03-architecture/c4-component',
        '03-architecture/bpmn',
        '03-architecture/dmn',
      ],
    },
    {
      type: 'category',
      label: '4. Модель данных',
      collapsed: false,
      items: [
        '04-data-model/entities',
        '04-data-model/erd-conceptual',
        '04-data-model/erd-logical',
        '04-data-model/erd-physical',
      ],
    },
    {
      type: 'category',
      label: '5. UI / Экраны',
      collapsed: true,
      items: [
        '05-ui/screens',
      ],
    },
    {
      type: 'category',
      label: '6. API',
      collapsed: true,
      items: [
        '06-api/api-overview',
      ],
    },
    {
      type: 'category',
      label: '7. Стратегия платформизации',
      collapsed: true,
      items: [
        '07-platform/platformization',
      ],
    },
    {
      type: 'category',
      label: '8. ADR — Architecture Decision Records',
      collapsed: true,
      items: [
        '08-adr/adr-template',
        '08-adr/adr-001-storage-strategy',
        '08-adr/adr-002-ai-provider',
      ],
    },
  ],
};

module.exports = sidebars;
