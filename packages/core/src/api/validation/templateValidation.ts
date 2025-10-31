import { z } from 'zod';

/**
 * @file Contains Zod schemas for validating template-related API requests.
 */

// This array should be kept in sync with the `ConnectorType` in `@messagejs/shared-types`.
const supportedConnectors = [
  'whatsapp',
  'telegram',
  'twilio',
  'smtp',
  'slack',
  'discord',
] as const;

/**
 * Zod schema for validating the request body of the `POST /api/v1/projects/:projectId/templates` endpoint.
 *
 * It enforces rules for the template's name, content, variables, and connector type.
 */
export const createTemplateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'Template name must be at least 3 characters long.' })
    .max(100, { message: 'Template name cannot exceed 100 characters.' }),
  content: z
    .string()
    .trim()
    .min(1, { message: 'Template content cannot be empty.' })
    .max(4096, { message: 'Template content cannot exceed 4096 characters.' }),
  variables: z
    .array(z.string())
    .optional()
    .default([]),
  connectorType: z.enum(supportedConnectors, {
    message: `Connector type is required and must be one of: ${supportedConnectors.join(', ')}`,
  }),
});
