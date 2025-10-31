/**
 * @file Contains Zod schemas for validating project-related API requests.
 *
 * This module defines reusable schemas to ensure that incoming data for the
 * project endpoints is correctly formatted and contains all required fields.
 */

import { z } from 'zod';

/**
 * Zod schema for validating the request body of the `POST /api/v1/projects` endpoint.
 *
 * This schema enforces the following rules:
 * - `name`: Must be a string between 3 and 100 characters.
 */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Project name must be at least 3 characters long' })
    .max(100, { message: 'Project name must be at most 100 characters long' }),
});

