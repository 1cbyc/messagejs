/**
 * @file Internal/administrative routes for the MessageJS API.
 * 
 * These routes are used for operational tasks like cron jobs,
 * health checks, and maintenance operations.
 */

import { Router, Request, Response } from 'express';
import logger from '../../lib/logger';

const internalRouter = Router();

/**
 * @route   GET /ping
 * @desc    Simple ping endpoint called by external cron services to keep the
 *          service alive. This prevents Render free tier from spinning down.
 *          The inline worker automatically processes jobs when the service is awake.
 * @access  Public (protected by INTERNAL_SECRET_KEY environment variable)
 */
internalRouter.get('/ping', async (req: Request, res: Response) => {
  // Verify the secret key for security
  const providedSecret = req.query.secret;
  const expectedSecret = process.env.INTERNAL_SECRET_KEY;

  if (!expectedSecret || providedSecret !== expectedSecret) {
    logger.warn(
      { ip: req.ip, userAgent: req.headers['user-agent'] },
      'Unauthorized access attempt to internal ping endpoint',
    );
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied',
      },
    });
  }

  logger.info('Cron keeper ping received - service is awake');
  
  // Return success - the inline worker will process jobs automatically
  return res.status(200).json({
    status: 'ok',
    message: 'Service is active and processing queue',
    timestamp: new Date().toISOString(),
  });
});

export default internalRouter;

