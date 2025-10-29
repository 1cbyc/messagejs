/**
 * @file Contains authentication and authorization middleware for the Express application.
 * These middleware functions are responsible for protecting routes and verifying credentials.
 */

import { Request, Response, NextFunction } from 'express';

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

  // --- Mock Implementation ---
  // In a real application, this section would involve:
  // 1. Hashing the provided `apiKey` if we store hashes.
  // 2. Querying the `APIKeys` table in the database for a matching key/hash.
  // 3. Checking if the key is active and belongs to an active project.
  // 4. Caching the result in Redis for performance.

  const MOCK_API_KEY = 'pk_live_a1b2c3d4e5f6g7h8i9j0';
  const MOCK_PROJECT_ID = 'proj_123456789';
  const MOCK_API_KEY_ID = 'key_abcdefgh';

  if (apiKey === MOCK_API_KEY) {
    // Attach the validated API key information to the request object.
    // This makes it available to downstream controllers.
    req.apiKey = {
      id: MOCK_API_KEY_ID,
      projectId: MOCK_PROJECT_ID,
    };

    // The key is valid, proceed to the next middleware or controller.
    return next();
  }

  // If the key does not match, it is considered invalid.
  return res.status(403).json({
    error: {
      code: 'AUTH_INVALID_KEY',
      message: 'The provided API key is not valid.',
    },
  });
};
