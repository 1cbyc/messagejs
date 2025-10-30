/**
 * @file Configures and exports a centralized logger instance for the application.
 *
 * This module uses Pino, a fast JSON logger for Node.js. It provides structured
 * logging with different levels (info, warn, error, debug) and automatic
 * serialization of error objects.
 *
 * In development, logs are prettified for readability.
 * In production, logs are output as JSON for easy parsing by log aggregation tools.
 */

import pino from 'pino';
import pinoHttp from 'pino-http';

/**
 * The environment we're running in (development, production, test)
 */
const environment = process.env.NODE_ENV || 'development';

/**
 * Determine if we should use pretty printing for logs
 * Pretty printing is enabled in development for better readability
 */
const isDevelopment = environment === 'development';

/**
 * The main logger instance.
 *
 * Configuration:
 * - `level`: Set via LOG_LEVEL env var, defaults to 'info'
 * - `transport`: Only in development - uses pino-pretty for readable console output
 * - `formatters`: Customize how logs are formatted
 * - `timestamp`: Add timestamps to all log entries
 * - `redact`: Remove sensitive information from logs
 */
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  redact: {
    paths: [
      'password',
      'passwordHash',
      'accessToken',
      'credentials',
      'apiKey',
      'authorization',
    ],
    remove: true,
  },
});

/**
 * HTTP request logging middleware for Express.
 * This automatically logs all incoming HTTP requests with their method, URL,
 * status code, response time, and any errors.
 */
export const httpLogger = pinoHttp({
  logger,
  serializers: {
    req: (req: any) => ({
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      headers: {
        'user-agent': req.headers['user-agent'],
        host: req.headers.host,
      },
    }),
    res: (res: any) => ({
      statusCode: res.statusCode,
    }),
  },
});

/**
 * Export the configured logger instance.
 * Use this throughout the application for consistent logging.
 *
 * @example
 * import logger from '@/lib/logger';
 *
 * logger.info({ userId: '123' }, 'User logged in');
 * logger.error({ err }, 'Database connection failed');
 */
export default logger;
