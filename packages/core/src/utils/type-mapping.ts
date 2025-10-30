/**
 * @file Type mapping utilities between Prisma's ServiceType enum and shared-types ConnectorType.
 * 
 * Prisma uses uppercase enums (WHATSAPP) while shared-types uses lowercase (whatsapp).
 * This file provides conversion functions between them.
 */

import { ConnectorType } from '@messagejs/shared-types';
import { ServiceType } from '@prisma/client';

/**
 * Converts a ServiceType (uppercase) from Prisma to ConnectorType (lowercase) from shared-types.
 * 
 * @param serviceType The Prisma ServiceType enum value
 * @returns The corresponding ConnectorType for shared-types
 */
export function toServiceType(connectorType: ConnectorType): ServiceType {
  switch (connectorType) {
    case 'whatsapp':
      return ServiceType.WHATSAPP;
    case 'telegram':
      return ServiceType.TELEGRAM;
    case 'twilio':
      return ServiceType.TWILIO_SMS;
    default:
      throw new Error(`Unsupported connector type: ${connectorType}`);
  }
}

/**
 * Converts a ConnectorType (lowercase) from shared-types to ServiceType (uppercase) from Prisma.
 * 
 * @param connectorType The ConnectorType from shared-types
 * @returns The corresponding ServiceType for Prisma
 */
export function fromServiceType(serviceType: ServiceType): ConnectorType {
  switch (serviceType) {
    case ServiceType.WHATSAPP:
      return 'whatsapp';
    case ServiceType.TELEGRAM:
      return 'telegram';
    case ServiceType.TWILIO_SMS:
      return 'twilio';
    default:
      throw new Error(`Unsupported service type: ${serviceType}`);
  }
}

