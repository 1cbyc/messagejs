/**
 * @file Contains all TypeScript interfaces for API requests and responses.
 * These types define the public contract for the messagejs-core REST API,
 * as specified in the SYSTEM_DESIGN.md document.
 */

import { Project } from "./dataModels";

// --- Generic API Types ---

/**
 * Defines the standard structure for a detailed API error, following the design document.
 */
export interface ApiError {
  /**
   * A machine-readable error code.
   * @example "INVALID_INPUT"
   */
  code: string;
  /**
   * A human-readable message explaining the error.
   * @example "The 'to' field must be a valid E.164 phone number."
   */
  message: string;
  /**
   * Optional additional details about the error.
   * @example { "field": "to", "value": "+1555123456" }
   */
  details?: Record<string, any>;
}

/**
 * Defines the standard wrapper for any API response that returns an error.
 */
export interface ApiErrorResponse {
  error: ApiError;
}

// --- Message Sending API: POST /api/v1/messages ---

/**
 * Defines the request body for sending a message.
 * This is the primary data contract for the client SDK.
 */
export interface SendMessageRequest {
  serviceId: string;
  templateId: string;
  recipient: string;
  variables?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Defines the successful response from the message sending endpoint (202 Accepted).
 * This confirms that the message has been successfully queued for processing.
 */
export interface SendMessageSuccessResponse {
  messageId: string;
  status: "queued";
  externalId: string | null;
  details: string;
}

/**
 * A union type representing all possible responses from the POST /api/v1/messages endpoint.
 * This allows for type-safe handling of success and error cases.
 */
export type SendMessageResponse = SendMessageSuccessResponse | ApiErrorResponse;

// --- Authentication API: /api/v1/auth ---

/**
 * Request body for user registration.
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

/**
 * Successful response from user registration or login.
 */
export interface AuthSuccessResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  token: string;
}

/**
 * A union type for the registration endpoint response.
 */
export type RegisterResponse = AuthSuccessResponse | ApiErrorResponse;

/**
 * Request body for user login.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * A union type for the login endpoint response.
 */
export type LoginResponse = AuthSuccessResponse | ApiErrorResponse;

// --- Project Management API: /api/v1/projects ---

/**
 * Request body for creating a new project.
 */
export interface CreateProjectRequest {
  name: string;
}

/**
 * A successful response for project creation will return the full project object.
 */
export type CreateProjectResponse = Project | ApiErrorResponse;

/**
 * A successful response for listing projects.
 */
export interface GetProjectsResponse {
  projects: Project[];
}
