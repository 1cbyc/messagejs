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
import logger from '../lib/logger';

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
      // Escape regex metacharacters in the key to prevent regex injection
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      messageBody = messageBody.replace(
        new RegExp(`{{${escapedKey}}}`, 'g'),
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
      // Use node's built-in fetch to make the API call to the WhatsApp Cloud API.
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = (await response.json()) as any;

      // If the response is not successful, parse the error and throw.
      if (!response.ok) {
        const errorMessage =
          responseData.error?.message || 'Unknown WhatsApp API error';
        throw new Error(errorMessage);
      }

      // Extract the message ID from the successful response.
      const externalId = responseData.messages?.[0]?.id;
      if (!externalId) {
        throw new Error('Could not find message ID in WhatsApp API response.');
      }

      return {
        success: true,
        externalId,
        details: { response: responseData },
      };
    } catch (error: any) {
      logger.error({ error, recipient: to }, 'WhatsApp connector failed to send message');
      return {
        success: false,
        error: error.message,
        details: { info: 'The API call to WhatsApp failed.' },
      };
    }
  }
}
