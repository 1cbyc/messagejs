/**
 * @file Contains the controller logic for handling user authentication (registration and login).
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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
const JWT_EXPIRES_IN = '7d'; // Token will be valid for 7 days

if (!JWT_SECRET) {
  logger.fatal('FATAL: JWT_SECRET environment variable is not defined.');
  throw new Error('JWT_SECRET must be defined in the environment variables.');
}

/**
 * Generates a JSON Web Token for a given user.
 * @param userId - The ID of the user.
 * @param email - The email of the user.
 * @returns {string} The generated JWT.
 */
const generateToken = (userId: string, email: string): string => {
  const payload = { userId, email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
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

    // 5. Send the successful response
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
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

    // 4. Send the successful response
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
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
