module.exports = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'quick-start',
        'installation',
        'running-development',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture-overview',
        'project-structure',
        'data-flow',
        'technology-stack',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/examples-overview',
        'examples/react-demo',
        'examples/node-demo',
      ],
    },
    {
      type: 'doc',
      id: 'troubleshooting',
      label: 'Troubleshooting',
    },
  ],
};
