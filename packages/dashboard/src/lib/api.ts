/**
 * @file API client for the MessageJS dashboard.
 *
 * This module provides a centralized and typed way to interact with the
 * MessageJS Core backend API. It uses `fetch` and handles common logic
 * like setting the base URL, headers, and parsing responses.
 */

import {
  ApiErrorResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  GetProjectsResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@messagejs/shared-types';

// The base URL for the API. It defaults to the local development server,
// but can be overridden by an environment variable for production.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

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
 *
 * @param userData The data required for registration.
 * @returns A promise that resolves with the user and token information.
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
 *
 * @param credentials The user's email and password.
 * @returns A promise that resolves with the user and token information.
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
 * Fetches the list of projects for the currently authenticated user.
 *
 * @returns A promise that resolves with the list of projects.
 */
export const getProjects = (): Promise<GetProjectsResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    // If there's no token, we can't make an authenticated request.
    // This will cause a redirect to the login page in the UI layer.
    return Promise.reject(new Error('Authentication token not found.'));
  }

  return apiFetch<GetProjectsResponse>('/projects', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Creates a new project for the currently authenticated user.
 *
 * @param projectData The data required for creating a project.
 * @returns A promise that resolves with the created project.
 */
export const createProject = (
  projectData: CreateProjectRequest,
): Promise<CreateProjectResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return Promise.reject(new Error('Authentication token not found.'));
  }

  return apiFetch<CreateProjectResponse>('/projects', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });
};
