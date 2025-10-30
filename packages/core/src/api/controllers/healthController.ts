/**
 * @file Contains the controller logic for handling health check requests.
 *
 * This controller provides an endpoint to verify the status of the API and its
 * critical dependencies, such as the database and Redis. A robust health check
 * is essential for monitoring and container orchestration systems (like Kubernetes).
 */

import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import IORedis from 'ioredis';
import logger from '../../lib/logger';

// Use a new Redis connection for health checks to avoid interfering with BullMQ/Rate Limiter clients.
const redisHealthClient = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 0, // Fail fast for health checks
  connectTimeout: 2000, // 2-second timeout
});

interface HealthStatus {
  status: 'ok' | 'error';
  message: string;
  details?: {
    api: string;
    database: string;
    redis: string;
  };
}

/**
 * @controller checkHealth
 * @description Checks the health of the API and its dependencies.
 *
 * This function performs the following checks:
 * 1.  A basic API check (always 'ok' if the endpoint is reachable).
 * 2.  A database check by running a simple, fast query.
 * 3.  A Redis check by sending a 'PING' command.
 *
 * If all checks pass, it returns a 200 OK. If any check fails, it returns a
 * 503 Service Unavailable with details about the failure.
 *
 * @route GET /api/v1/health
 * @access Public
 */
export const checkHealth = async (
  req: Request,
  res: Response<HealthStatus>,
) => {
  let dbStatus: 'ok' | 'error' = 'ok';
  let redisStatus: 'ok' | 'error' = 'ok';

  try {
    // 1. Check database connectivity
    // `prisma.$queryRaw` is a lightweight way to test the connection.
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = 'error';
    logger.error({ err: error }, 'Health check failed: Database connection error.');
  }

  try {
    // 2. Check Redis connectivity
    await redisHealthClient.ping();
  } catch (error) {
    redisStatus = 'error';
    logger.error({ err: error }, 'Health check failed: Redis connection error.');
  }

  const isHealthy = dbStatus === 'ok' && redisStatus === 'ok';
  const statusCode = isHealthy ? 200 : 503;

  return res.status(statusCode).json({
    status: isHealthy ? 'ok' : 'error',
    message: isHealthy
      ? 'All systems operational'
      : 'One or more systems are experiencing issues',
    details: {
      api: 'ok',
      database: dbStatus,
      redis: redisStatus,
    },
  });
};
