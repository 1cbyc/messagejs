/**
 * @file Defines the API routes for interactive API documentation.
 * This router serves Swagger UI for the MessageJS API.
 */

import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { join } from 'path';
import YAML from 'yaml';
import logger from '../../lib/logger';

// Create a new Express router instance.
const docsRouter = Router();

// Load the OpenAPI spec from the docs directory
// Path from packages/core/src/api/routes/ to docs/ at root
const openApiPath = join(__dirname, '../../../../docs/openapi.yaml');
let swaggerDocument: any;

try {
  const file = readFileSync(openApiPath, 'utf8');
  swaggerDocument = YAML.parse(file);
  // Override server URL with environment variable if set
  if (process.env.API_BASE_URL) {
    swaggerDocument.servers = [
      {
        url: process.env.API_BASE_URL,
        description: 'Production Server',
      },
    ];
  }
} catch (error) {
  // Fallback: create a minimal spec if file can't be loaded
  logger?.warn({ err: error, path: openApiPath }, 'Failed to load OpenAPI spec, using fallback');
  swaggerDocument = {
    openapi: '3.0.3',
    info: {
      title: 'MessageJS API',
      version: '1.0.0',
      description: 'API documentation is being loaded...',
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'https://api.messagejs.pro/api/v1',
        description: 'Production Server',
      },
    ],
  };
}

// Swagger UI options
const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MessageJS API Documentation',
  customfavIcon: '/favicon.ico',
};

/**
 * @route   GET /api-docs
 * @desc    Serves the Swagger UI interface for interactive API documentation.
 * @access  Public
 */
docsRouter.use('/', swaggerUi.serve);
docsRouter.get('/', swaggerUi.setup(swaggerDocument, swaggerOptions));

/**
 * @route   GET /api-docs/json
 * @desc    Returns the OpenAPI spec in JSON format.
 * @access  Public
 */
docsRouter.get('/json', (_req, res) => {
  res.json(swaggerDocument);
});

export default docsRouter;

