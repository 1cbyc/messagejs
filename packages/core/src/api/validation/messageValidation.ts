/**
 * @file Contains Zod schemas for validating message-related API requests.
 *
 * This module defines reusable schemas to ensure that incoming data for the
 * message endpoints is correctly formatted and contains all required fields.
 * This helps prevent errors and adds a layer of security.
 */

import { z } from 'zod';

/**
 * Zod schema for validating the request body of the `POST /api/v1/messages` endpoint.
 *
 * This schema enforces the following rules:
 * - `connectorId`: Must be a non-empty string.
 * - `templateId`: Must be a non-empty string.
 * - `to`: Must be a non-empty string.
 * - `variables`: Must be an object.
 */
export const sendMessageSchema = z.object({
  connectorId: z.string().min(1, { message: 'connectorId cannot be empty' }),
  templateId: z.string().min(1, { message: 'templateId cannot be empty' }),
  to: z.string().min(1, { message: 'to cannot be empty' }),
  variables: z.record(z.string(), z.any()),
});
