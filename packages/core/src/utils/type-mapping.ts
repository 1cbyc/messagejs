/**
 * @file Provides type-mapping utilities to translate between public API types
 * and internal database/Prisma types.
 *
 * This module acts as a crucial "translation layer" that decouples our internal
 * data representation (e.g., uppercase Prisma enums) from our external,
 * public-facing contracts (e.g., lowercase string unions), which are more
 * developer-friendly and JSON-serializable.
 */

import { ServiceType } from '@prisma/client';
import { ConnectorType } from '@messagejs/shared-types';

/**
 * Maps the public-facing `ConnectorType` (string union) from the shared-types package
 * to the internal Prisma `ServiceType` (enum).
 *
 * This is used when taking input from the API and preparing it for a database query.
 *
 * @param {ConnectorType} connectorType The lowercase string identifier for the connector.
 * @returns {ServiceType} The corresponding uppercase Prisma enum value.
 * @throws {Error} If the connector type is not supported or recognized.
 */
export const toServiceType = (connectorType: ConnectorType): ServiceType => {
  switch (connectorType) {
    case 'whatsapp':
      return ServiceType.WHATSAPP;
    case 'telegram':
      return ServiceType.TELEGRAM;
    // Note the mapping from a simpler public name 'twilio' to a more specific internal enum.
    case 'twilio':
      return ServiceType.TWILIO_SMS;
    case 'smtp':
    case 'slack':
    case 'discord':
      // These types are defined in the contract but are not yet implemented.
      throw new Error(`Connector type '${connectorType}' is not implemented.`);
    default:
      // This exhaustive check ensures that if we add a new value to the ConnectorType union,
      // TypeScript will raise an error here, forcing us to update the mapping.
      const exhaustiveCheck: never = connectorType;
      throw new Error(`Unknown connector type: ${exhaustiveCheck}`);
  }
};

/**
 * Maps the internal Prisma `ServiceType` (enum) back to the public-facing
 * `ConnectorType` (string union).
 *
 * This is used when retrieving data from the database and preparing it for an API response.
 *
 * @param {ServiceType} serviceType The uppercase Prisma enum value.
 * @returns {ConnectorType} The corresponding lowercase string identifier.
 * @throws {Error} If the service type is not recognized.
 */
export const fromServiceType = (serviceType: ServiceType): ConnectorType => {
  switch (serviceType) {
    case ServiceType.WHATSAPP:
      return 'whatsapp';
    case ServiceType.TELEGRAM:
      return 'telegram';
    case ServiceType.TWILIO_SMS:
      return 'twilio';
    default:
      const exhaustiveCheck: never = serviceType;
      throw new Error(`Unsupported service type: ${exhaustiveCheck}`);
  }
};
