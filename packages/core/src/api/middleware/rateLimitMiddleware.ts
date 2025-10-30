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

// Configure the rate limiter options.
// For this implementation, we'll use a default limit for all keys.
// A more advanced implementation (as per the design docs) would fetch
// custom rate limit configurations per API key or project.
const limiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rate_limit', // A namespace for all rate limit keys in Redis
  points: 10, // Max 10 requests...
  duration: 1, // ...per 1 second.
});

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

  try {
    // Consume a point for the given API key ID.
    await limiter.consume(apiKeyId);

    // If consumption is successful, the request is within limits. Proceed.
    return next();
  } catch (rateLimiterRes) {
    // If an error is caught, it means the rate limit has been exceeded.
    // The error object contains details about when the limit will reset.

    const seconds_until_reset = Math.ceil(rateLimiterRes.msBeforeNext / 1000);

    // Set standard rate limiting headers on the response.
    res.setHeader('Retry-After', seconds_until_reset);
    res.setHeader('X-RateLimit-Limit', limiter.points);
    res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());

    return res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Please try again in ${seconds_until_reset} second(s).`,
      },
    });
  }
};
