/**
 * Type augmentation for Express Request object
 */
import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    apiKey?: {
      id: string;
      projectId: string;
      rateLimit: number;
    };
    // Add the user property for JWT authenticated routes
    user?: {
      id: string;
      email: string;
    };
  }
}
