import { z } from 'zod';

/**
 * @file Contains Zod schemas for validating connector-related API requests.
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
 * Zod schema for validating the request body of the `POST /api/v-1/projects/:projectId/connectors` endpoint.
 *
 * It enforces that the `type` is a supported connector and that `credentials` is a non-empty object.
 */
export const createConnectorSchema = z.object({
  type: z.enum(supportedConnectors, {
    errorMap: () => ({
      message: `Connector 'type' is required and must be one of: ${supportedConnectors.join(
        ', ',
      )}`,
    }),
  }),
  credentials: z
    .record(z.string(), z.any())
    .refine(creds => creds && Object.keys(creds).length > 0, {
      message: 'The `credentials` object is required and cannot be empty.',
    }),
});
