/**
 * @file Defines the API routes for analytics and statistics operations.
 * This router handles all endpoints under the `/api/v1/projects/:projectId/analytics` path.
 */

import { Router } from 'express';
import { getProjectStats } from '../controllers/analyticsController';
import { jwtAuthMiddleware } from '../middleware/jwtAuthMiddleware';

// Create a new Express router instance.
// The `mergeParams: true` option is crucial for nested routers to access parent params like :projectId.
const analyticsRouter = Router({ mergeParams: true });

// Apply JWT authentication to all analytics routes.
analyticsRouter.use(jwtAuthMiddleware);

/**
 * @route   GET /
 * @desc    Get aggregated statistics for a specific project.
 * @access  Private
 */
analyticsRouter.get('/', getProjectStats);

export default analyticsRouter;

