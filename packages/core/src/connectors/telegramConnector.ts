/**
 * @file Implements the IConnector interface for the Telegram Bot API.
 *
 * This connector is responsible for sending messages via Telegram using the official
 * Bot API. It handles authentication via bot tokens and request formatting required
 * by the Telegram service.
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
interface TelegramCredentials {
  botToken: string;
}

export class TelegramConnector implements IConnector {
  public readonly type: ConnectorType = 'telegram';
  public readonly name: string = 'Telegram Bot API';

  private credentials: TelegramCredentials;
  private readonly baseUrl = 'https://api.telegram.org/bot';

  /**
   * Initializes the connector with the necessary credentials.
   * @param {any} credentials - The decrypted credentials object. Must contain botToken.
   * @throws {Error} if the required credentials are not provided.
   */
  constructor(credentials: any) {
    if (!credentials.botToken) {
      throw new Error(
        'TelegramConnector requires a `botToken` in its credentials.',
      );
    }
    this.credentials = credentials;
  }

  /**
   * Validates the provided credentials by making a test request to Telegram.
   * @returns {Promise<boolean>} True if the credentials are valid, false otherwise.
   */
  public async validate(): Promise<boolean> {
    const status = await this.getStatus();
    return status.connected;
  }

  /**
   * Gets the detailed connection status of the connector.
   * @returns {Promise<ConnectorStatus>} The status object with connection info.
   */
  public async getStatus(): Promise<ConnectorStatus> {
    try {
      const response = await fetch(`${this.baseUrl}${this.credentials.botToken}/getMe`);
      
      if (!response.ok) {
        return {
          connected: false,
          message: `Telegram API error: ${response.status}`,
        };
      }

      const data: any = await response.json();
      
      if (data.ok) {
        return {
          connected: true,
          message: `Connected as @${data.result.username}`,
        };
      }

      return {
        connected: false,
        message: data.description || 'Invalid bot token.',
      };
    } catch (error: any) {
      logger.error({ error }, 'Failed to validate Telegram credentials');
      return {
        connected: false,
        message: `Connection error: ${error.message}`,
      };
    }
  }

  /**
   * Sends a message using the Telegram Bot API.
   * @param {string} to - The recipient's chat ID (user ID or group ID).
   * @param {string} message - The message text to send.
   * @param {SendOptions} _options - Optional metadata (reserved for future use).
   * @returns {Promise<SendResult>} The result of the send operation.
   */
  public async sendMessage(
    to: string,
    message: string,
    _options?: SendOptions,
  ): Promise<SendResult> {
    const apiUrl = `${this.baseUrl}${this.credentials.botToken}/sendMessage`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: to,
          text: message,
        }),
      });

      const data: any = await response.json();

      if (!response.ok) {
        const errorMessage = data.description || `HTTP ${response.status}`;
        logger.warn(
          {
            chatId: to,
            status: response.status,
            error: errorMessage,
          },
          'Telegram API error when sending message',
        );
        
        return {
          success: false,
          status: 'failed',
          error: errorMessage,
        };
      }

      if (data.ok) {
        logger.info(
          {
            messageId: data.result.message_id,
            chatId: to,
          },
          'Message sent successfully via Telegram',
        );

        return {
          success: true,
          externalId: String(data.result.message_id),
          status: 'sent',
        };
      }

      // If data.ok is false, return error
      return {
        success: false,
        status: 'failed',
        error: data.description || 'Unknown Telegram API error',
      };
    } catch (error: any) {
      logger.error({ error, to }, 'Failed to send message via Telegram');
      return {
        success: false,
        status: 'failed',
        error: error.message || 'Network error while sending message',
      };
    }
  }
}

