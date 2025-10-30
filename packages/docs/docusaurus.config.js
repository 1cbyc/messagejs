// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MessageJS',
  tagline: 'SendGrid, but for chat apps',
  favicon: 'img/logo.png',

  url: 'https://docs.messagejs.pro',
  baseUrl: '/',

  organizationName: 'messagejs',
  projectName: 'messagejs',

  onBrokenLinks: 'ignore',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'MessageJS',
        logo: {
          alt: 'MessageJS Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} MessageJS. Built with Docusaurus.`,
      },
    }),
};

module.exports = config;
