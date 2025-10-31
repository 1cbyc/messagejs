/**
 * @file Defines the API routes for project-related operations.
 * This router handles all endpoints under the `/api/v1/projects` path.
 */

import { Router } from 'express';
import { listProjects } from '../controllers/projectController';
import { jwtAuthMiddleware } from '../middleware/jwtAuthMiddleware';

// Create a new Express router instance.
const projectRouter = Router();

/**
 * @route   GET /
 * @desc    Fetches all projects owned by the authenticated user.
 * @access  Private (requires JWT authentication)
 */
projectRouter.get('/', jwtAuthMiddleware, listProjects);

export default projectRouter;

