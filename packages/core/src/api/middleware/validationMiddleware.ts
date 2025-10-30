/**
 * @file Contains a generic middleware for validating API requests using Zod.
 *
 * This module provides a reusable function that takes a Zod schema and returns
 * an Express middleware. The middleware automatically validates the incoming
 * request against the schema and handles validation errors by sending a
 * standardized 400 Bad Request response.
 */

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * A higher-order function that creates an Express middleware for validating
 * requests against a provided Zod schema.
 *
 * @param {AnyZodObject} schema - The Zod schema to validate the request against.
 * @returns An Express middleware function.
 *
 * @example
 * import { validate } from './validationMiddleware';
 * import { sendMessageSchema } from '../validation/messageValidation';
 *
 * router.post('/', validate(sendMessageSchema), messageController.sendMessage);
 */
export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Asynchronously parse and validate the request object.
      // This allows Zod to handle async refinements if they are ever added.
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // If validation is successful, proceed to the next middleware or controller.
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // If the error is a ZodError, it means validation failed.
        // We format the errors into a more structured response.
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
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
