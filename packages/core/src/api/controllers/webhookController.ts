/**
 * @file Contains the controller logic for handling incoming webhooks from third-party services.
 */

import { Request, Response } from 'express';
import logger from '../../lib/logger';
import prisma from '../../lib/prisma';
import { MessageStatus } from '@prisma/client';
import { whatsAppWebhookSchema } from '../validation/webhookValidation';

// This should be a secure, randomly generated string that you set in your .env file
// and also provide in the Meta for Developers dashboard when setting up the webhook.
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

/**
 * @controller verifyWhatsAppWebhook
 * @description Handles the webhook verification challenge from Meta.
 * When you configure a webhook endpoint in the Meta developer dashboard, Meta sends a
 * GET request to this endpoint. This function verifies the request and responds
.
 *
 * @route GET /api/v1/webhooks/whatsapp
 * @access Public
 */
export const verifyWhatsAppWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Check if a hub.mode and hub.verify_token are present in the query string
  if (mode && token) {
    // Check if the mode is 'subscribe' and the token matches our verification token
    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
      logger.info('WhatsApp webhook verification successful!');
      // Respond with the challenge token from the request
      res.status(200).send(challenge);
    } else {
      // If the tokens do not match, respond with a 403 Forbidden
      logger.warn('WhatsApp webhook verification failed: Invalid token.');
      res.sendStatus(403);
    }
  } else {
    // If the required query parameters are missing, respond with a 400 Bad Request
    logger.warn('WhatsApp webhook verification failed: Missing query parameters.');
    res.sendStatus(400);
  }
};

/**
 * Maps a status from the WhatsApp Cloud API to our internal MessageStatus enum.
 * @param {string} whatsAppStatus The status string from the WhatsApp webhook payload.
 * @returns {MessageStatus | null} The corresponding internal status, or null if it's not a status we handle.
 */
const mapWhatsAppStatusToInternalStatus = (
  whatsAppStatus: string,
): MessageStatus | null => {
  switch (whatsAppStatus) {
    case 'sent':
      return 'SENT';
    case 'delivered':
      return 'DELIVERED';
    // 'read' is a final state, we can consider it 'delivered' for our core logic.
    // A future implementation could add a 'READ' status.
    case 'read':
      return 'DELIVERED';
    case 'failed':
      return 'FAILED';
    default:
      // We don't handle other statuses like 'queued' from webhooks, so we ignore them.
      return null;
  }
};

/**
 * @controller handleWhatsAppWebhook
 * @description Receives and processes status updates and other events from WhatsApp.
 * Meta sends a POST request to this endpoint with a payload containing the event details.
 *
 * @route POST /api/v1/webhooks/whatsapp
 * @access Public
 */
export const handleWhatsAppWebhook = async (req: Request, res: Response) => {
  // Acknowledge receipt immediately to prevent Meta from resending, which is a requirement.
  res.sendStatus(200);

  // 1. Validate the webhook payload shape using our Zod schema.
  const validationResult = whatsAppWebhookSchema.safeParse(req.body);
  if (!validationResult.success) {
    logger.warn(
      {
        error: validationResult.error.flatten(),
        body: req.body,
      },
      'Received invalid WhatsApp webhook payload.',
    );
    return; // Stop processing if the shape is incorrect.
  }

  // 2. Process the now-validated payload in a type-safe manner.
  try {
    const payload = validationResult.data;

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        // We are only interested in changes that contain message statuses.
        if (change.value.statuses) {
          for (const statusUpdate of change.value.statuses) {
            const externalMessageId = statusUpdate.id;
            const newStatusString = statusUpdate.status;

            const newInternalStatus =
              mapWhatsAppStatusToInternalStatus(newStatusString);

            if (!newInternalStatus) {
              // This is a status we don't handle (e.g., 'read' might be ignored), so we skip it.
              continue;
            }

            // Prepare the data for the database update.
            const updateData: {
              status: MessageStatus;
              sentAt?: Date;
              deliveredAt?: Date;
            } = {
              status: newInternalStatus,
            };

            // Set the appropriate timestamp based on the new status.
            if (newInternalStatus === 'SENT') {
              updateData.sentAt = new Date();
            } else if (newInternalStatus === 'DELIVERED') {
              updateData.deliveredAt = new Date();
            }

            logger.info(
              {
                externalMessageId,
                newStatus: newInternalStatus,
              },
              'Processing webhook status update.',
            );

            // Atomically update the message log using the now-unique externalMessageId.
            // Using a try-catch to gracefully handle cases where the message ID is not found.
            try {
              await prisma.messageLog.update({
                where: { externalMessageId },
                data: updateData,
              });
            } catch (dbError: any) {
              // Prisma's error code for "Record to update not found".
              if (dbError.code === 'P2025') {
                logger.warn(
                  { externalMessageId },
                  'Webhook received for an unknown externalMessageId. Ignoring.',
                );
              } else {
                throw dbError; // Re-throw other unexpected database errors.
              }
            }
          }
        }
      }
    }
  } catch (error: any) {
    // This catch block handles errors from our processing logic.
    logger.error(
      {
        err: error,
        reqBody: req.body, // Log the original body for easier debugging.
      },
      'Error processing WhatsApp webhook payload.',
    );
  }
};
