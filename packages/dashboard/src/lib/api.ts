/**
 * @file API client for the MessageJS dashboard.
 *
 * This module provides a centralized and typed way to interact with the
 * MessageJS Core backend API. It uses `fetch` and handles common logic
 * like setting the base URL, headers, and parsing responses.
 */

import {
  ApiErrorResponse,
  CreateConnectorRequest,
  CreateProjectRequest,
  CreateProjectResponse,
  GetApiKeysResponse,
  GetConnectorsResponse,
  GetProjectsResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  CreateTemplateRequest,
  GetTemplatesResponse,
  TemplateResponse,
  GetMessagesResponse,
  ProjectStatsResponse,
} from '@messagejs/shared-types';

// The base URL for the API. Must be set via NEXT_PUBLIC_API_URL environment variable.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
}

/**
 * A generic and reusable fetch wrapper for the MessageJS API.
 *
 * @param endpoint The API endpoint to request (e.g., '/auth/register').
 * @param options Standard `fetch` options.
 * @returns A promise that resolves to the parsed JSON response.
 * @throws An `Error` with a user-friendly message if the API returns an error.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Include cookies (http-only auth token) in requests
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // If the response is not OK, we expect an ApiErrorResponse shape.
      const errorData = data as ApiErrorResponse;
      const errorMessage =
        errorData.error?.message ||
        `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error) {
    // Catch network errors or if the server is down.
    if (error instanceof TypeError) {
      throw new Error('Network error or API is unreachable.');
    }
    // Re-throw errors from the API response.
    throw error;
  }
}

/**
 * Registers a new user account.
 * Authentication token is automatically set as http-only cookie by the backend.
 *
 * @param userData The data required for registration.
 * @returns A promise that resolves with the user information.
 */
export const registerUser = (
  userData: RegisterRequest,
): Promise<RegisterResponse> => {
  return apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

/**
 * Logs in an existing user.
 * Authentication token is automatically set as http-only cookie by the backend.
 *
 * @param credentials The user's email and password.
 * @returns A promise that resolves with the user information.
 */
export const loginUser = (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

/**
 * Logs out the current user by clearing the authentication cookie.
 *
 * @returns A promise that resolves when logout is complete.
 */
export const logoutUser = async (): Promise<void> => {
  await apiFetch<{ message: string }>('/auth/logout', {
    method: 'POST',
  });
};

/**
 * Fetches the list of projects for the currently authenticated user.
 *
 * @returns A promise that resolves with the list of projects.
 */
export const getProjects = (): Promise<GetProjectsResponse> => {
  // Authentication is handled via http-only cookie, no need to pass token manually
  return apiFetch<GetProjectsResponse>('/projects', {
    method: 'GET',
  });
};

/**
 * Creates a new project for the currently authenticated user.
 *
 * @param projectData The data required for project creation.
 * @returns A promise that resolves with the created project.
 */
export const createProject = (
  projectData: CreateProjectRequest,
): Promise<CreateProjectResponse> => {
  // Authentication is handled via http-only cookie
  return apiFetch<CreateProjectResponse>('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
};

/**
 * Fetches the list of API keys for a specific project.
 */
export const getApiKeys = (projectId: string): Promise<GetApiKeysResponse> => {
  // Authentication is handled via http-only cookie
  return apiFetch<GetApiKeysResponse>(`/projects/${projectId}/keys`, {
    method: 'GET',
  });
};

/**
 * Creates a new API key for a specific project.
 * The response will contain the plaintext API key.
 */
export const createApiKey = (
  projectId: string,
): Promise<{ apiKey: string }> => {
  // Authentication is handled via http-only cookie
  return apiFetch<{ apiKey: string }>(`/projects/${projectId}/keys`, {
    method: 'POST',
  });
};

/**
 * Deletes an API key from a project.
 */
export const deleteApiKey = (
  projectId: string,
  keyId: string,
): Promise<void> => {
  // Authentication is handled via http-only cookie
  return apiFetch<void>(`/projects/${projectId}/keys/${keyId}`, {
    method: 'DELETE',
  });
};

/**
 * Fetches the list of connectors for a specific project.
 */
export const getConnectors = (
  projectId: string,
): Promise<GetConnectorsResponse> => {
  // Authentication is handled via http-only cookie
  return apiFetch<GetConnectorsResponse>(`/projects/${projectId}/connectors`, {
    method: 'GET',
  });
};

/**
 * Creates a new connector for a specific project.
 */
export const createConnector = (
  projectId: string,
  connectorData: CreateConnectorRequest,
): Promise<void> => {
  // Authentication is handled via http-only cookie
  return apiFetch<void>(`/projects/${projectId}/connectors`, {
    method: 'POST',
    body: JSON.stringify(connectorData),
  });
};

/**
 * Deletes a connector from a project.
 */
export const deleteConnector = (
  projectId: string,
  connectorId: string,
): Promise<void> => {
  // Authentication is handled via http-only cookie
  return apiFetch<void>(`/projects/${projectId}/connectors/${connectorId}`, {
    method: 'DELETE',
  });
};

/**
 * Fetches the list of templates for a specific project.
 */
export const getTemplates = (
  projectId: string,
): Promise<GetTemplatesResponse> => {
  // Authentication is handled via http-only cookie
  return apiFetch<GetTemplatesResponse>(`/projects/${projectId}/templates`, {
    method: 'GET',
  });
};

/**
 * Creates a new template for a specific project.
 */
export const createTemplate = (
  projectId: string,
  templateData: CreateTemplateRequest,
): Promise<TemplateResponse> => {
  // Authentication is handled via http-only cookie
  return apiFetch<TemplateResponse>(`/projects/${projectId}/templates`, {
    method: 'POST',
    body: JSON.stringify(templateData),
  });
};

/**
 * Deletes a template from a project.
 */
export const deleteTemplate = (
  projectId: string,
  templateId: string,
): Promise<void> => {
  // Authentication is handled via http-only cookie
  return apiFetch<void>(`/projects/${projectId}/templates/${templateId}`, {
    method: 'DELETE',
  });
};

/**
 * Fetches a paginated list of message logs for a specific project.
 */
export const getMessages = (
  projectId: string,
  limit: number,
  offset: number,
): Promise<GetMessagesResponse> => {
  // Authentication is handled via http-only cookie
  const query = new URLSearchParams({
    projectId,
    limit: String(limit),
    offset: String(offset),
  }).toString();

  return apiFetch<GetMessagesResponse>(`/messages?${query}`, {
    method: 'GET',
  });
};

/**
 * Fetches analytics and statistics for a specific project.
 */
export const getProjectStats = (
  projectId: string,
): Promise<ProjectStatsResponse> => {
  // Authentication is handled via http-only cookie
  return apiFetch<ProjectStatsResponse>(`/projects/${projectId}/analytics`, {
    method: 'GET',
  });
};
