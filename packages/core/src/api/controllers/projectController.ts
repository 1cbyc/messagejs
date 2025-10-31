/**
 * @file Contains the controller logic for handling project-related API requests.
 *
 * This controller manages the CRUD (Create, Read, Update, Delete) operations
 * for projects, ensuring that users can only access projects they own.
 */

import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { GetProjectsResponse } from '@messagejs/shared-types';

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

    // The shared-types definition expects dates to be strings for API serialization.
    // We map the Date objects to ISO strings.
    const projectsForApi = projects.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      // Ensure any other date fields are also converted
    }));


    return res.status(200).json({ projects: projectsForApi });
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

// --- Placeholder for Create Project ---
/**
 * @controller createProject
 * @description Creates a new project for the authenticated user.
 * @route POST /api/v1/projects
 * @access Private (requires JWT authentication)
 */
export const createProject = async (req: Request, res: Response) => {
  // TODO: Implement project creation logic
  // 1. Validate request body (name, description)
  // 2. Use prisma.project.create with req.user!.id
  // 3. Return 201 Created with the new project
  res.status(501).json({ message: 'Not Implemented' });
};

// --- Placeholder for Get Project By ID ---
/**
 * @controller getProjectById
 * @description Fetches a single project by its ID.
 * @route GET /api/v1/projects/:id
 * @access Private (requires JWT authentication and ownership check)
 */
export const getProjectById = async (req: Request, res: Response) => {
  // TODO: Implement logic to fetch a single project
  // 1. Get project ID from req.params.id
  // 2. Use prisma.project.findFirst with where: { id, userId: req.user!.id }
  // 3. Return 404 if not found, otherwise return 200 with the project
  res.status(501).json({ message: 'Not Implemented' });
};
