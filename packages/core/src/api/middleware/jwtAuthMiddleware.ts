/**
 * @file Contains JWT authentication middleware for protecting dashboard API routes.
 *
 * This middleware is responsible for verifying the JSON Web Token provided by
 * the user's browser, ensuring that only authenticated users can access
 * protected endpoints like project and API key management.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../../lib/logger';
import prisma from '../../lib/prisma';

// Secret key for JWT verification from environment variables.
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Defines the shape of the decoded JWT payload that we expect.
 */
export interface AuthPayload {
  userId: string;
  email: string;
  // iat and exp are automatically added by jsonwebtoken
  iat: number;
  exp: number;
}

/**
 * @middleware jwtAuthMiddleware
 * @description An Express middleware to verify a JSON Web Token (JWT) from the
 * Authorization header. It protects routes that require a logged-in dashboard user.
 *
 * This middleware performs the following:
 * 1. Extracts the 'Bearer <token>' from the Authorization header.
 * 2. Verifies the token's signature and expiration using the JWT_SECRET.
 * 3. If valid, it fetches the user from the database to ensure they still exist.
 * 4. Attaches the user object to `req.user` for use in subsequent controllers.
 * 5. If invalid or missing, it sends a 401 Unauthorized response.
 *
 * Note: You must extend the Express Request type to include the `user` property.
 * In `types/express.d.ts`:
 * declare namespace Express {
 *   export interface Request {
 *     user?: { id: string; email: string };
 *   }
 * }
 */
export const jwtAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  if (!JWT_SECRET) {
    logger.error('JWT_SECRET is not defined in environment variables.');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Authentication is not configured correctly on the server.',
      },
    });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'AUTH_MISSING_TOKEN',
        message: 'Authentication token is missing or improperly formatted.',
      },
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token and decode its payload.
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

    // Check that the decoded payload contains the necessary user information.
    if (!decoded.userId) {
      return res.status(401).json({
        error: {
          code: 'AUTH_INVALID_TOKEN',
          message: 'Authentication token is invalid.',
        },
      });
    }

    // Optional but highly recommended: Check if the user still exists in the database.
    // This prevents issues if a user was deleted but their token is still valid.
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'AUTH_USER_NOT_FOUND',
          message: 'User associated with this token no longer exists.',
        },
      });
    }

    // Attach the user's essential info to the request object.
    // This requires extending the Express.Request type.
    req.user = { id: user.id, email: user.email };

    // Proceed to the next middleware or controller.
    return next();
  } catch (error: any) {
    let code = 'AUTH_INVALID_TOKEN';
    let message = 'Authentication token is invalid or has expired.';

    if (error.name === 'TokenExpiredError') {
      code = 'AUTH_TOKEN_EXPIRED';
      message = 'Authentication token has expired. Please log in again.';
    }

    logger.warn({ err: error.name }, 'JWT verification failed');
    return res.status(401).json({
      error: {
        code,
        message,
      },
    });
  }
};
