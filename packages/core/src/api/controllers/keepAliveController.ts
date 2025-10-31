/**
 * @file Contains the controller logic for the keep-alive endpoint.
 *
 * This controller's sole purpose is to provide a simple, lightweight endpoint
 * that can be pinged by an external service (like a cron job) to prevent the
 * server from spinning down on free hosting tiers.
 */

import { Request, Response } from 'express';

/**
 * @controller keepAlive
 * @description Responds with a simple success message to confirm the server is running.
 *
 * @route GET /api/v1/internal/keep-alive
 * @access Public (but ideally accessed via a secret URL or firewall rule if needed)
 *
 * @param {Request} _req - The Express request object (unused).
 * @param {Response} res - The Express response object.
 * @returns {Response} A 200 OK response with a status message.
 */
export const keepAlive = (_req: Request, res: Response): Response => {
  return res.status(200).json({ status: 'alive' });
};
