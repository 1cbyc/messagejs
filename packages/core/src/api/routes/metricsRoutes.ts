/**
 * @file Defines the API route for exposing Prometheus metrics.
 * This router handles all endpoints under the `/metrics` path.
 */

import { Router } from 'express';
import { getMetrics } from '../controllers/metricsController';

// Create a new Express router instance.
const metricsRouter = Router();

/**
 * @route   GET /
 * @desc    Serves the collected application metrics in the Prometheus format.
 *          This endpoint is intended to be scraped by a Prometheus server.
 * @access  Public (network access should be restricted to monitoring infrastructure)
 */
metricsRouter.get('/', getMetrics);

export default metricsRouter;
