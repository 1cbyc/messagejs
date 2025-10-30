/**
 * @file Provides a simple caching utility using Redis.
 * This module abstracts the logic for setting, getting, and clearing cache entries,
 * and includes a convenient `getOrSet` function to implement a cache-aside pattern.
 */

import IORedis from 'ioredis';
import logger from './logger';

// Create a dedicated Redis client for caching to avoid interfering with other Redis clients
// (like those used for BullMQ or rate limiting).
const cacheClient = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  connectTimeout: 5000,
});

cacheClient.on('error', (err) => {
  logger.error({ err }, '[Cache] Redis connection error');
});

// Default cache time: 1 hour in seconds
const DEFAULT_EXPIRATION = 3600;

/**
 * Retrieves a value from the cache. If the value is not found, it executes the
 * provided `fetcher` function, stores the result in the cache, and then returns the result.
 * This is a cache-aside strategy.
 *
 * @template T The expected type of the data to be cached.
 * @param {string} key The cache key.
 * @param {() => Promise<T>} fetcher An async function that fetches the data from the source (e.g., database) if it's not in the cache.
 * @param {number} [expirationInSeconds=DEFAULT_EXPIRATION] The time-to-live for the cache entry in seconds.
 * @returns {Promise<T>} The cached data or the freshly fetched data.
 */
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  expirationInSeconds: number = DEFAULT_EXPIRATION,
): Promise<T> {
  try {
    const cachedValue = await cacheClient.get(key);
    if (cachedValue) {
      logger.debug({ key }, 'Cache hit');
      return JSON.parse(cachedValue) as T;
    }
  } catch (error) {
    logger.error({ err: error, key }, 'Error retrieving from cache. Fetching from source.');
  }

  logger.debug({ key }, 'Cache miss. Fetching from source.');
  const freshValue = await fetcher();

  // Don't cache null or undefined values to avoid cache poisoning from failed lookups.
  if (freshValue !== null && freshValue !== undefined) {
    try {
      // Set the value in Redis with the specified expiration.
      await cacheClient.set(
        key,
        JSON.stringify(freshValue),
        'EX', // 'EX' means the expiration is in seconds
        expirationInSeconds,
      );
    } catch (error) {
      // If caching fails, we still return the fresh value, so the application continues to work.
      logger.error({ err: error, key }, 'Error setting cache.');
    }
  }

  return freshValue;
}

/**
 * Explicitly sets a value in the cache.
 *
 * @param {string} key The cache key.
 * @param {any} value The value to store. Must be JSON-serializable.
 * @param {number} [expirationInSeconds=DEFAULT_EXPIRATION] The time-to-live for the cache entry in seconds.
 */
export async function set(
  key: string,
  value: any,
  expirationInSeconds: number = DEFAULT_EXPIRATION,
): Promise<void> {
  try {
    await cacheClient.set(
      key,
      JSON.stringify(value),
      'EX',
      expirationInSeconds,
    );
  } catch (error) {
    logger.error({ err: error, key }, 'Error setting cache.');
  }
}

/**
 * Deletes one or more keys from the cache.
 * Useful for cache invalidation when data is updated.
 *
 * @param {string | string[]} keys The key or keys to delete.
 */
export async function del(keys: string | string[]): Promise<void> {
  try {
    // Ensure keys is always an array for the spread operator.
    const keysToDelete = Array.isArray(keys) ? keys : [keys];
    if (keysToDelete.length > 0) {
      await cacheClient.del(keysToDelete);
    }
  } catch (error) {
    logger.error({ err: error, keys }, 'Error deleting from cache.');
  }
}
