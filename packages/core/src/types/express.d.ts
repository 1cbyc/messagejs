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
  }
}
