/**
 * @file Test setup and utilities for API testing
 * Uses real database connections - no mocks
 */

import { afterAll, beforeEach, beforeAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import IORedis from 'ioredis';
import { validateTestEnvironment, setupTestDatabase } from './test-env-setup';

// Validate test environment on module load
validateTestEnvironment();

// Ensure we have a database URL for tests
const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    'TEST_DATABASE_URL or DATABASE_URL environment variable is required for tests. ' +
    'Set TEST_DATABASE_URL=postgresql://user:password@localhost:5432/messagejs_test'
  );
}

// Create a test Prisma client instance using the test database
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.LOG_LEVEL === 'debug' ? ['query', 'info', 'warn', 'error'] : [],
});

// Run database migrations and verify connection before all tests
beforeAll(async () => {
  // Run migrations to ensure database schema is up to date
  await setupTestDatabase();

  // Test database connection
  try {
    await testPrisma.$connect();
    // Run a simple query to verify connection
    await testPrisma.$queryRaw`SELECT 1`;
    console.log('✅ Test database connection verified');
  } catch (error) {
    throw new Error(
      `Failed to connect to test database at ${databaseUrl.replace(/:[^:]*@/, ':****@')}. ` +
      `Please ensure:\n` +
      `1. The database exists: CREATE DATABASE messagejs_test;\n` +
      `2. The user has proper permissions\n` +
      `3. The connection string is correct\n` +
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}, 30000); // 30 second timeout for setup

// Clean database before each test
export async function cleanDatabase() {
  // Delete in order of dependencies
  await testPrisma.messageLog.deleteMany();
  await testPrisma.template.deleteMany();
  await testPrisma.service.deleteMany();
  await testPrisma.apiKey.deleteMany();
  await testPrisma.project.deleteMany();
  await testPrisma.user.deleteMany();
}

// Setup and teardown hooks
beforeEach(async () => {
  await cleanDatabase();
  
  // Clean up Redis rate limiting keys before each test
  try {
    const redisUrl = process.env.REDIS_URL || process.env.TEST_REDIS_URL;
    if (redisUrl) {
      const redisClient = new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
        lazyConnect: true,
      });
      try {
        await redisClient.connect();
        // Delete all rate limiter keys
        const keys = await redisClient.keys('*rate_limit*');
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
        await redisClient.quit();
      } catch (error) {
        // Ignore Redis errors in test environment
      }
    }
  } catch (error) {
    // Ignore Redis cleanup errors
  }
});

afterAll(async () => {
  await cleanDatabase();
  await testPrisma.$disconnect();
});

