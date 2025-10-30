/**
 * @file Contains the controller logic for handling message-related API requests.
 */

import { Request, Response } from 'express';
import {
  SendMessageSuccessResponse,
  ApiErrorResponse,
} from '@messagejs/shared-types';
import prisma from '../../lib/prisma';
import { messageQueue } from '../../queues/messageQueue';
import logger from '../../lib/logger';
import { messagesQueuedCounter } from './metricsController';

/**
 * @controller sendMessage
 * @description Handles the logic for processing and queuing a new message.
 * This is the primary endpoint for the client SDK.
 *
 * @route POST /api/v1/messages
 * @access Public (authenticated via API Key middleware)
 *
 * @param {Request<{}, {}, SendMessageRequest>} req - The Express request object, typed with the send message request body.
 * @param {Response<SendMessageSuccessResponse | ApiErrorResponse>} res - The Express response object.
 * @returns {Promise<Response>} A promise that resolves to the Express response.
 */
export const sendMessage = async (
  req: Request,
  res: Response<SendMessageSuccessResponse | ApiErrorResponse>,
): Promise<Response> => {
  try {
    // Step 1: Extract project details from the validated API key (attached by middleware).
    const projectId = req.apiKey?.projectId;
    if (!projectId) {
      // This should technically be caught by the middleware, but it's good practice to double-check.
      return res.status(401).json({
        error: { code: 'AUTH_ERROR', message: 'Invalid API key details.' },
      });
    }

    // --- Idempotency Check ---
    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

    if (idempotencyKey) {
      const existingLog = await prisma.messageLog.findUnique({
        where: { idempotencyKey },
      });

      // If a log exists and it belongs to the current project, return the original response.
      if (existingLog && existingLog.projectId === projectId) {
        logger.info(
          {
            idempotencyKey,
            messageId: existingLog.id,
            projectId,
          },
          'Idempotent request detected. Returning existing message log.',
        );
        return res.status(200).json({
          messageId: existingLog.id,
          status: 'queued', // The original success response status
        });
      }
    }

    // Step 2: Extract the validated request body.
    // The Zod validation middleware has already ensured the body is well-formed.
    const { connectorId, templateId, to, variables } = req.body;

    // Step 3: Fetch the service and template from the database in parallel.
    // We also ensure they belong to the correct project for authorization.
    const [service, template] = await Promise.all([
      prisma.service.findFirst({
        where: { id: connectorId, projectId: projectId },
      }),
      prisma.template.findFirst({
        where: { id: templateId, projectId: projectId },
      }),
    ]);

    // Step 4: Verify that both the service and template exist and are linked to the project.
    if (!service) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Connector with ID '${connectorId}' not found or does not belong to your project.`,
        },
      });
    }

    if (!template) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Template with ID '${templateId}' not found or does not belong to your project.`,
        },
      });
    }

    // Step 5: Create a new message log entry with a 'QUEUED' status.
    const messageLog = await prisma.messageLog.create({
      data: {
        projectId: projectId,
        idempotencyKey: idempotencyKey, // Store the key to prevent future duplicates
        serviceId: connectorId,
        templateId: templateId,
        recipient: to,
        variables: variables,
        status: 'QUEUED',
      },
    });

    // Step 6: Push a job to our BullMQ queue for background processing.
    // We only need to pass the ID, as the worker will fetch the full details.
    await messageQueue.add('send-message', {
      messageLogId: messageLog.id,
    });

    // Increment the Prometheus counter for queued messages.
    messagesQueuedCounter.inc({
      projectId,
      connectorId,
    });

    // Add structured log for successful queuing
    logger.info(
      {
        messageId: messageLog.id,
        projectId,
        connectorId,
        templateId,
      },
      'Message successfully queued for sending.',
    );

    // Step 7: Return a 202 Accepted response, confirming the message is queued.
    return res.status(202).json({
      messageId: messageLog.id,
      status: 'queued',
    });
  } catch (error: any) {
    logger.error(
      {
        err: error,
        projectId: req.apiKey?.projectId,
        idempotencyKey: req.headers['idempotency-key'],
        body: req.body,
      },
      'Failed to process message',
    );
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while processing your message.',
      },
    });
  }
};
