/**
 * @file Contains Zod schemas for validating project-related API requests.
 *
 * This module defines schemas for creating and updating projects to ensure
 * that incoming data is correctly formatted before being processed by the controllers.
 */

import { z } from 'zod';

/**
 * Zod schema for validating the request body of the `POST /api/v1/projects` endpoint.
 *
 * This schema enforces the following rules:
 * - `name`: Must be a non-empty string with a minimum of 3 characters and maximum of 100 characters.
 */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Project name must be at least 3 characters long')
    .max(100, 'Project name must be at most 100 characters long'),
});
