/**
 * @file Contains the rate limiting middleware for the Express application.
 *
 * This middleware uses Redis to enforce rate limits on API endpoints,
 * preventing abuse and ensuring fair usage. It is designed to be applied
 * to protected routes after authentication has occurred.
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import IORedis from 'ioredis';
import logger from '../../lib/logger';

// --- Rate Limiter Configuration ---

// Create a single, reusable Redis connection client.
const redisClient = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

redisClient.on('error', (err) => {
  logger.error({ err }, '[RateLimiter] Redis connection error');
});

// Rate limits are determined dynamically per API key inside the middleware.

/**
 * @middleware rateLimitMiddleware
 * @description An Express middleware that consumes a point for the incoming API key.
 * If the API key has made too many requests, it blocks the request with a 429 error.
 *
 * This middleware MUST run *after* the `validateApiKey` middleware, as it relies
 * on `req.apiKey.id` to identify the client.
 */
export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  const apiKeyId = req.apiKey?.id;
  // The rateLimit is now available on the apiKey object from the auth middleware.
  const apiKeyRateLimit = req.apiKey?.rateLimit;

  if (!apiKeyId) {
    // This should not happen if the auth middleware runs first, but as a safeguard:
    logger.error(
      { reqId: req.id },
      '[RateLimiter] Error: API key ID not found on request object.',
    );
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not identify the client for rate limiting.',
      },
    });
  }

  // --- Dynamic Limiter Creation ---
  // The rate limit is defined as requests per hour in the schema.
  const points = apiKeyRateLimit || 1000; // Default to 1000 reqs/hour if not set.
  const duration = 3600; // 1 hour in seconds.

  const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rate_limit',
    points: points,
    duration: duration,
  });

  try {
    // Consume a point for the given API key ID.
    await limiter.consume(apiKeyId);

    // If consumption is successful, the request is within limits. Proceed.
    return next();
  } catch (rateLimiterRes: any) {
    // Check if this is a rate limit error (has remainingPoints property)
    if (rateLimiterRes.remainingPoints !== undefined) {
      // This is a valid rate limit error - the user exceeded the limit
      const msBeforeNext = rateLimiterRes.msBeforeNext || duration * 1000;
      const secondsUntilReset = Math.ceil(msBeforeNext / 1000);

      // Set standard rate limiting headers on the response.
      res.setHeader('Retry-After', secondsUntilReset);
      res.setHeader('X-RateLimit-Limit', points);
      res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(Date.now() + msBeforeNext).toISOString(),
      );

      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Please try again in ${secondsUntilReset} second(s).`,
        },
      });
    }

    // This is likely a Redis connection error or other unexpected error
    // Log it and allow the request to proceed (fail open) to prevent cascading failures
    logger.error(
      { error: rateLimiterRes, apiKeyId },
      'Rate limiter error - allowing request to proceed (fail open)',
    );

    // Allow the request to proceed rather than blocking all traffic
    return next();
  }
};
