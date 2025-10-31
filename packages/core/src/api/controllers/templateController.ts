/**
 * @file Contains the controller logic for handling template-related API requests.
 *
 * This controller manages the CRUD operations for message templates, ensuring
 * that users can only manage templates for projects they own.
 */

import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { toServiceType } from '../../utils/type-mapping';

/**
 * @controller listTemplates
 * @description Fetches a list of all templates for a specific project.
 *
 * @route GET /api/v1/projects/:projectId/templates
 * @access Private (requires JWT authentication)
 */
export const listTemplates = async (req: Request, res: Response) => {
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

    const templates = await prisma.template.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    // Serialize Date objects to ISO strings for API response consistency.
    const templatesForApi = templates.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
    }));

    return res.status(200).json({ templates: templatesForApi });
  } catch (error) {
    logger.error({ err: error, userId, projectId }, 'Failed to list templates.');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve templates.',
      },
    });
  }
};

/**
 * @controller createTemplate
 * @description Creates a new message template for a specific project.
 *
 * @route POST /api/v1/projects/:projectId/templates
 * @access Private (requires JWT authentication)
 */
export const createTemplate = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { projectId } = req.params;
  const { name, content, variables, connectorType } = req.body;

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

    const newTemplate = await prisma.template.create({
      data: {
        projectId,
        name,
        body: content, // The 'content' from API maps to 'body' in the schema
        variables: JSON.stringify(variables), // Store variables as a JSON string
        connectorType: toServiceType(connectorType), // Map to Prisma enum
      },
    });

    logger.info({ userId, projectId, templateId: newTemplate.id }, 'New template created.');

    return res.status(201).json({
      ...newTemplate,
      createdAt: newTemplate.createdAt.toISOString(),
    });
  } catch (error) {
    logger.error({ err: error, userId, projectId }, 'Failed to create template.');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create template.',
      },
    });
  }
};

/**
 * @controller deleteTemplate
 * @description Deletes a template from a project.
 *
 * @route DELETE /api/v1/projects/:projectId/templates/:templateId
 * @access Private (requires JWT authentication)
 */
export const deleteTemplate = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { projectId, templateId } = req.params;

  try {
    // Use a nested write to ensure ownership before deleting.
    await prisma.project.update({
      where: {
        id: projectId,
        userId: userId,
      },
      data: {
        templates: {
          delete: {
            id: templateId,
          },
        },
      },
    });

    logger.info({ userId, projectId, templateId }, 'Template deleted successfully.');

    return res.status(204).send();
  } catch (error: any) {
    // Prisma's P2025 error code means the record to delete was not found.
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Template not found or you do not have permission to delete it.',
        },
      });
    }

    logger.error({ err: error, userId, projectId, templateId }, 'Failed to delete template.');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete template.',
      },
    });
  }
};
