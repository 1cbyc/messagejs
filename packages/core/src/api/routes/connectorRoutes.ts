/**
 * @file Defines the API routes for Connector management.
 * This router handles all endpoints under the `/api/v1/projects/:projectId/connectors` path.
 */

import { Router } from 'express';
import {
  listConnectors,
  createConnector,
  deleteConnector,
} from '../controllers/connectorController';
import { jwtAuthMiddleware } from '../middleware/jwtAuthMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { createConnectorSchema } from '../validation/connectorValidation';

// Create a new Express router instance.
// The `mergeParams: true` option is crucial for nested routers to access parent params like :projectId.
const connectorRouter = Router({ mergeParams: true });

// Apply JWT authentication to all connector routes.
connectorRouter.use(jwtAuthMiddleware);

/**
 * @route   GET /
 * @desc    Get a list of all connectors for a specific project.
 * @access  Private
 */
connectorRouter.get('/', listConnectors);

/**
 * @route   POST /
 * @desc    Create a new connector for a specific project.
 * @access  Private
 */
connectorRouter.post('/', validate(createConnectorSchema), createConnector);

/**
 * @route   DELETE /:connectorId
 * @desc    Delete a specific connector from a project.
 * @access  Private
 */
connectorRouter.delete('/:connectorId', deleteConnector);

export default connectorRouter;
