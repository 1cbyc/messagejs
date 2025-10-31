/**
 * @file Contains the controller logic for handling connector-related API requests.
 *
 * This controller manages the CRUD operations for connectors (e.g., WhatsApp, Twilio),
 * ensuring that sensitive credentials are encrypted before storage and that users
 * can only access resources they own.
 */

import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { encrypt } from '../../utils/encryption';
import { toServiceType } from '../../utils/type-mapping';

/**
 * @controller listConnectors
 * @description Fetches a list of all connectors for a specific project.
 *
 * @route GET /api/v1/projects/:projectId/connectors
 * @access Private (requires JWT authentication)
 */
export const listConnectors = async (req: Request, res: Response) => {
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

    const connectors = await prisma.service.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      // Select only the fields that are safe to expose.
      // NEVER return the encrypted credentials blob.
      select: {
        id: true,
        type: true,
        createdAt: true,
      },
    });

    // Map the date and enum types to API-safe strings
    const connectorsForApi = connectors.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    }));

    return res.status(200).json({ connectors: connectorsForApi });
  } catch (error) {
    logger.error({ err: error, userId, projectId }, 'Failed to list connectors.');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve connectors.',
      },
    });
  }
};

/**
 * @controller createConnector
 * @description Creates a new connector for a specific project.
 *
 * @route POST /api/v1/projects/:projectId/connectors
 * @access Private (requires JWT authentication)
 */
export const createConnector = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { projectId } = req.params;
  const { type, credentials } = req.body; // Assuming validation has occurred

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

    // Encrypt the credentials before storing them.
    const encryptedCredentials = encrypt(JSON.stringify(credentials));

    const newConnector = await prisma.service.create({
      data: {
        projectId,
        type: toServiceType(type), // Map the string type to the Prisma enum
        credentials: encryptedCredentials,
      },
      select: {
        id: true,
        type: true,
        createdAt: true,
      },
    });

    logger.info({ userId, projectId, connectorId: newConnector.id, type }, 'New connector created.');

    return res.status(201).json({
      ...newConnector,
      createdAt: newConnector.createdAt.toISOString(),
    });
  } catch (error) {
    logger.error({ err: error, userId, projectId }, 'Failed to create connector.');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create connector.',
      },
    });
  }
};

/**
 * @controller deleteConnector
 * @description Deletes a connector from a project.
 *
 * @route DELETE /api/v1/projects/:projectId/connectors/:connectorId
 * @access Private (requires JWT authentication)
 */
export const deleteConnector = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { projectId, connectorId } = req.params;

  try {
    // Use a nested write to ensure the user owns the project before deleting the connector.
    // This transactionally checks for ownership and performs the deletion.
    const deleteResult = await prisma.project.update({
      where: {
        id: projectId,
        userId: userId,
      },
      data: {
        services: {
          delete: {
            id: connectorId,
          },
        },
      },
    });

    if (!deleteResult) {
      // This case is unlikely but serves as a safeguard.
      return res.status(404).json({
        error: {
          code: 'CONNECTOR_NOT_FOUND',
          message: 'Connector not found or you do not have permission to delete it.',
        },
      });
    }

    logger.info({ userId, projectId, connectorId }, 'Connector deleted successfully.');

    return res.status(204).send(); // Standard success response for deletions.
  } catch (error: any) {
    // Prisma's P2025 error code means the record to delete was not found.
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: {
          code: 'CONNECTOR_NOT_FOUND',
          message: 'Connector not found or you do not have permission to delete it.',
        },
      });
    }

    logger.error({ err: error, userId, projectId, connectorId }, 'Failed to delete connector.');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete connector.',
      },
    });
  }
};
