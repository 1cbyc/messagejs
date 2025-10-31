/**
 * @file Shared TypeScript types for the MessageJS project.
 * This package is used by all other packages (core, client, dashboard) to ensure
 * consistent type definitions across the monorepo.
 */

// Re-export all types
export * from './dataModels';
export * from './apiTypes';
export * from './security';
export * from './connector';
// Note: messages.ts doesn't exist yet, commenting out to avoid build error
// export * from './messages';
