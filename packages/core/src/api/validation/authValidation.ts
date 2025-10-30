/**
 * @file Contains Zod schemas for validating authentication-related API requests.
 *
 * This module defines schemas for the registration and login endpoints to ensure
 * that incoming data is correctly formatted before being processed by the controllers.
 */

import { z } from 'zod';

/**
 * Zod schema for validating the request body of the `POST /api/v1/auth/register` endpoint.
 *
 * This schema enforces the following rules:
 * - `name`: Optional. If provided, must be a non-empty string.
 * - `email`: Must be a non-empty string in a valid email format.
 * - `password`: Must be a non-empty string with a minimum length of 8 characters.
 */
export const registerSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long'),
});

/**
 * Zod schema for validating the request body of the `POST /api/v1/auth/login` endpoint.
 *
 * This schema enforces the following rules:
 * - `email`: Must be a non-empty string in a valid email format.
 * - `password`: Must be a non-empty string.
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password cannot be empty'),
});
