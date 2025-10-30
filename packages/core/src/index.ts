/**
 * @file The main entry point for the MessageJS Core backend server.
 * This file initializes the Express application, sets up middleware,
 * defines initial routes, and starts the HTTP server.
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import messageRouter from './api/routes/messageRoutes';
import webhookRouter from './api/routes/webhookRoutes';
import healthRouter from './api/routes/healthRoutes';
import logger, { httpLogger } from './lib/logger';

// Load environment variables from a .env file into process.env
dotenv.config();

const app = express();

// The port the application will listen on.
// It will use the PORT from the .env file, or default to 3001.
const PORT = process.env.PORT || 3001;

// --- Global Middleware ---

// Enable parsing of JSON request bodies.
// This is essential for our REST API to accept JSON payloads.
app.use(express.json());

// Add the pino-http logger middleware.
// This will automatically log every incoming request and its response.
app.use(httpLogger);

// --- API Routes ---

// Mount the health check router.
app.use('/api/v1/health', healthRouter);

// Mount the message router for all requests to /api/v1/messages.
app.use('/api/v1/messages', messageRouter);

// Mount the webhook router for all requests to /api/v1/webhooks.
app.use('/api/v1/webhooks', webhookRouter);

// --- Start Server ---

// Start the Express server and listen for incoming connections on the specified port.
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'MessageJS Core API started successfully');
});

/**
 * Export the app instance. This is a good practice for allowing the app
 * to be imported into other files, especially for integration testing.
 */
export default app;
