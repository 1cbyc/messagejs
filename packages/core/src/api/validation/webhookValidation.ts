/**
 * @file Contains Zod schemas for validating incoming webhook payloads.
 *
 * This module provides schemas to ensure that webhook data from third-party
 * providers like WhatsApp is structured as expected before processing.
 * This prevents runtime errors and improves the robustness of the webhook handlers.
 */

import { z } from 'zod';

/**
 * Zod schema for a single status object within a WhatsApp webhook payload.
 * This corresponds to the `statuses` array element.
 */
const whatsAppStatusObjectSchema = z.object({
  /** The unique identifier for the message (wamid). */
  id: z.string(),
  /** The delivery status of the message. */
  status: z.enum(['sent', 'delivered', 'read', 'failed']),
});

/**
 * Zod schema for the `value` object in a WhatsApp webhook change.
 * It contains metadata and the array of status updates.
 */
const whatsAppChangeValueSchema = z.object({
  messaging_product: z.literal('whatsapp'),
  metadata: z.record(z.string(), z.any()),
  statuses: z.array(whatsAppStatusObjectSchema).optional(),
});

/**
 * Zod schema for a single `change` in a WhatsApp webhook entry.
 */
const whatsAppChangeSchema = z.object({
  value: whatsAppChangeValueSchema,
  field: z.literal('messages'),
});

/**
 * Zod schema for a single `entry` in a WhatsApp webhook payload.
 */
const whatsAppEntrySchema = z.object({
  id: z.string(),
  changes: z.array(whatsAppChangeSchema),
});

/**
 * The main Zod schema for validating the entire WhatsApp webhook payload.
 * It ensures the payload has the expected top-level structure and contains
 * at least one entry with at least one message status update.
 */
export const whatsAppWebhookSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(whatsAppEntrySchema).nonempty(),
});

/**
 * A TypeScript type inferred from the Zod schema for type-safe access
 * to the validated webhook payload.
 */
export type WhatsAppWebhookPayload = z.infer<typeof whatsAppWebhookSchema>;
