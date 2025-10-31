/**
 * @file Test setup and utilities for API testing
 */

import { afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Create a test Prisma client instance
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

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
});

afterAll(async () => {
  await cleanDatabase();
  await testPrisma.$disconnect();
});

