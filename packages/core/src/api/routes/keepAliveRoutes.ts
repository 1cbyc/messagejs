/**
 * @file Defines the API route for the keep-alive endpoint.
 * This router handles the GET /api/v1/internal/keep-alive path.
 */

import { Router } from 'express';
import { keepAlive } from '../controllers/keepAliveController';

// Create a new Express router instance.
const keepAliveRouter = Router();

/**
 * @route   GET /
 * @desc    A simple endpoint to keep the service alive on free hosting tiers.
 * @access  Public
 */
keepAliveRouter.get('/', keepAlive);

export default keepAliveRouter;
