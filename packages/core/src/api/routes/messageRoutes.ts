/**
 * @file Defines the API routes for message-related operations.
 * This router handles all endpoints under the `/api/v1/messages` path.
 */

import { Router } from 'express';
import { sendMessage } from '../controllers/messageController';
import { validateApiKey } from '../middleware/authMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { sendMessageSchema } from '../validation/messageValidation';

// Create a new Express router instance.
const messageRouter = Router();

/**
 * @route   POST /
 * @desc    Accepts and queues a new message to be sent. This is the primary
 *          endpoint for the client SDK and is protected by API key authentication.
 * @access  Public (via API Key)
 */
messageRouter.post(
  '/',
  validateApiKey,
  rateLimitMiddleware,
  validate(sendMessageSchema),
  sendMessage,
);

export default messageRouter;
