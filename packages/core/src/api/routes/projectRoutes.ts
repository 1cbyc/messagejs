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

// Create a new Express router instance.
const projectRouter = Router();

// Apply the JWT authentication middleware to all routes in this router.
// This ensures that only logged-in dashboard users can access these endpoints.
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

// Routes for updating and deleting projects can be added here in the future.
// e.g., projectRouter.put('/:id', validate(updateProjectSchema), updateProject);
// e.g., projectRouter.delete('/:id', deleteProject);

export default projectRouter;
