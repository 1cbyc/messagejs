/**
 * TypeScript interfaces for API requests and responses.
 */

import { Project } from './dataModels';

/**
 * Defines the standard structure for a detailed API error.
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Defines the standard wrapper for any API response that returns an error.
 */
export interface ApiErrorResponse {
  error: ApiError;
}

// --- Message Sending API ---

/**
 * Defines the request body for the `POST /api/v1/messages` endpoint.
 * This contract is used by the client SDK to send a message.
 */
export interface SendMessageRequest {
  /** The recipient's identifier (e.g., phone number). */
  to: string;
  /** The unique identifier for the connector to use (`conn_...`). */
  connectorId: string;
  /** The unique identifier for the template to use (`tpl_...`). */
  templateId: string;
  /** A key-value map of variables to be interpolated into the template. */
  variables: Record<string, any>;
}

/**
 * The successful response for a sendMessage request, indicating the message
 * has been accepted and queued for processing.
 */
export interface SendMessageSuccessResponse {
  messageId: string;
  status: 'queued';
}

// --- Authentication API ---

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSuccessResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  token: string;
}

export type RegisterResponse = AuthSuccessResponse | ApiErrorResponse;
export type LoginResponse = AuthSuccessResponse | ApiErrorResponse;

// --- Project Management API ---

export interface CreateProjectRequest {
  name: string;
}

export type CreateProjectResponse = Project | ApiErrorResponse;

export interface GetProjectsResponse {
  projects: Project[];
}

// Re-export MessageStatus for convenience
import type { MessageStatus } from './dataModels';
export type { MessageStatus };
