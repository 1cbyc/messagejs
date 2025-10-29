/**
 * @file The main entry point for the MessageJS client-side SDK.
 * This file defines the public MessageJS class, its methods, and exports a
 * singleton instance for easy use in web applications. The design is based
 * on the specifications in the SYSTEM_DESIGN.md document.
 */

// --- Public Interfaces ---

/**
 * Configuration options for initializing the MessageJS SDK.
 */
export interface MessageJSConfig {
  /**
   * The public API key for your MessageJS project.
   */
  apiKey: string;

  /**
   * The base URL of the MessageJS API. Defaults to the official cloud endpoint.
   * Useful for self-hosted instances.
   * @default "https://api.messagejs.com/v1"
   */
  baseUrl?: string;
}

/**
 * Parameters for the `sendMessage` method.
 */
export interface SendParams {
  /**
   * The ID of the connector configuration to use for sending the message.
   */
  connectorId: string;

  /**
   * The ID of the template to use.
   */
  templateId: string;

  /**
   * The recipient's identifier (e.g., E.164 phone number).
   */
  to: string;

  /**
   * An object of key-value pairs to replace variables in your template.
   */
  variables: Record<string, any>;

  /**
   * Optional metadata to associate with the message for logging or tracking.
   */
  metadata?: Record<string, any>;
}

/**
 * The standardized result object returned by the `sendMessage` method.
 */
export interface SendResult {
  /**
   * The unique ID of the message log created by the API.
   */
  messageId: string;

  /**
   * The initial status of the message. Will typically be 'queued'.
   */
  status: string;

  /**
   * An error message if the API request failed at the validation stage.
   */
  error?: string;
}

// --- SDK Class ---

/**
 * The core MessageJS class that handles configuration and API communication.
 */
class MessageJS {
  private apiKey?: string;
  private baseUrl: string = 'https://api.messagejs.com/v1';

  /**
   * Initializes the SDK with your project's public API key and optional configuration.
   * This method must be called before any other SDK methods.
   *
   * @param config The configuration object or a string containing just the API key.
   */
  public init(config: MessageJSConfig | string): void {
    if (typeof config === 'string') {
      this.apiKey = config;
    } else {
      this.apiKey = config.apiKey;
      if (config.baseUrl) {
        // Ensure the base URL doesn't have a trailing slash
        this.baseUrl = config.baseUrl.replace(/\/$/, '');
      }
    }
  }

  /**
   * Sends a message using a configured connector and template.
   *
   * @param params The parameters for the message to be sent.
   * @returns A promise that resolves with the result of the API call.
   */
  public async sendMessage(params: SendParams): Promise<SendResult> {
    if (!this.apiKey) {
      throw new Error(
        'MessageJS SDK is not initialized. Please call messagejs.init() with your API key first.',
      );
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (!response.ok) {
        // The API returned an error response
        const errorMessage = result.error?.message || `HTTP error! Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return {
        messageId: result.messageId,
        status: result.status,
      };
    } catch (error: any) {
      // Handle network errors or exceptions during the fetch call
      return Promise.reject(
        new Error(`Failed to send message: ${error.message}`),
      );
    }
  }
}

// --- Singleton Export ---

/**
 * A singleton instance of the MessageJS class.
 * Import this instance to use the SDK in your application.
 * @example
 * import { messagejs } from '@messagejs/client';
 *
 * messagejs.init('pk_live_your_api_key');
 * messagejs.sendMessage({ ... });
 */
export const messagejs = new MessageJS();
