/**
 * @file Defines the API routes for API Key management.
 * This router handles all endpoints under the `/api/v1/projects/:projectId/keys` path.
 */

import { Router } from 'express';
import {
  listApiKeys,
  createApiKey,
  deleteApiKey,
} from '../controllers/apiKeyController';
import { jwtAuthMiddleware } from '../middleware/jwtAuthMiddleware';

// Create a new Express router instance.
// The `mergeParams: true` option is crucial for nested routers to access parent params like :projectId.
const apiKeyRouter = Router({ mergeParams: true });

// Apply JWT authentication to all API key routes.
apiKeyRouter.use(jwtAuthMiddleware);

/**
 * @route   GET /
 * @desc    Get a list of all API keys for a specific project.
 * @access  Private
 */
apiKeyRouter.get('/', listApiKeys);

/**
 * @route   POST /
 * @desc    Create a new API key for a specific project.
 * @access  Private
 */
apiKeyRouter.post('/', createApiKey);

/**
 * @route   DELETE /:keyId
 * @desc    Delete a specific API key from a project.
 * @access  Private
 */
apiKeyRouter.delete('/:keyId', deleteApiKey);

export default apiKeyRouter;

