/**
 * @file Contains authentication and authorization middleware for the Express application.
 * These middleware functions are responsible for protecting routes and verifying credentials.
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';

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
    // The key from the header should be a concatenation of the public and secret keys.
    // We expect a format like `<publicKey>_sk_<secretKey>`.
    const keyParts = apiKey.split('_sk_');
    if (keyParts.length !== 2) {
      return res.status(401).json({
        error: {
          code: 'AUTH_INVALID_FORMAT',
          message:
            "API key is improperly formatted. Expected format: '<publicKey>_sk_<secretKey>'.",
        },
      });
    }

    const [publicKey, secretKey] = keyParts;

    // Find the API key record in the database using the public key.
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { publicKey },
    });

    // If no key is found, or if the secret doesn't match, deny access.
    // We use a general "not valid" message to avoid leaking information
    // about which part of the key was incorrect.
    if (!apiKeyRecord) {
      return res.status(403).json({
        error: {
          code: 'AUTH_INVALID_KEY',
          message: 'The provided API key is not valid.',
        },
      });
    }

    // Compare the provided secret key with the stored hash using bcrypt.
    const isSecretValid = await bcrypt.compare(
      secretKey,
      apiKeyRecord.secretKeyHash,
    );

    if (!isSecretValid) {
      return res.status(403).json({
        error: {
          code: 'AUTH_INVALID_KEY',
          message: 'The provided API key is not valid.',
        },
      });
    }

    // Attach the validated API key and project information to the request object.
    // Attach the validated API key and project information to the request object.
    req.apiKey = {
      id: apiKeyRecord.id,
      projectId: apiKeyRecord.projectId,
      rateLimit: apiKeyRecord.rateLimit,
    };

    // The key is valid, proceed to the next middleware or controller.
    return next();
  } catch (error) {
    logger.error({ err: error }, 'API Key validation error');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during API key validation.',
      },
    });
  }
};
