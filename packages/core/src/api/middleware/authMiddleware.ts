/**
 * @file Contains authentication and authorization middleware for the Express application.
 * These middleware functions are responsible for protecting routes and verifying credentials.
 */

import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';

/**
 * @middleware validateApiKey
 * @description An Express middleware to validate an API key provided in the Authorization header.
 *
 * This middleware performs the following checks:
 * 1.  Ensures the `Authorization` header is present.
 * 2.  Verifies the header format is `Bearer <api_key>`.
 * 3.  (Placeholder) Validates the API key against a mock/database value.
 * 4.  If valid, attaches the API key's details (like `projectId`) to `req.apiKey`.
 * 5.  If invalid, sends a `401` or `403` response and stops the request chain.
 *
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The function to call to pass control to the next middleware.
 */
export const validateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'AUTH_MISSING_HEADER',
        message:
          'Authorization header is missing or improperly formatted. Expected: "Bearer <api_key>".',
      },
    });
  }

  const apiKey = authHeader.split(' ')[1];

  if (!apiKey) {
    return res.status(401).json({
      error: {
        code: 'AUTH_MISSING_KEY',
        message: 'API key is missing from the Authorization header.',
      },
    });
  }

  try {
    // Find the project associated with the provided API key.
    // In a production environment, you might also want to select only necessary fields.
    const project = await prisma.project.findUnique({
      where: { apiKey },
    });

    // If no project is found for the given key, or if the project is inactive, deny access.
    if (!project) {
      return res.status(403).json({
        error: {
          code: 'AUTH_INVALID_KEY',
          message: 'The provided API key is not valid.',
        },
      });
    }

    // Attach the validated project information to the request object.
    // This makes it available to downstream controllers.
    req.apiKey = {
      id: project.apiKey, // The API key itself
      projectId: project.id,
    };

    // The key is valid, proceed to the next middleware or controller.
    return next();
  } catch (error) {
    console.error('API Key validation error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during API key validation.',
      },
    });
  }
};
