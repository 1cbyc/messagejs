/**
 * @file Implements the IConnector interface for the WhatsApp Cloud API.
 *
 * This connector is responsible for sending messages via WhatsApp using Meta's
 * official Cloud API. It handles the specific authentication and request formatting
 * required by the WhatsApp service.
 */

import {
  IConnector,
  SendOptions,
  SendResult,
  ConnectorStatus,
} from './IConnector';
import { ServiceType } from '../types/dataModels';

/**
 * Defines the expected structure of the credentials object for this connector.
 */
interface WhatsAppCredentials {
  accessToken: string;
  phoneNumberId: string;
}

export class WhatsAppConnector implements IConnector {
  public readonly type: ServiceType = 'WHATSAPP';
  public readonly name: string = 'WhatsApp Cloud API';

  private credentials: WhatsAppCredentials;
  private readonly baseUrl = 'https://graph.facebook.com/v19.0'; // A recent, stable API version

  /**
   * Initializes the connector with the necessary credentials.
   * @param {any} credentials - The decrypted credentials object. Must contain accessToken and phoneNumberId.
   * @throws {Error} if the required credentials are not provided.
   */
  constructor(credentials: any) {
    if (!credentials.accessToken || !credentials.phoneNumberId) {
      throw new Error(
        'WhatsAppConnector requires an `accessToken` and a `phoneNumberId` in its credentials.',
      );
    }
    this.credentials = credentials;
  }

  /**
   * Validates the provided credentials by checking for their presence.
   * A real-world implementation would make a test API call to Meta's servers.
   * @returns {Promise<ConnectorStatus>} The status of the credential validation.
   */
  public async validate(): Promise<ConnectorStatus> {
    // In a production system, this method would make a lightweight API call
    // to verify the token is valid, e.g., fetching the business profile.
    if (this.credentials.accessToken && this.credentials.phoneNumberId) {
      return { success: true, message: 'Credentials format is correct.' };
    }
    return {
      success: false,
      message: 'Credentials are missing required fields.',
    };
  }

  /**
   * Sends a message using the WhatsApp Cloud API.
   * @param {SendOptions} options - The options for the message to be sent.
   * @returns {Promise<SendResult>} The result of the send operation.
   */
  public async sendMessage(options: SendOptions): Promise<SendResult> {
    const { to, template, variables } = options;
    const apiUrl = `${this.baseUrl}/${this.credentials.phoneNumberId}/messages`;

    // A simple variable replacement for the template body.
    // A more robust solution might use a library like Mustache.js.
    let messageBody = template.body;
    for (const key in variables) {
      messageBody = messageBody.replace(
        new RegExp(`{{${key}}}`, 'g'),
        variables[key],
      );
    }

    const requestBody = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: {
        body: messageBody,
      },
    };

    try {
      console.log(
        `[WhatsAppConnector] Simulating API call to: POST ${apiUrl}`,
      );
      console.log(
        `[WhatsAppConnector] Request Body:`,
        JSON.stringify(requestBody, null, 2),
      );

      // --- Mock API Call ---
      // In a real implementation, you would use a robust HTTP client like axios or node-fetch
      // to make the following request:
      /*
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error?.message || 'Unknown API error');
      }
      const externalId = responseData.messages[0]?.id;
      */

      // For now, we simulate a successful response after a short delay.
      await new Promise((resolve) => setTimeout(resolve, 250));
      const mockExternalId = `wamid.mock_${Date.now()}`;

      return {
        success: true,
        externalId: mockExternalId,
        details: { info: 'Message sent successfully (mocked response).' },
      };
    } catch (error: any) {
      console.error(`[WhatsAppConnector] Failed to send message: ${error.message}`);
      return {
        success: false,
        error: error.message,
        details: { info: 'The API call failed (mocked error).' },
      };
    }
  }
}
