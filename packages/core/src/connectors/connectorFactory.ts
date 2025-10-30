/**
 * @file Defines the ConnectorFactory for creating connector instances.
 *
 * This factory is a central piece of the connector architecture. It provides a
 * static method to instantiate the correct connector class based on the
 * service type. This decouples the worker logic from the specific connector
 * implementations, making the system modular and easy to extend.
 */

import { ConnectorType, IConnector } from '@messagejs/shared-types';
import { ServiceType } from '@prisma/client';
import { toServiceType } from '../utils/type-mapping';
import { WhatsAppConnector } from './whatsappConnector';

// Define a type for the decrypted credentials object for better type safety.
// Each connector will expect a different structure.
// For example, WhatsApp might need an accessToken and a phoneNumberId.
type DecryptedCredentials = Record<string, any>;

/**
 * A factory class for creating instances of messaging connectors.
 */
export class ConnectorFactory {
  /**
   * Creates and returns a connector instance based on the provided service type.
   *
   * @param {ServiceType} type The type of the service (e.g., 'WHATSAPP').
   * @param {DecryptedCredentials} credentials The decrypted credentials object required by the connector.
   * @returns {IConnector} An instance of a class that implements the IConnector interface.
   * @throws {Error} If the provided connector type is not supported.
   */
  public static create(
    type: ConnectorType,
    credentials: DecryptedCredentials,
  ): IConnector {
    const serviceType = toServiceType(type);

    switch (serviceType) {
      case ServiceType.WHATSAPP:
        return new WhatsAppConnector(credentials);

      // case ServiceType.TELEGRAM:
      //   return new TelegramConnector(credentials); // Example for a future connector

      // case ServiceType.TWILIO_SMS:
      //   return new TwilioConnector(credentials); // Example for a future connector

      default:
        throw new Error(`Connector type '${type}' is not supported.`);
    }
  }
}
