/**
 * @file Defines the API routes for handling incoming webhooks from third-party providers.
 * This router handles all endpoints under the `/api/v1/webhooks` path.
 */

import { Router } from 'express';
import {
  verifyWhatsAppWebhook,
  handleWhatsAppWebhook,
} from '../controllers/webhookController';

// Create a new Express router instance.
const webhookRouter = Router();

/**
 * @route   GET /whatsapp
 * @desc    Handles the webhook verification request from Meta (WhatsApp).
 *          This is a one-time setup step to prove ownership of the endpoint.
 * @access  Public
 */
webhookRouter.get('/whatsapp', verifyWhatsAppWebhook);

/**
 * @route   POST /whatsapp
 * @desc    Receives real-time status updates and notifications from WhatsApp.
 * @access  Public
 */
webhookRouter.post('/whatsapp', handleWhatsAppWebhook);

export default webhookRouter;
