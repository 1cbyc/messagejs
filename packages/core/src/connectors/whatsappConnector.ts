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
  ConnectorType,
} from '@messagejs/shared-types';
import logger from '../lib/logger';

/**
 * Defines the expected structure of the credentials object for this connector.
 */
interface WhatsAppCredentials {
  accessToken: string;
  phoneNumberId: string;
}

export class WhatsAppConnector implements IConnector {
  // Use the lowercase string union type for public consistency.
  public readonly type: ConnectorType = 'whatsapp';
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

  public async validate(): Promise<boolean> {
    const status = await this.getStatus();
    return status.connected;
  }

  public async getStatus(): Promise<ConnectorStatus> {
    // A real validation should make a lightweight API call to Meta.
    // For now, we just check for presence, which is sufficient for basic setup.
    if (this.credentials.accessToken && this.credentials.phoneNumberId) {
      return {
        connected: true,
        message: 'Credentials appear to be valid.',
      };
    }
    return {
      connected: false,
      message: 'Credentials are missing required fields.',
    };
  }

  /**
   * Sends a message using the WhatsApp Cloud API.
   * @param {SendOptions} options - The options for the message to be sent.
   * @returns {Promise<SendResult>} The result of the send operation.
   */
  // The signature now matches the standardized IConnector interface.
  public async sendMessage(
    to: string,
    message: string,
    _options?: SendOptions, // options is available for future use (e.g., metadata)
  ): Promise<SendResult> {
    const apiUrl = `${this.baseUrl}/${this.credentials.phoneNumberId}/messages`;

    const requestBody = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: {
        body: message, // The message is now passed directly, already rendered.
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
        externalId: externalId,
        status: 'sent',
      };
    } catch (error: any) {
      logger.error({ error, recipient: to }, 'WhatsApp connector failed to send message');
      return {
        success: false,
        error: error.message,
        status: 'failed',
      };
    }
  }

}
