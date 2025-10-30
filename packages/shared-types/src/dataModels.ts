/**
 * Core data models as defined in the system design.
 * These represent the database entities and shared types.
 */

/**
 * Represents a developer user who owns projects in the MessageJS system.
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

/**
 * Represents a project, which is a container for API keys, connectors,
 * and message logs.
 */
export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: Date;
}

/**
 * Represents an API key used for authenticating requests from the SDK.
 */
export interface APIKey {
  id: string;
  projectId: string;
  name: string;
  lastUsed?: Date;
  expiresAt?: Date;
  rateLimit: number;
  isActive: boolean;
}

/**
 * A union type representing all supported messaging platforms.
 */
export type ConnectorType =
  | 'whatsapp'
  | 'telegram'
  | 'twilio'
  | 'smtp'
  | 'slack'
  | 'discord';

/**
 * Represents the configuration for a third-party messaging service
 * linked to a project.
 */
export interface Connector {
  id: string;
  projectId: string;
  type: ConnectorType;
  name: string;
  credentials: Record<string, any>;
  config?: Record<string, any>;
  isActive: boolean;
}

/**
 * A union type representing the lifecycle status of a message.
 */
export type MessageStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'read';

/**
 * Represents a single message log entry, tracking its journey through the system.
 */
export interface Message {
  id: string;
  projectId: string;
  connectorId?: string;
  templateId?: string;
  status: MessageStatus;
  to: string;
  text: string;
  variables?: Record<string, any>;
  metadata?: Record<string, any>;
  error?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

/**
 * Represents a reusable message template created by a user in the dashboard.
 */
export interface Template {
  id: string;
  projectId: string;
  name: string;
  connectorType: ConnectorType;
  content: string;
  variables: string[];
  isActive: boolean;
}
