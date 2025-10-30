/**
 * @file Contains the controller logic for handling incoming webhooks from third-party services.
 */

import { Request, Response } from 'express';
import logger from '../../lib/logger';
import prisma from '../../lib/prisma';
import { MessageStatus } from '@prisma/client';

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
  // WhatsApp webhooks can be complex. We log the entire body for debugging.
  // In production, you might want to reduce this logging to a 'debug' or 'trace' level.
  logger.info({ body: req.body }, 'Received WhatsApp webhook');

  // Acknowledge receipt of the webhook immediately to prevent Meta from resending.
  res.sendStatus(200);

  try {
    const body = req.body;

    // Check if the webhook notification is from a page subscription
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages' && change.value.statuses) {
            for (const status of change.value.statuses) {
              const externalMessageId = status.id; // This is the 'wamid'
              const newStatusString = status.status;

              // Map the WhatsApp status to our internal enum
              const newInternalStatus =
                mapWhatsAppStatusToInternalStatus(newStatusString);

              if (newInternalStatus && externalMessageId) {
                logger.info(
                  { externalMessageId, newStatus: newInternalStatus },
                  'Updating message status from webhook.',
                );

                // Update the corresponding MessageLog in our database.
                // We use updateMany because 'externalMessageId' is not a unique field
                // (though in practice it should be for sent messages).
                await prisma.messageLog.updateMany({
                  where: { externalMessageId },
                  data: {
                    status: newInternalStatus,
                    // If the message was delivered, we can record the timestamp.
                    ...(newInternalStatus === 'DELIVERED' && {
                      deliveredAt: new Date(),
                    }),
                  },
                });
              }
            }
          }
        }
      }
    }
  } catch (error: any) {
    // If our internal processing fails, we log the error.
    // We've already sent a 200 OK, so Meta won't know about this failure,
    // which is the desired behavior to keep the webhook active.
    logger.error(
      { err: error },
      'Error processing WhatsApp webhook payload.',
    );
  }
};
