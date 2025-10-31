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
// The `mergeParams: true` option is essential for nested routers. It ensures that
// params from the parent router (like :projectId) are accessible in this router.
const apiKeyRouter = Router({ mergeParams: true });

// Apply the JWT authentication middleware to all routes in this router.
// This ensures that only the authenticated owner of the project can manage its keys.
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
 * @desc    Delete a specific API key.
 * @access  Private
 */
apiKeyRouter.delete('/:keyId', deleteApiKey);

export default apiKeyRouter;
