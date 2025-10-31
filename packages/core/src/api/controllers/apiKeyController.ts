/**
 * @file Contains the controller logic for handling API key-related API requests.
 *
 * This controller manages the CRUD operations for API keys, ensuring that users
 * can only access API keys for projects they own.
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { GetApiKeysResponse, ApiKeyResponse } from '@messagejs/shared-types';

/**
 * Generates a new API key pair (public key and secret key).
 * Format: `pk_live_<random>`_sk_<random>
 */
function generateApiKey(): { publicKey: string; secretKey: string; fullKey: string } {
  // Generate a public key (non-secret part)
  const publicKeySuffix = randomBytes(16).toString('hex');
  const publicKey = `pk_live_${publicKeySuffix}`;

  // Generate a secret key (secret part)
  const secretKey = randomBytes(32).toString('hex');

  // The full key that will be shown to the user once
  const fullKey = `${publicKey}_sk_${secretKey}`;

  return { publicKey, secretKey, fullKey };
}

/**
 * @controller listApiKeys
 * @description Fetches a list of all API keys for a specific project.
 *
 * @route GET /api/v1/projects/:projectId/keys
 * @access Private (requires JWT authentication)
 */
export const listApiKeys = async (req: Request, res: Response<GetApiKeysResponse | { error: any }>) => {
  const userId = req.user!.id;
  const { projectId } = req.params;

  try {
    // Verify project ownership.
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json({
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found or you do not have permission to access it.',
        },
      });
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        publicKey: true,
        createdAt: true,
      },
    });

    // Map the date to API-safe string
    const apiKeysForApi: ApiKeyResponse[] = apiKeys.map(key => ({
      id: key.id,
      publicKey: key.publicKey,
      createdAt: key.createdAt.toISOString(),
    }));

    return res.status(200).json({ apiKeys: apiKeysForApi });
  } catch (error) {
    logger.error({ err: error, userId, projectId }, 'Failed to list API keys.');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve API keys.',
      },
    });
  }
};

/**
 * @controller createApiKey
 * @description Creates a new API key for a specific project.
 * The full key (public + secret) is returned once, then never again.
 *
 * @route POST /api/v1/projects/:projectId/keys
 * @access Private (requires JWT authentication)
 */
export const createApiKey = async (req: Request, res: Response<{ apiKey: string } | { error: any }>) => {
  const userId = req.user!.id;
  const { projectId } = req.params;

  try {
    // Verify project ownership.
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json({
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found or you do not have permission to access it.',
        },
      });
    }

    // Generate the API key pair
    const { publicKey, secretKey, fullKey } = generateApiKey();

    // Hash the secret key with bcrypt before storing
    const secretKeyHash = await bcrypt.hash(secretKey, 10);

    // Store the API key in the database
    await prisma.apiKey.create({
      data: {
        projectId,
        publicKey,
        secretKeyHash,
        rateLimit: 1000, // Default rate limit
      },
    });

    logger.info({ userId, projectId, publicKey }, 'New API key created.');

    // Return the full key (public + secret) - this is the only time it will be shown
    return res.status(201).json({ apiKey: fullKey });
  } catch (error) {
    logger.error({ err: error, userId, projectId }, 'Failed to create API key.');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create API key.',
      },
    });
  }
};

/**
 * @controller deleteApiKey
 * @description Deletes an API key from a project.
 *
 * @route DELETE /api/v1/projects/:projectId/keys/:keyId
 * @access Private (requires JWT authentication)
 */
export const deleteApiKey = async (req: Request, res: Response<void | { error: any }>) => {
  const userId = req.user!.id;
  const { projectId, keyId } = req.params;

  try {
    // Verify project ownership first
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json({
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found or you do not have permission to access it.',
        },
      });
    }

    // Use a nested write to ensure the key belongs to the project
    const deleteResult = await prisma.project.update({
      where: {
        id: projectId,
        userId: userId,
      },
      data: {
        apiKeys: {
          delete: {
            id: keyId,
          },
        },
      },
    });

    if (!deleteResult) {
      return res.status(404).json({
        error: {
          code: 'API_KEY_NOT_FOUND',
          message: 'API key not found or you do not have permission to delete it.',
        },
      });
    }

    logger.info({ userId, projectId, keyId }, 'API key deleted successfully.');

    return res.status(204).send(); // Standard success response for deletions
  } catch (error: any) {
    // Prisma's P2025 error code means the record to delete was not found.
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: {
          code: 'API_KEY_NOT_FOUND',
          message: 'API key not found or you do not have permission to delete it.',
        },
      });
    }

    logger.error({ err: error, userId, projectId, keyId }, 'Failed to delete API key.');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete API key.',
      },
    });
  }
};

