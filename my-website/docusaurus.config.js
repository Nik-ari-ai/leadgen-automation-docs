// @ts-check
// Docusaurus config для LeadGen Automation Docs

const simplePlantUML = require('@akebifiky/remark-simple-plantuml');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'LeadGen Automation',
  tagline: 'Техническая документация продукта',
  favicon: 'img/favicon.ico',

  // GitHub Pages: https://Nik-ari-ai.github.io/leadgen-automation-docs/
  url: 'https://nik-ari-ai.github.io',
  baseUrl: '/leadgen-automation-docs/',

  organizationName: 'Nik-ari-ai',
  projectName: 'leadgen-automation-docs',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'ru',
    locales: ['ru'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          remarkPlugins: [
            [simplePlantUML, { baseUrl: 'https://www.plantuml.com/plantuml/svg' }],
          ],
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
    // redocusaurus — рендер OpenAPI-спеки
    [
      'redocusaurus',
      {
        specs: [
          {
            id: 'leadgen-api',
            spec: 'api_specs/leadgen-api.yml',
            route: '/api/leadgen/',
          },
        ],
        theme: {
          primaryColor: '#1976d2',
        },
      },
    ],
  ],

  plugins: [
    // draw.io — встраивание .drawio файлов
    'docusaurus-plugin-drawio',
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'LeadGen Automation',
        logo: {
          alt: 'LeadGen Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Документация',
          },
          {
            to: '/api/leadgen/',
            label: 'API',
            position: 'left',
          },
          {
            href: 'https://github.com/Nik-ari-ai/leadgen-automation-docs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `© ${new Date().getFullYear()} LeadGen Automation. Built with Docusaurus.`,
      },
      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: true,
      },
    }),
};

module.exports = config;
