# Testing Guide

This package uses **Vitest** for testing. All tests use **real dependencies** - no mocks or shortcuts.

## Prerequisites

### 1. PostgreSQL Test Database

You need a PostgreSQL database for tests:

```bash
# Create test database
createdb messagejs_test

# Or using PostgreSQL client
psql -c "CREATE DATABASE messagejs_test;"
```

### 2. Redis (Optional for some tests)

Some tests require Redis for queue functionality. If Redis is not available, those tests will skip queue verification but still test database operations.

```bash
# Start Redis locally (if not using Docker)
redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### 3. Environment Variables

Set these environment variables for tests:

```bash
# Required
export TEST_DATABASE_URL="postgresql://user:password@localhost:5432/messagejs_test"
export JWT_SECRET="test-jwt-secret-key-for-testing-only"
export ENCRYPTION_KEY="test-encryption-key-32-bytes-long!!"

# Optional (defaults to localhost)
export REDIS_URL="redis://localhost:6379"
```

Or create a `.env.test` file:

```env
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/messagejs_test
DATABASE_URL=postgresql://user:password@localhost:5432/messagejs_test
JWT_SECRET=test-jwt-secret-key-for-testing-only
ENCRYPTION_KEY=test-encryption-key-32-bytes-long!!
REDIS_URL=redis://localhost:6379
NODE_ENV=test
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

- **Unit Tests**: `src/api/controllers/*.test.ts` - Test individual endpoints
- **Integration Tests**: `src/test/integration/*.test.ts` - Test complete flows
- **Test Utilities**: `src/test/` - Shared test helpers and setup

## Database Cleanup

Tests automatically clean the database before each test to ensure isolation. The `cleanDatabase()` function in `src/test/setup.ts` handles this.

## No Mocks

All tests use:
- **Real Prisma client** - Connected to test database
- **Real Express app** - Full middleware stack
- **Real authentication** - JWT tokens and API keys from database
- **Real Redis/BullMQ** - When available (gracefully handles missing Redis)

Tests verify actual database operations, HTTP responses, and queue behavior.

