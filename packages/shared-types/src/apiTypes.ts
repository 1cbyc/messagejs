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

// --- Connector Management API ---

import { ConnectorType } from './dataModels';

export interface CreateConnectorRequest {
  type: ConnectorType;
  credentials: Record<string, any>;
}

export interface ConnectorResponse {
  id: string;
  type: string; // Prisma enum will be a string here
  createdAt: string;
}

export interface GetConnectorsResponse {
  connectors: ConnectorResponse[];
}

// --- Template Management API ---

export interface CreateTemplateRequest {
  name: string;
  content: string;
  variables?: string[];
  connectorType: ConnectorType;
}

export interface TemplateResponse {
  id: string;
  name: string;
  connectorType: string; // Prisma's `ServiceType` enum
  body: string; // Note: `content` on request, `body` on response
  variables: string | null; // Stored as a JSON string
  createdAt: string;
}

export interface GetTemplatesResponse {
  templates: TemplateResponse[];
}

// --- Template Management API ---

export interface CreateTemplateRequest {
  name: string;
  content: string;
  variables?: string[];
  connectorType: ConnectorType;
}

export interface TemplateResponse {
  id: string;
  name: string;
  connectorType: string; // Prisma's `ServiceType` enum
  body: string; // Note: `content` on request, `body` on response
  variables: string | null; // Stored as a JSON string
  createdAt: string;
}

export interface GetTemplatesResponse {
  templates: TemplateResponse[];
}

// --- Message Log API ---

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
}

export interface MessageLogResponse {
  id: string;
  status: string; // Prisma's `MessageStatus` enum
  recipient: string;
  externalMessageId: string | null;
  error: string | null;
  timestamp: string; // ISO date string
  variables: Record<string, any> | null;
  sentAt: string | null;
  deliveredAt: string | null;
  serviceType: string;
}

export interface GetMessagesResponse {
  messages: MessageLogResponse[];
  pagination: Pagination;
}

// Re-export MessageStatus for convenience
import type { MessageStatus } from './dataModels';
export type { MessageStatus };
