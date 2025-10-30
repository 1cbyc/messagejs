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
   * @default "https://api.messagejs.pro/api/v1"
   */
  baseUrl?: string;

  /**
   * The number of times to retry a failed request. Defaults to 0.
   * Retries are only attempted on 429 (Rate Limit) and 5xx server errors.
   * @default 0
   */
  retries?: number;
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
   * The initial status of the message. Will always be 'queued' upon success.
   */
  status: 'queued';

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
  private baseUrl: string = 'https://api.messagejs.pro/api/v1';
  private retries: number = 0;

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
      if (config.retries) {
        this.retries = Math.max(0, config.retries);
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

    let lastError: Error = new Error('Failed to send message.');
    const idempotencyKey = crypto.randomUUID();

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        // On subsequent attempts, wait with exponential backoff + jitter.
        if (attempt > 0) {
          const delay = 100 * Math.pow(2, attempt - 1) + Math.random() * 100;
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const response = await fetch(`${this.baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify({
            connectorId: params.connectorId,
            templateId: params.templateId,
            to: params.to,
            variables: params.variables,
          }),
        });

        if (response.ok) {
          return (await response.json()) as SendResult;
        }

        // --- Handle non-retryable errors ---
        // For 4xx errors other than 429, we fail immediately.
        if (response.status !== 429 && response.status < 500) {
          const errorBody = (await response.json()) as any;
          const message =
            errorBody.error?.message || `HTTP error! Status: ${response.status}`;
          throw new Error(message);
        }

        // --- Handle retryable errors ---
        // For 429 or 5xx errors, we set the last error and let the loop continue.
        lastError = new Error(`HTTP error! Status: ${response.status}`);
      } catch (error: any) {
        // Catches network errors and non-retryable errors thrown above.
        lastError = error;
        // If the error was non-retryable, we exit the loop immediately.
        if (error.message.startsWith('HTTP error!')) {
          break;
        }
      }
    }

    // If we've exhausted all retries, throw the last error we saw.
    throw lastError;
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
