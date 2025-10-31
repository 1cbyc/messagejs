/**
 * @file The main entry point for the MessageJS Core backend server.
 * This file initializes the Express application, sets up middleware,
 * defines initial routes, and starts the HTTP server.
 */

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import messageRouter from './api/routes/messageRoutes';
import webhookRouter from './api/routes/webhookRoutes';
import healthRouter from './api/routes/healthRoutes';
import authRouter from './api/routes/authRoutes';
import metricsRouter from './api/routes/metricsRoutes';
import projectRouter from './api/routes/projectRoutes';
import internalRouter from './api/routes/internalRoutes';
import logger, { httpLogger } from './lib/logger';

// Load environment variables from a .env file into process.env
dotenv.config();

const app = express();


// The port the application will listen on.
// It will use the PORT from the .env file, or default to 3001.
const PORT = process.env.PORT ?? 3001;

// --- Global Middleware ---

// Trust proxy for accurate IP address detection (important for rate limiting)
app.set('trust proxy', true);

// Enable parsing of JSON request bodies.
// This is essential for our REST API to accept JSON payloads.
app.use(express.json());

// Add the pino-http logger middleware.
// This will automatically log every incoming request and its response.
app.use(httpLogger);

// --- API Routes ---

// Mount the metrics router. This is typically not versioned under /api/v1.
app.use('/metrics', metricsRouter);

// Mount the health check router.
app.use('/api/v1/health', healthRouter);

// Mount the message router for all requests to /api/v1/messages.
app.use('/api/v1/messages', messageRouter);

// Mount the webhook router for all requests to /api/v1/webhooks.
app.use('/api/v1/webhooks', webhookRouter);

// Mount the auth router for all requests to /api/v1/auth.
app.use('/api/v1/auth', authRouter);

// Mount the project router for all requests to /api/v1/projects.
app.use('/api/v1/projects', projectRouter);

// Mount the internal router for operational tasks.
app.use('/api/v1/internal', internalRouter);

// --- Error Handling ---
// Generic error handler to catch any other errors
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err, url: req.url }, 'Unhandled error in request');
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
});

// --- Start Server ---

// Start the Express server and listen for incoming connections on the specified port.
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'MessageJS Core API started successfully');
  
  // Start the message worker as a child process for free tier compatibility
  // This allows us to run both API and worker in a single Render service
  const workerProcess = spawn('node', ['dist/queues/messageWorker.js'], {
    stdio: 'inherit',
    env: process.env,
  });
  
  workerProcess.on('error', (err) => {
    logger.error({ err }, 'Failed to start message worker');
  });
  
  workerProcess.on('exit', (code) => {
    logger.warn({ code }, 'Message worker process exited');
  });
  
  // Graceful shutdown - kill worker when API shuts down
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down worker...');
    workerProcess.kill();
  });
});

/**
 * Export the app instance. This is a good practice for allowing the app
 * to be imported into other files, especially for integration testing.
 */
export default app;
