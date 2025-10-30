/**
 * @file Initializes and exports a singleton instance of the Prisma Client.
 *
 * This approach is a best practice for using Prisma in a Node.js application.
 * By instantiating the client in a dedicated module, we ensure that only one
 * instance of PrismaClient is created and used throughout the application's lifecycle.
 * This prevents connection pooling issues and improves performance.
 *
 * The client is also extended with Prisma Accelerate to leverage high-performance
 * connection pooling for our cloud-hosted database.
 */

import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the Prisma Client instance.
// This is a workaround to prevent re-initialization during hot-reloading in development.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Instantiate the Prisma Client.
// If `globalThis.prisma` already exists (from a previous hot-reload), reuse it.
// Otherwise, create a new instance.
// Note: Accelerate extension temporarily removed due to type compatibility issues
const prisma = globalThis.prisma ?? new PrismaClient();

// In development, assign the new instance to the global variable.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * The singleton instance of the Prisma Client, configured with Accelerate.
 * Import this instance into your services, controllers, or any other file
 * where you need to interact with the database.
 *
 * @example
 * import prisma from '@/lib/prisma';
 *
 * const users = await prisma.user.findMany();
 */
export default prisma;
