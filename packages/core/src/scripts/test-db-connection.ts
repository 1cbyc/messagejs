/**
 * @file A simple script to test the database connection via Prisma Client.
 *
 * This script imports the configured Prisma instance (which should be using Accelerate)
 * and attempts to fetch all users from the database. It's a quick way to verify
 * that the connection string is correct and the database is reachable.
 *
 * To run this script from the root of the monorepo:
 * npx ts-node --require dotenv/config packages/core/src/scripts/test-db-connection.ts
 */

import prisma from '../lib/prisma';
import logger from '../lib/logger';

async function main() {
  logger.info('Attempting to connect to the database via Prisma Accelerate and fetch users...');

  try {
    const users = await prisma.user.findMany();

    if (users.length === 0) {
      logger.warn('✅ Connection successful, but no users were found in the database.');
    } else {
      logger.info(`✅ Connection successful! Found ${users.length} user(s):`);
      console.log(users);
    }
  } catch (error) {
    logger.error({ err: error }, '❌ Failed to connect to the database or execute the query.');
    // Exit with a non-zero code to indicate failure, which is useful for scripting.
    process.exit(1);
  } finally {
    // It's crucial to disconnect from the database to allow the script to exit gracefully.
    await prisma.$disconnect();
    logger.info('Database connection closed.');
  }
}

// Execute the main function.
main();
