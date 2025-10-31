/**
 * @file Defines the API routes for project-related operations.
 * This router handles all endpoints under the `/api/v1/projects` path.
 */

import { Router } from 'express';
import {
  listProjects,
  createProject,
  getProjectById,
} from '../controllers/projectController';
import { jwtAuthMiddleware } from '../middleware/jwtAuthMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { createProjectSchema } from '../validation/projectValidation';
import apiKeyRouter from './apiKeyRoutes';

// Create a new Express router instance.
const projectRouter = Router();

// Apply the JWT authentication middleware to all project-level routes.
projectRouter.use(jwtAuthMiddleware);

/**
 * @route   GET /
 * @desc    Get a list of all projects for the authenticated user.
 * @access  Private
 */
projectRouter.get('/', listProjects);

/**
 * @route   POST /
 * @desc    Create a new project for the authenticated user.
 * @access  Private
 */
projectRouter.post('/', validate(createProjectSchema), createProject);

/**
 * @route   GET /:id
 * @desc    Get a single project by its ID.
 * @access  Private
 */
projectRouter.get('/:id', getProjectById);

// --- Nested Routes ---

// Mount the apiKeyRouter to handle all routes starting with /:projectId/keys.
// This creates the nested resource structure (e.g., /api/v1/projects/proj_123/keys).
projectRouter.use('/:projectId/keys', apiKeyRouter);

export default projectRouter;
