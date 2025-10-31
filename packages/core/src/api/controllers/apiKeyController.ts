/**
 * @file Contains the controller logic for handling API key-related requests.
 *
 * This controller manages the CRUD operations for API keys, ensuring they are
 * securely generated, stored, and retrieved. It also enforces ownership,
 * ensuring users can only manage keys for projects they own.
 */

import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { generateApiKey } from '../../utils/apiKeyManager';

/**
 * @controller listApiKeys
 * @description Fetches a list of all API keys for a specific project.
 *
 * @route GET /api/v1/projects/:projectId/keys
 * @access Private (requires JWT authentication)
 */
export const listApiKeys = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { projectId } = req.params;

  try {
    // First, verify that the project belongs to the authenticated user.
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

    const apiKeysFromDb = await prisma.apiKey.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      // Select only the fields that are safe to expose.
      // NEVER return the secretKeyHash.
      select: {
        id: true,
        publicKey: true,
        createdAt: true,
      },
    });

    // Map the Date object to an ISO string to match the ApiKeyResponse type.
    const apiKeys = apiKeysFromDb.map(key => ({
      ...key,
      createdAt: key.createdAt.toISOString(),
    }));

    return res.status(200).json({ apiKeys });
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
 *
 * @route POST /api/v1/projects/:projectId/keys
 * @access Private (requires JWT authentication)
 */
export const createApiKey = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { projectId } = req.params;

  try {
    // Verify project ownership before creating a key.
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

    const { fullApiKey, publicKey, secretKeyHash } = await generateApiKey();

    await prisma.apiKey.create({
      data: {
        projectId,
        publicKey,
        secretKeyHash,
      },
    });

    logger.info({ userId, projectId, publicKey }, 'New API key created.');

    // Return the full, plaintext API key to the user ONCE.
    return res.status(201).json({
      message: 'API key created successfully. Please save this key securely. It will not be shown again.',
      apiKey: fullApiKey,
    });
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
 * @description Deletes an API key.
 *
 * @route DELETE /api/v1/projects/:projectId/keys/:keyId
 * @access Private (requires JWT authentication)
 */
export const deleteApiKey = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { projectId, keyId } = req.params;

  try {
    // To ensure the user can only delete keys from their own projects,
    // we perform a nested write, which acts as an ownership check.
    // This will only succeed if an ApiKey with `keyId` exists within a
    // Project with `projectId` that is owned by `userId`.
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
      // This case is unlikely with the nested write but serves as a safeguard.
      return res.status(404).json({
        error: {
          code: 'API_KEY_NOT_FOUND',
          message: 'API key not found or you do not have permission to delete it.',
        },
      });
    }

    logger.info({ userId, projectId, keyId }, 'API key deleted.');

    return res.status(204).send(); // 204 No Content is standard for successful deletions.
  } catch (error: any) {
    // Prisma throws an error if the nested record to delete is not found.
    // We can catch this to provide a clearer 404.
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
