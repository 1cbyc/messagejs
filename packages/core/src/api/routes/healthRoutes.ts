/**
 * @file Defines the API routes for health check operations.
 * This router handles all endpoints under the `/api/v1/health` path.
 */

import { Router } from 'express';
import { checkHealth } from '../controllers/healthController';

// Create a new Express router instance.
const healthRouter = Router();

/**
 * @route   GET /
 * @desc    Checks the health of the API server and its dependencies (database, Redis).
 * @access  Public
 */
healthRouter.get('/', checkHealth);

export default healthRouter;
