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
 * - `serviceId`: Must be a non-empty string.
 * - `templateId`: Must be a non-empty string.
 * - `recipient`: Must be a non-empty string.
 * - `variables`: Optional. If provided, must be an object.
 * - `metadata`: Optional. If provided, must be an object.
 */
export const sendMessageSchema = z.object({
  body: z.object({
    serviceId: z
      .string({ required_error: 'serviceId is required' })
      .min(1, 'serviceId cannot be empty'),
    templateId: z
      .string({ required_error: 'templateId is required' })
      .min(1, 'templateId cannot be empty'),
    recipient: z
      .string({ required_error: 'recipient is required' })
      .min(1, 'recipient cannot be empty'),
    variables: z.record(z.any()).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});
