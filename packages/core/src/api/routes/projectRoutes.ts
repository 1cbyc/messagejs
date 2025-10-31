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
projectRouter.post(
  '/',
  jwtAuthMiddleware,
  validate(createProjectSchema),
  createProject,
);

/**
 * @route   GET /:id
 * @desc    Get a single project by its ID.
 * @access  Private
 */
projectRouter.get('/:id', jwtAuthMiddleware, getProjectById);

// --- Nested Routes ---

// Mount the apiKeyRouter to handle all routes starting with /:projectId/keys
// This creates the nested resource structure.
projectRouter.use('/:projectId/keys', apiKeyRouter);

export default projectRouter;
