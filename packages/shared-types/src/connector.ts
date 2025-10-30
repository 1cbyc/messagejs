/**
 * Connector interface and related types.
 */

import type { ConnectorType, MessageStatus } from './dataModels';

/**
 * Base interface for all connectors.
 */
export interface IConnector {
  type: ConnectorType;
  name: string;

  /**
   * Validates the provided credentials by making a test request to the provider.
   * @returns True if the credentials are valid, false otherwise.
   */
  validate(): Promise<boolean>;

  /**
   * Gets the detailed connection status of the connector.
   * @returns A status object indicating if the connection was successful, with an optional message.
   */
  getStatus(): Promise<ConnectorStatus>;

  /**
   * Send a message
   */
  sendMessage(
    to: string,
    message: string,
    options?: SendOptions
  ): Promise<SendResult>;

}

export interface SendOptions {
  metadata?: Record<string, any>;
}

export interface SendResult {
  /** Indicates whether the message was successfully dispatched to the provider. */
  success: boolean;
  /** The unique identifier for the message from the third-party provider (e.g., wamid, SID). */
  externalId?: string;
  /** The status of the message as reported by the provider upon sending. */
  status: MessageStatus;
  /** An error message if the dispatch failed. */
  error?: string;
}

export interface ConnectorStatus {
  connected: boolean;
  message?: string;
}
