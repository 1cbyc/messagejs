/**
 * @file Contains the controller logic for handling user authentication (registration and login).
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import {
  AuthSuccessResponse,
  ApiErrorResponse,
  RegisterRequest,
  LoginRequest,
} from '@messagejs/shared-types';

// --- JWT Configuration ---
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  logger.fatal('FATAL: JWT_SECRET environment variable is not defined.');
  throw new Error('JWT_SECRET must be defined in the environment variables.');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d'; // Token expiration time (default: 7 days)
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'authToken'; // Cookie name for JWT
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds (matches JWT_EXPIRES_IN default)
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Generates a JSON Web Token for a given user.
 * @param userId - The ID of the user.
 * @param email - The email of the user.
 * @returns {string} The generated JWT.
 */
const generateToken = (userId: string, email: string): string => {
  const payload = { userId, email };
  const options = { expiresIn: JWT_EXPIRES_IN as StringValue | number };
  return jwt.sign(payload, JWT_SECRET as string, options);
};

/**
 * Sets an http-only cookie with the JWT token.
 * @param res - Express response object.
 * @param token - The JWT token to set in the cookie.
 */
const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true, // Prevents JavaScript access (protects against XSS)
    secure: isProduction, // Only send over HTTPS in production
    sameSite: 'lax', // CSRF protection (allows same-site requests)
    maxAge: COOKIE_MAX_AGE, // Cookie expiration
    path: '/', // Available to all paths
  });
};

/**
 * Clears the authentication cookie.
 * @param res - Express response object.
 */
const clearAuthCookie = (res: Response): void => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  });
};

/**
 * @controller register
 * @description Handles new user registration.
 * @route POST /api/v1/auth/register
 */
export const register = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response<AuthSuccessResponse | ApiErrorResponse>,
) => {
  const { email, password, name } = req.body;

  try {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'USER_EXISTS',
          message: 'A user with this email address already exists.',
        },
      });
    }

    // 2. Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Create the new user in the database
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    // 4. Generate a JWT for the new user
    const token = generateToken(user.id, user.email);

    // 5. Set http-only cookie with the token
    setAuthCookie(res, token);

    // 6. Send the successful response (token is in http-only cookie, not in response body)
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    // Check for Prisma's unique constraint violation error
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({
        error: {
          code: 'USER_EXISTS',
          message: 'A user with this email address already exists.',
        },
      });
    }

    logger.error({ err: error }, 'Error during user registration.');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during registration.',
      },
    });
  }
};

/**
 * @controller login
 * @description Handles user login.
 * @route POST /api/v1/auth/login
 */
export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response<AuthSuccessResponse | ApiErrorResponse>,
) => {
  const { email, password } = req.body;

  try {
    // 1. Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Use a generic error message to prevent user enumeration attacks
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    // 2. Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    // 3. Generate a JWT for the authenticated user
    const token = generateToken(user.id, user.email);

    // 4. Set http-only cookie with the token
    setAuthCookie(res, token);

    // 5. Send the successful response (token is in http-only cookie, not in response body)
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Error during user login.');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during login.',
      },
    });
  }
};

/**
 * @controller logout
 * @description Handles user logout by clearing the authentication cookie.
 * @route POST /api/v1/auth/logout
 */
export const logout = async (
  _req: Request,
  res: Response<{ message: string } | ApiErrorResponse>,
) => {
  try {
    // Clear the http-only cookie
    clearAuthCookie(res);

    return res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error({ err: error }, 'Error during user logout.');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during logout.',
      },
    });
  }
};
