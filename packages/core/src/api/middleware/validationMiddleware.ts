/**
 * @file Contains a generic middleware for validating API requests using Zod.
 *
 * This module provides a reusable function that takes a Zod schema and returns
 * an Express middleware. The middleware automatically validates the incoming
 * request against the schema and handles validation errors by sending a
 * standardized 400 Bad Request response.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodObject } from 'zod';

/**
 * A higher-order function that creates an Express middleware for validating
 * the request body against a provided Zod schema.
 *
 * @param {z.ZodObject<any>} schema - The Zod schema to validate the request body against.
 * @returns An Express middleware function.
 *
 * @example
 * import { validate } from './validationMiddleware';
 * import { sendMessageSchema } from '../validation/messageValidation';
 *
 * router.post('/', validate(sendMessageSchema), messageController.sendMessage);
 */
export const validate =
  (schema: ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate only the request body. The parsed and sanitized body
      // will replace the original, stripping any unknown fields.
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // If the error is a ZodError, it means validation failed.
        // We format the errors into a more structured response.
        const formattedErrors = error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));

        return res.status(400).json({
          error: {
            code: 'INVALID_INPUT',
            message: 'Input validation failed.',
            details: formattedErrors,
          },
        });
      }

      // For any other unexpected errors, pass them to the global error handler.
      // This ensures we don't accidentally swallow server errors.
      return next(error);
    }
  };
