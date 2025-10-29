/**
 * @file Defines the core interfaces for the pluggable connector system.
 * Every messaging provider connector must implement the IConnector interface
 * to be compatible with the messagejs-core system.
 * This design is based on the specifications in the SYSTEM_DESIGN.md document.
 */

import { ConnectorType, MessageStatus, Template } from '../types/dataModels';

/**
 * Defines the options for sending a message through a connector.
 */
export interface SendOptions {
  /**
   * The recipient's identifier (e.g., phone number, chat ID).
   */
  to: string;

  /**
   * The full template object retrieved from the database, which contains
   * the message body and other details.
   */
  template: Template;

  /**
   * A key-value map of variables to be injected into the template's content.
   */
  variables: Record<string, any>;

  /**
   * Optional user-provided metadata to be logged with the message.
   */
  metadata?: Record<string, any>;
}

/**
 * Defines the standardized result format for a sendMessage operation.
 */
export interface SendResult {
  /**
   * A boolean indicating whether the message was successfully accepted
   * by the third-party provider's API.
   */
  success: boolean;

  /**
   * The unique identifier for the message from the third-party provider.
   * This is crucial for tracking message status later.
   */
  externalId?: string;

  /**
   * A descriptive error message if the `success` flag is false.
   */
  error?: string;

  /**
   * Any additional details or metadata returned by the provider's API.
   */
  details?: Record<string, any>;
}

/**
 * Defines the standardized result format for a connector's `validate` method.
 */
export interface ConnectorStatus {
  /**
   * A boolean indicating whether the connector's credentials and configuration
   * are valid.
   */
  success: boolean;

  /**
   * A human-readable message describing the status.
   * e.g., "Credentials are valid." or "Invalid API Token."
   */
  message: string;
}

/**
 * The core interface that every connector implementation must adhere to.
 */
export interface IConnector {
  /**
   * The type of the connector (e.g., 'whatsapp'). Must match a value from ConnectorType.
   */
  readonly type: ConnectorType;

  /**
   * A user-friendly name for the connector implementation (e.g., "WhatsApp Cloud API").
   */
  readonly name: string;

  /**
   * Validates the provided credentials by making a simple, non-sending API call
   * to the third-party service (e.g., fetching account info).
   * This method should throw an error for unrecoverable issues (e.g., network failure)
   * but return a `ConnectorStatus` object for validation results.
   *
   * @returns A promise that resolves with the validation status.
   */
  validate(): Promise<ConnectorStatus>;

  /**
   * Processes and sends a message to the third-party API.
   *
   * @param options The message sending options, including recipient, template, and variables.
   * @returns A promise that resolves with the result of the send operation.
   */
  sendMessage(options: SendOptions): Promise<SendResult>;

  /**
   * (Optional) Fetches the delivery status of a previously sent message from the
   * third-party service, if the provider supports it.
   *
   * @param externalId The unique ID returned by the provider in the initial `SendResult`.
   * @returns A promise that resolves with the message's current `MessageStatus`.
   */
  getStatus?(externalId: string): Promise<MessageStatus>;
}
