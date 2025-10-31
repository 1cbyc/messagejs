/**
 * @file Contains the controller logic for handling project-related API requests.
 *
 * This controller manages the CRUD (Create, Read, Update, Delete) operations
 * for projects, ensuring that users can only access projects they own.
 */

import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { CreateProjectRequest, CreateProjectResponse, GetProjectsResponse, Project } from '@messagejs/shared-types';

/**
 * Maps a Prisma Project object (with Date objects) to an API-safe Project
 * object (with ISO date strings).
 * @param project The project object from Prisma.
 * @returns A project object safe for API responses.
 */
const mapProjectToApiResponse = (project: Project): Project => ({
  ...project,
  createdAt: project.createdAt.toISOString(),
});

/**
 * @controller listProjects
 * @description Fetches a list of all projects owned by the currently authenticated user.
 *
 * @route GET /api/v1/projects
 * @access Private (requires JWT authentication)
 */
export const listProjects = async (
  req: Request,
  res: Response<GetProjectsResponse | { error: any }>,
): Promise<Response> => {
  const userId = req.user!.id;

  try {
    const projects = await prisma.project.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ projects: projects.map(mapProjectToApiResponse) });
  } catch (error) {
    logger.error(
      { err: error, userId },
      'Failed to fetch projects for user.',
    );
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while fetching your projects.',
      },
    });
  }
};

/**
 * @controller createProject
 * @description Creates a new project for the authenticated user.
 *
 * @route POST /api/v1/projects
 * @access Private (requires JWT authentication)
 */
export const createProject = async (
  req: Request<{}, {}, CreateProjectRequest>,
  res: Response<CreateProjectResponse | { error: any }>,
): Promise<Response> => {
  const userId = req.user!.id;
  const { name, description } = req.body;

  try {
    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        userId,
      },
    });

    logger.info({ projectId: newProject.id, userId }, 'Project created successfully');

    return res.status(201).json(mapProjectToApiResponse(newProject));
  } catch (error) {
    logger.error(
      { err: error, userId, projectName: name },
      'Failed to create project for user.',
    );
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while creating the project.',
      },
    });
  }
};

/**
 * @controller getProjectById
 * @description Fetches a single project by its ID.
 * @route GET /api/v1/projects/:id
 * @access Private (requires JWT authentication and ownership check)
 */
export const getProjectById = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id: projectId } = req.params;

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: userId,
      },
    });

    if (!project) {
      return res.status(404).json({
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found or you do not have permission to access it.',
        },
      });
    }

    return res.status(200).json(mapProjectToApiResponse(project));
  } catch (error) {
    logger.error(
      { err: error, userId, projectId },
      'Failed to fetch project by ID.',
    );
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while fetching the project.',
      },
    });
  }
};
