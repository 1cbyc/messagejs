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
│   ├── examples/              # Example apps & SDK demos
│   │   ├── react-demo/
│   │   ├── node-demo/
│   │   └── README.md
│   │
│   └── shared-types/          # Shared Types
│       ├── src/
│       ├── package.json
│       └── README.md
│
├── .gitignore
├── LICENSE
├── README.md
├── package.json           # Monorepo root
└── turbo.json or nx.json  # (if using Turborepo or Nx)

<!-- shorter summary -->
messagejs/
├── packages/
│   ├── core/              # Backend API
│   ├── client/            # Frontend SDK
│   ├── dashboard/         # React/Next.js dashboard NEW
│   ├── docs/              # Documentation (Docusaurus) NEW
│   ├── examples/          # Example apps & demos NEW
│   └── shared-types/      # Shared types


<!-- another short brief description -->
messagejs/
├── packages/
│   ├── core/              # Backend API
│   │   ├── src/
│   │   │   ├── api/
│   │   │   │   ├── controllers/   # Request handlers
│   │   │   │   ├── routes/        # Route definitions
│   │   │   │   ├── middleware/    # Auth, validation, rate limiting
│   │   │   │   └── validation/    # Zod schemas
│   │   │   ├── lib/               # Utilities (logger, Prisma)
│   │   │   └── queues/            # BullMQ workers
│   │   └── prisma/                # Database schema
│   ├── dashboard/         # Frontend UI (Next.js)
│   ├── client/            # TypeScript SDK
│   └── shared-types/      # Shared TypeScript types
├── docker-compose.yml     # PostgreSQL & Redis setup
└── package.json          # Root package.json (monrepo)
