---
id: running-development
title: Running in Development
sidebar_position: 4
---

# Running in Development

This guide covers running MessageJS components in development mode.

## Starting Individual Services

### Core Backend API

```bash
# From root directory
npm run core

# Or from packages/core
cd packages/core
npm run dev
```

The API will start on `http://localhost:3001`

### Dashboard (React/Next.js)

```bash
# From root directory
npm run dashboard

# Or from packages/dashboard
cd packages/dashboard
npm run dev
```

The dashboard will start on `http://localhost:3000`

### Client SDK

```bash
# From root directory
npm run client

# Or from packages/client
cd packages/client
npm run dev
```

This starts the SDK in watch mode for development.

### Marketing Website

```bash
# From root directory
npm run website

# Or from packages/website
cd packages/website
npm run dev
```

The website will start on `http://localhost:3002`

## Running Everything Together

To run all services concurrently:

```bash
npm run dev
```

This starts all packages in parallel.

## Hot Reload

All services support hot reload:

- **Core API**: Restarts on file changes
- **Dashboard**: Next.js Fast Refresh
- **Website**: Next.js Fast Refresh
- **Client SDK**: Rebuilds on changes

## Environment Variables

Each package can have its own `.env` file:

```
.env                    # Root config (shared)
packages/core/.env      # Core API specific
packages/dashboard/.env # Dashboard specific
packages/website/.env   # Website specific
```

## Testing the API

### Health Check

```bash
curl http://localhost:3001/api/v1/health
```

### Send a Test Message

```bash
curl -X POST http://localhost:3001/api/v1/messages \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-test-api-key" \
  -d '{
    "to": "+1234567890",
    "channel": "whatsapp",
    "message": "Hello from MessageJS!"
  }'
```

## Database Management

### View Database with Prisma Studio

```bash
cd packages/core
npx prisma studio
```

Opens a GUI at `http://localhost:5555`

### Create a Migration

```bash
cd packages/core
npx prisma migrate dev --name your_migration_name
```

### Reset Database

```bash
cd packages/core
npx prisma migrate reset
```

⚠️ **Warning**: This deletes all data!

## Redis Commands

### Connect to Redis CLI

```bash
redis-cli
```

### Monitor Commands

```bash
redis-cli MONITOR
```

## Debugging

### Enable Debug Logging

Set environment variable:

```bash
DEBUG=* npm run core
```

Or in `.env`:

```env
DEBUG=*
```

### View Logs

```bash
# Core API logs
tail -f packages/core/logs/app.log

# Docker logs
docker-compose logs -f
```

## Type Checking

Run TypeScript type checking:

```bash
# Check all packages
npm run typecheck

# Check specific package
cd packages/core
npm run typecheck
```

## Linting

```bash
# Lint all packages
npm run lint

# Lint specific package
cd packages/dashboard
npm run lint
```

## Common Issues

### Port Conflicts

If a port is already in use:

```bash
# Find what's using the port
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules packages/*/node_modules
npm install
```

### Prisma Client Out of Sync

```bash
cd packages/core
npx prisma generate
```

## Next Steps

- [Architecture Overview](./architecture-overview)
- [Quick Start Guide](./quick-start)
- [API Reference](./api-reference) (coming soon)

