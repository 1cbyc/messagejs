/**
 * @file Contains the controller logic for handling message-related API requests.
 */

import { Request, Response } from 'express';
import {
  SendMessageRequest,
  SendMessageSuccessResponse,
  ApiErrorResponse,
} from '../../types/apiTypes';
import prisma from '../../lib/prisma';
import { messageQueue } from '../../queues/messageQueue';
import logger from '../../lib/logger';

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

    // Step 2: Extract the validated request body.
    // The Zod validation middleware has already ensured the body is well-formed.
    const { serviceId, templateId, recipient } = req.body;

    // Step 3: Fetch the service and template from the database in parallel.
    // We also ensure they belong to the correct project for authorization.
    const [service, template] = await Promise.all([
      prisma.service.findFirst({
        where: { id: serviceId, projectId: projectId },
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
          message: `Service with ID '${serviceId}' not found or does not belong to your project.`,
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
        serviceId: serviceId,
        recipient: recipient,
        status: 'QUEUED', // Using the enum from our Prisma schema
        // TODO: In a real implementation, we would store the rendered template + variables
      },
    });

    // Step 6: Push a job to our BullMQ queue for background processing.
    // We only need to pass the ID, as the worker will fetch the full details.
    await messageQueue.add('send-message', {
      messageLogId: messageLog.id,
    });

    // Step 7: Return a 202 Accepted response, confirming the message is queued.
    return res.status(202).json({
      messageId: messageLog.id,
      status: 'queued',
      externalId: null,
      details: 'Message has been successfully queued for processing.',
    });
  } catch (error: any) {
    logger.error({ error, projectId: req.apiKey?.projectId }, 'Failed to process message');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while processing your message.',
      },
    });
  }
};
