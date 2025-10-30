/**
 * @file The main entry point for the MessageJS Core backend server.
 * This file initializes the Express application, sets up middleware,
 * defines initial routes, and starts the HTTP server.
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import messageRouter from './api/routes/messageRoutes';

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

// --- Health Check Route ---

/**
 * @route GET /
 * @description A simple health check endpoint to confirm that the API is running.
 * @access Public
 */
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Welcome to the MessageJS Core API!',
  });
});

// --- API Routes ---

// Mount the message router for all requests to /api/v1/messages.
app.use('/api/v1/messages', messageRouter);

// --- Start Server ---

// Start the Express server and listen for incoming connections on the specified port.
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MessageJS Core API listening on http://localhost:${PORT}`);
});

/**
 * Export the app instance. This is a good practice for allowing the app
 * to be imported into other files, especially for integration testing.
 */
export default app;
