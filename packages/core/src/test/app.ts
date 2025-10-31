/**
 * @file Creates an Express app instance for testing
 */

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import messageRouter from '../api/routes/messageRoutes';
import webhookRouter from '../api/routes/webhookRoutes';
import healthRouter from '../api/routes/healthRoutes';
import authRouter from '../api/routes/authRoutes';
import metricsRouter from '../api/routes/metricsRoutes';
import projectRouter from '../api/routes/projectRoutes';
import internalRouter from '../api/routes/internalRoutes';
import docsRouter from '../api/routes/docsRoutes';
import logger from '../lib/logger';

/**
 * Creates an Express app instance configured for testing
 */
export function createTestApp() {
  const app = express();

  // Middleware
  app.set('trust proxy', true);
  
  // CORS - allow all origins in test
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    }),
  );

  app.use(cookieParser());
  app.use(express.json());

  // Routes
  app.use('/metrics', metricsRouter);
  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/messages', messageRouter);
  app.use('/api/v1/webhooks', webhookRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/projects', projectRouter);
  app.use('/api/v1/internal', internalRouter);
  app.use('/api-docs', docsRouter);

  // Error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, 'Unhandled error in request');
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred.',
      },
    });
  });

  return app;
}

