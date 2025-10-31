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
import { validate } from '../middleware/validationMiddleware';
import { createProjectSchema } from '../validation/projectValidation';

// Create a new Express router instance.
const projectRouter = Router();

/**
 * @route   GET /
 * @desc    Fetches all projects owned by the authenticated user.
 * @access  Private (requires JWT authentication)
 */
projectRouter.get('/', jwtAuthMiddleware, listProjects);

/**
 * @route   POST /
 * @desc    Creates a new project for the authenticated user.
 * @access  Private (requires JWT authentication)
 */
projectRouter.post('/', jwtAuthMiddleware, validate(createProjectSchema), createProject);

export default projectRouter;
