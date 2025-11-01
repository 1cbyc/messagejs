---
id: project-structure
title: Project Structure
sidebar_position: 6
---

# Project Structure

MessageJS follows a monorepo structure using npm workspaces.

## Monorepo Overview

```
messagejs/
├── packages/
│   ├── core/              # Backend API
│   ├── client/            # Frontend SDK
│   ├── dashboard/         # React/Next.js dashboard
│   ├── docs/              # Documentation (Docusaurus)
│   ├── website/           # Marketing website (Next.js)
│   ├── examples/          # Example apps & demos
│   └── shared-types/      # Shared TypeScript types
├── docker-compose.yml     # PostgreSQL & Redis setup
└── package.json           # Root package.json
```

## Package Details

### `@messagejs/core`

Backend API built with Express.js and TypeScript.

**Structure:**
```
packages/core/
├── src/
│   ├── api/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # Route definitions
│   │   ├── middleware/    # Auth, validation, rate limiting
│   │   └── validation/    # Zod schemas
│   ├── lib/               # Utilities (logger, Prisma)
│   ├── queues/            # BullMQ workers
│   └── connectors/        # Platform connectors
└── prisma/                # Database schema
```

### `@nsisong/messagejs`

Frontend SDK for browsers and Node.js.

**Structure:**
```
packages/client/
├── src/
│   ├── index.ts          # Main entry point
│   ├── client.ts         # Client implementation
│   └── types.ts          # Type definitions
├── dist/                 # Built files
└── package.json
```

### `@messagejs/dashboard`

React/Next.js dashboard for project management.

**Structure:**
```
packages/dashboard/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── page.tsx      # Home page
│   │   ├── login/        # Login page
│   │   └── register/     # Registration page
│   ├── components/       # React components
│   │   └── ui/          # UI components
│   └── lib/             # Utilities and API client
└── public/              # Static assets
```

### `@messagejs/website`

Marketing website.

**Structure:**
```
packages/website/
├── src/
│   ├── app/
│   │   ├── page.tsx      # Landing page
│   │   └── layout.tsx    # Root layout
│   └── components/       # React components
└── public/               # Static assets
```

### `@messagejs/docs`

Documentation site using Docusaurus.

**Structure:**
```
packages/docs/
├── docs/                 # Documentation markdown
├── src/
│   └── css/
│       └── custom.css    # Custom styles
├── static/
│   └── img/              # Images and logos
└── docusaurus.config.js  # Docusaurus config
```

### `@messagejs/shared-types`

Shared TypeScript types used across packages.

**Structure:**
```
packages/shared-types/
├── src/
│   ├── index.ts          # Main exports
│   ├── apiTypes.ts       # API type definitions
│   ├── dataModels.ts     # Data model types
│   ├── security.ts       # Security types
│   └── connector.ts      # Connector types
└── package.json
```

## Shared Resources

### Docker Compose

Defines local development services:

```yaml
services:
  postgres:
    # PostgreSQL database
  redis:
    # Redis cache and queues
```

### Environment Variables

Shared configuration via `.env`:

```env
DATABASE_URL=postgresql://...
REDIS_HOST=localhost
JWT_SECRET=...
ENCRYPTION_KEY=...
```

## Development Workflow

### Running All Services

```bash
npm run dev
```

### Running Individual Services

```bash
npm run core       # Backend API
npm run dashboard  # Dashboard
npm run website    # Marketing site
npm run client     # Build SDK in watch mode
```

### Building

```bash
npm run build      # Build all packages
```

### Testing

```bash
npm run test       # Run all tests
npm run typecheck  # Type check all packages
npm run lint       # Lint all packages
```

## Next Steps

- [Data Flow](./data-flow)
- [Technology Stack](./technology-stack)
- [Core Components](./core-components) (coming soon)

