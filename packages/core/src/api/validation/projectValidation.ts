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
 * - `name`: Must be a non-empty string with a minimum of 3 characters.
 * - `description`: Optional. If provided, must be a string.
 */
export const createProjectSchema = z.object({
  name: z
    .string({
      required_error: 'Project name is required.',
    })
    .min(3, { message: 'Project name must be at least 3 characters long.' })
    .max(100, { message: 'Project name must be at most 100 characters long.' }),
});
