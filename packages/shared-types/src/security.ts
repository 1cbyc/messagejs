/**
 * Security-related types including authentication and authorization.
 */

/**
 * Defines the structure of the payload stored within a JSON Web Token (JWT).
 */
export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

