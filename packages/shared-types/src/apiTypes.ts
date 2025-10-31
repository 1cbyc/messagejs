/**
 * TypeScript interfaces for API requests and responses.
 * These types define the public contract between the frontend dashboard/SDK and the backend API.
 */

import { ConnectorType, MessageStatus, Project } from './dataModels';

// --- Generic API Types ---

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

// --- Message Sending API (for SDK) ---

/**
 * Defines the request body for the `POST /api/v1/messages` endpoint.
 */
export interface SendMessageRequest {
  to: string;
  connectorId: string;
  templateId: string;
  variables: Record<string, any>;
}

/**
 * The successful response for a sendMessage request.
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
  // token is optional - it's now stored in http-only cookie instead of response body
  token?: string;
}

export type RegisterResponse = AuthSuccessResponse; // Success only, errors are thrown
export type LoginResponse = AuthSuccessResponse; // Success only, errors are thrown

// --- Project Management API ---

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export type CreateProjectResponse = Project;

export interface GetProjectsResponse {
  projects: Project[];
}

// --- API Key Management API ---

export interface ApiKeyResponse {
  id: string;
  publicKey: string;
  createdAt: string;
}

export interface GetApiKeysResponse {
  apiKeys: ApiKeyResponse[];
}

// --- Connector Management API ---

export interface CreateConnectorRequest {
  type: ConnectorType;
  credentials: Record<string, any>;
}

export interface ConnectorResponse {
  id: string;
  type: string;
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
  connectorType: string;
  body: string;
  variables: string | null;
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
  status: string;
  recipient: string;
  externalMessageId: string | null;
  error: string | null;
  timestamp: string;
  variables: Record<string, any> | null;
  sentAt: string | null;
  deliveredAt: string | null;
  serviceType: string;
}

export interface GetMessagesResponse {
  messages: MessageLogResponse[];
  pagination: Pagination;
}

// --- Analytics API ---

export interface ProjectStatsResponse {
  totalMessages: number;
  statusCounts: {
    queued: number;
    sent: number;
    delivered: number;
    failed: number;
    undelivered: number;
  };
  successRate: number; // Percentage (0-100)
  deliveryRate: number; // Percentage (0-100)
  timeSeries: Array<{
    date: string; // YYYY-MM-DD
    total: number;
    sent: number;
    delivered: number;
    failed: number;
  }>;
  connectorDistribution: Record<string, number>; // connectorType -> count
}
