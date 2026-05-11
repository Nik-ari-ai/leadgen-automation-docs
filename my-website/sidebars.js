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
        'concept/overview',
        'concept/stakeholders',
        'concept/raci-matrix',
        'concept/interview-questions',
      ],
    },
    {
      type: 'category',
      label: '2. Требования',
      collapsed: false,
      items: [
        'requirements/functional',
        'requirements/non-functional',
        'requirements/use-case-diagram',
        'requirements/sequence-diagram',
      ],
    },
    {
      type: 'category',
      label: '3. Архитектура',
      collapsed: false,
      items: [
        'architecture/c4-context',
        'architecture/c4-container',
        'architecture/c4-component',
        'architecture/bpmn',
        'architecture/dmn',
      ],
    },
    {
      type: 'category',
      label: '4. Модель данных',
      collapsed: false,
      items: [
        'data-model/entities',
        'data-model/erd-conceptual',
        'data-model/erd-logical',
        'data-model/erd-physical',
      ],
    },
    {
      type: 'category',
      label: '5. UI / Экраны',
      collapsed: true,
      items: [
        'ui/screens',
      ],
    },
    {
      type: 'category',
      label: '6. API',
      collapsed: true,
      items: [
        'api/api-overview',
      ],
    },
    {
      type: 'category',
      label: '7. Стратегия платформизации',
      collapsed: true,
      items: [
        'platform/platformization',
      ],
    },
    {
      type: 'category',
      label: '8. ADR — Architecture Decision Records',
      collapsed: true,
      items: [
        'adr/adr-template',
        'adr/adr-001-storage-strategy',
        'adr/adr-002-ai-provider',
      ],
    },
  ],
};

module.exports = sidebars;
