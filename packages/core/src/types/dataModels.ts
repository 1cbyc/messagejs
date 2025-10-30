/**
 * @file Contains all core TypeScript interfaces for the database data models.
 * These interfaces define the shape of data used throughout the messagejs-core
 * application, as defined in the official SYSTEM_DESIGN.md document.
 */

/**
 * Represents a developer user who owns projects in the MessageJS system.
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  lastLogin: Date | null;
  createdAt: Date;
}

/**
 * Represents a project, which is a container for API keys, connectors,
 * and message logs.
 */
export interface Project {
  id: string;
  userId: string; // Foreign key to User
  name: string;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Represents an API key used for authenticating requests from the SDK.
 */
export interface APIKey {
  id: string;
  projectId: string; // Foreign key to Project
  keyHash: string; // The bcrypt/scrypt hash of the secret key
  publicKey: string; // The non-secret, user-facing part of the key
  lastUsed: Date | null;
  rateLimitConfig: Record<string, any> | null; // Project-specific rate limits
  isActive: boolean;
  createdAt: Date;
}

/**
 * A union type representing all supported messaging platforms.
 */
export type ConnectorType =
  | "whatsapp"
  | "telegram"
  | "twilio"
  | "vonage"
  | "sendgrid_sms";

/**
 * Represents the configuration for a third-party messaging service
 * linked to a project.
 */
export interface Connector {
  id: string;
  projectId: string; // Foreign key to Project
  type: ConnectorType;
  name: string;
  credentialsEncrypted: string; // AES-256 encrypted credentials
  config: Record<string, any> | null; // Provider-specific settings
  isActive: boolean;
  createdAt: Date;
}

/**
 * A union type representing the lifecycle status of a message.
 */
export type MessageStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "failed"
  | "undelivered";

/**
 * Represents a single message log entry, tracking its journey through the system.
 */
export interface Message {
  id: string;
  projectId: string; // Foreign key to Project
  apiKeyId: string; // Foreign key to APIKey used for the request
  connectorId: string; // Foreign key to Connector used
  status: MessageStatus;
  to: string; // Recipient identifier (e.g., phone number)
  content: Record<string, any> | null; // Stores template + params used
  metadata: Record<string, any> | null; // User-provided metadata
  externalId: string | null; // The ID from the third-party provider
  error: string | null; // Error message if the status is 'failed'
  sentAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
}

/**
 * Represents a reusable message template created by a user in the dashboard.
 */
export interface Template {
  id: string;
  projectId: string; // Foreign key to Project
  name: string;
  body: string; // The template body, e.g., "Your code is {{otp}}"
  createdAt: Date;
}
