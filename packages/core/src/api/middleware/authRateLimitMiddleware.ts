/**
 * @file Contains rate limiting middleware for authentication endpoints.
 * This middleware uses IP-based rate limiting to prevent brute-force and DoS attacks.
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import IORedis from 'ioredis';
import logger from '../../lib/logger';

// Create a dedicated Redis client for auth rate limiting
const redisClient = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

redisClient.on('error', (err) => {
  logger.error({ err }, '[AuthRateLimiter] Redis connection error');
});

// Rate limiter for authentication endpoints (login/register)
// Settings configurable via environment variables
const authRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'auth_rate_limit',
  points: parseInt(process.env.AUTH_RATE_LIMIT_POINTS ?? '5', 10), // Number of requests
  duration: parseInt(process.env.AUTH_RATE_LIMIT_DURATION ?? '900', 10), // Per 900 seconds (15 minutes)
  blockDuration: parseInt(process.env.AUTH_RATE_LIMIT_BLOCK_DURATION ?? '900', 10), // Block for 15 minutes if limit exceeded
});

/**
 * @middleware authRateLimitMiddleware
 * @description An Express middleware that rate limits authentication endpoints by IP address.
 * This prevents brute-force and DoS attacks on login/register endpoints.
 *
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The function to call to pass control to the next middleware.
 */
export const authRateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  // Get the client IP address
  const clientIp = req.ip ?? req.socket.remoteAddress ?? 'unknown';

  try {
    await authRateLimiter.consume(clientIp);
    return next();
  } catch (rateLimiterRes: any) {
    if (rateLimiterRes.remainingPoints !== undefined) {
      // Rate limit exceeded
      const msBeforeNext = rateLimiterRes.msBeforeNext ?? authRateLimiter.duration * 1000;
      const secondsUntilReset = Math.ceil(msBeforeNext / 1000);
      
      res.setHeader('Retry-After', secondsUntilReset);
      res.setHeader('X-RateLimit-Limit', authRateLimiter.points);
      res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + msBeforeNext).toISOString());
      
      logger.warn(
        { clientIp, path: req.path },
        'Auth rate limit exceeded for IP address',
      );

      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many authentication attempts. Please try again in ${secondsUntilReset} second(s).`,
        },
      });
    }

    // Log other errors but allow request to proceed (fail-open strategy)
    logger.error(
      { error: rateLimiterRes, clientIp },
      'Auth rate limiter error - allowing request to proceed (fail open)',
    );
    return next();
  }
};
