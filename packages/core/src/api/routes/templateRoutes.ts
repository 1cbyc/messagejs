/**
 * @file Defines the API routes for Template management.
 * This router handles all endpoints under the `/api/v1/projects/:projectId/templates` path.
 */

import { Router } from 'express';
import {
  listTemplates,
  createTemplate,
  deleteTemplate,
} from '../controllers/templateController';
import { jwtAuthMiddleware } from '../middleware/jwtAuthMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { createTemplateSchema } from '../validation/templateValidation';

// Create a new Express router instance.
// The `mergeParams: true` option is crucial for nested routers to access parent params like :projectId.
const templateRouter = Router({ mergeParams: true });

// Apply JWT authentication to all template routes.
templateRouter.use(jwtAuthMiddleware);

/**
 * @route   GET /
 * @desc    Get a list of all templates for a specific project.
 * @access  Private
 */
templateRouter.get('/', listTemplates);

/**
 * @route   POST /
 * @desc    Create a new template for a specific project.
 * @access  Private
 */
templateRouter.post('/', validate(createTemplateSchema), createTemplate);

/**
 * @route   DELETE /:templateId
 * @desc    Delete a specific template from a project.
 * @access  Private
 */
templateRouter.delete('/:templateId', deleteTemplate);

export default templateRouter;
