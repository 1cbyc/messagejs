messagejs/
├── packages/
│   ├── core/              # Backend API
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── client/            # Frontend SDK (npm)
│   │   ├── src/
│   │   ├── dist/
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── dashboard/         # React/Next.js dashboard
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── docs/              # Documentation (Docusaurus)
│   │   ├── docs/
│   │   ├── docusaurus.config.js
│   │   └── package.json
│   │
│   └── examples/          # Example apps & SDK demos
│       ├── react-demo/
│       ├── node-demo/
│       └── README.md
│
├── .gitignore
├── LICENSE
├── README.md
├── package.json           # Monorepo root
└── turbo.json or nx.json  # (if using Turborepo or Nx)
