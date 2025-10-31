/**
 * @file Contains the controller logic for handling project-related API requests.
 *
 * This controller manages the CRUD (Create, Read, Update, Delete) operations
 * for projects, ensuring that users can only access projects they own.
 */

import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { CreateProjectRequest, CreateProjectResponse, GetProjectsResponse } from '@messagejs/shared-types';

/**
 * @controller listProjects
 * @description Fetches a list of all projects owned by the currently authenticated user.
 *
 * @route GET /api/v1/projects
 * @access Private (requires JWT authentication)
 *
 * @param {Request} req - The Express request object. `req.user` is attached by the jwtAuthMiddleware.
 * @param {Response<GetProjectsResponse>} res - The Express response object.
 * @returns {Promise<Response>} A promise that resolves to the Express response.
 */
export const listProjects = async (
  req: Request,
  res: Response<GetProjectsResponse | { error: any }>,
): Promise<Response> => {
  // The user ID is guaranteed to be present by the jwtAuthMiddleware.
  const userId = req.user!.id;

  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc', // Return the newest projects first
      },
    });

    return res.status(200).json({ projects });
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
 *
 * @param {Request} req - The Express request object. `req.user` is attached by the jwtAuthMiddleware.
 * @param {Response<CreateProjectResponse>} res - The Express response object.
 * @returns {Promise<Response>} A promise that resolves to the Express response.
 */
export const createProject = async (
  req: Request<{}, {}, CreateProjectRequest>,
  res: Response<CreateProjectResponse>,
): Promise<Response> => {
  const userId = req.user!.id;
  const { name } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        name,
        userId,
      },
    });

    logger.info({ projectId: project.id, userId }, 'Project created successfully');
    
    return res.status(201).json(project);
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
