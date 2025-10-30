/**
 * @file Defines the API routes for user authentication operations.
 * This router handles all endpoints under the `/api/v1/auth` path.
 */

import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { validate } from '../middleware/validationMiddleware';
import { registerSchema, loginSchema } from '../validation/authValidation';
import { authRateLimitMiddleware } from '../middleware/authRateLimitMiddleware';

// Create a new Express router instance.
const authRouter = Router();

/**
 * @route   POST /register
 * @desc    Handles new user registration. The request body is validated against the registerSchema.
 * @access  Public
 */
authRouter.post('/register', authRateLimitMiddleware, validate(registerSchema), register);

/**
 * @route   POST /login
 * @desc    Handles user login. The request body is validated against the loginSchema.
 * @access  Public
 */
authRouter.post('/login', authRateLimitMiddleware, validate(loginSchema), login);

export default authRouter;
