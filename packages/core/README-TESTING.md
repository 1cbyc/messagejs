# Testing Guide

This guide explains how to set up and run tests for the MessageJS Core API.

## Prerequisites

### 1. PostgreSQL Database

You need a test database. Create one:

```bash
# Using PostgreSQL CLI
createdb messagejs_test

# Or using psql
psql -U postgres -c "CREATE DATABASE messagejs_test;"
```

### 2. Redis (Optional but Recommended)

For full test coverage including queue verification:

```bash
# Install Redis locally or use Docker
docker run -d -p 6379:6379 redis:7-alpine
```

Or install locally:
- macOS: `brew install redis && brew services start redis`
- Linux: `sudo apt-get install redis-server && sudo systemctl start redis`

### 3. Environment Variables

Create a `.env.test` file in `packages/core/`:

```env
# Required
DATABASE_URL=postgresql://postgres:password@localhost:5432/messagejs_test
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/messagejs_test
JWT_SECRET=test-jwt-secret-key-for-testing-only
ENCRYPTION_KEY=test-encryption-key-32-bytes-long!!

# Optional but recommended
REDIS_URL=redis://localhost:6379
TEST_REDIS_URL=redis://localhost:6379

# Optional
LOG_LEVEL=silent
NODE_ENV=test
```

## Running Tests

```bash
# From project root
npm run test --workspace=@messagejs/core

# Or from packages/core directory
cd packages/core
npm test
```

## Test Structure

- **Unit Tests**: `src/api/controllers/*.test.ts`
  - Test individual controller functions
  - Use real database (testPrisma)
  - Clean database before each test

- **Integration Tests**: `src/test/integration/*.test.ts`
  - Test complete flows (e.g., message sending end-to-end)
  - Use real database and queue
  - Verify job queuing if Redis is available

## What Gets Tested

✅ **Real Database**: All tests use actual PostgreSQL connections  
✅ **Real Authentication**: JWT and API key validation use real crypto  
✅ **Real Services**: No mocks - tests use actual Prisma, Redis, BullMQ  
✅ **Data Isolation**: Database is cleaned before each test  

## Troubleshooting

### Database Connection Errors

```
Error: Failed to connect to test database
```

**Solution**: 
1. Ensure PostgreSQL is running
2. Check DATABASE_URL is correct
3. Verify database exists: `psql -l | grep messagejs_test`
4. Check user permissions

### Redis Connection Warnings

```
[RateLimiter] Redis connection error in test environment
```

**Solution**: 
- Tests will still run, but queue verification will be skipped
- To fix: Start Redis server or set REDIS_URL correctly
- Tests pass without Redis - only queue verification is skipped

### Migration Errors

If you see Prisma migration errors:
```bash
cd packages/core
npx prisma migrate deploy
npx prisma generate
```

## CI/CD

The GitHub Actions workflow automatically:
- Sets up PostgreSQL and Redis services
- Runs migrations
- Executes all tests
- Requires no manual setup

