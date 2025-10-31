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
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
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
          {
            href: 'https://app.messagejs.pro',
            label: 'Dashboard',
            position: 'right',
          },
          {
            href: 'https://github.com/1cbyc/messagejs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} MessageJS. Built with Docusaurus.`,
        links: [
          {
            title: 'Product',
            items: [
              {
                label: 'Features',
                href: 'https://messagejs.pro#features',
              },
              {
                label: 'Pricing',
                href: 'https://messagejs.pro#pricing',
              },
              {
                label: 'Integrations',
                href: 'https://messagejs.pro#integrations',
              },
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'Documentation',
                to: '/intro',
              },
              {
                label: 'Dashboard',
                href: 'https://app.messagejs.pro',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/1cbyc/messagejs',
              },
            ],
          },
          {
            title: 'Company',
            items: [
              {
                label: 'About',
                href: 'https://messagejs.pro#about',
              },
              {
                label: 'Contact',
                href: 'https://messagejs.pro#contact',
              },
            ],
          },
        ],
      },
    }),
};

module.exports = config;
