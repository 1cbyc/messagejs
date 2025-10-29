/**
 * @file Contains TypeScript types and interfaces related to security,
 * including authentication, authorization, and Express request augmentation.
 * These definitions are based on the specifications in the SYSTEM_DESIGN.md document.
 */

// We need to extend the global Express namespace to add our custom properties.
// This is the standard way to augment the Request object in TypeScript.
declare global {
  namespace Express {
    export interface Request {
      /**
       * The authenticated user object, attached by the JWT authentication middleware.
       * This is available on routes protected for logged-in users (e.g., dashboard APIs).
       */
      user?: JWTPayload;

      /**
       * The API key object, validated and attached by the API key validation middleware.
       * This is available on public-facing SDK routes (e.g., /api/v1/messages).
       */
      apiKey?: {
        id: string;
        projectId: string;
      };
    }
  }
}

/**
 * Defines the structure of the payload stored within a JSON Web Token (JWT).
 * This data is set during login and decoded by middleware for authenticated routes.
 */
export interface JWTPayload {
  /**
   * The unique identifier of the user (User ID).
   */
  userId: string;

  /**
   * The email address of the user. Stored for convenience, but the userId is the
   * primary identifier for database lookups.
   */
  email: string;

  /**
   * The standard "issued at" timestamp (in seconds since epoch).
   */
  iat: number;

  /**
   * The standard "expiration time" timestamp (in seconds since epoch).
   */
  exp: number;
}
