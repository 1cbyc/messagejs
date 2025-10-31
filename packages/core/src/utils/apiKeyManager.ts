/**
 * @file Manages the creation and hashing of secure API keys.
 *
 * This utility provides a centralized and secure way to handle API key generation.
 * The security model is as follows:
 * 1. A public key (e.g., `pk_live_...`) is generated and stored in plaintext.
 *    It is used for identifying the key without exposing secrets.
 * 2. A secret key (e.g., `sk_live_...`) is generated and shown to the user ONCE.
 * 3. A bcrypt hash of the secret key is stored in the database. The plaintext
 *    secret is never stored.
 * 4. The full API key provided to the user is a combination of the public and secret keys,
 *    making it easy for the authentication middleware to parse and verify.
 */

import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';

const PUBLIC_KEY_PREFIX = 'pk_live_';
const SECRET_KEY_PREFIX = 'sk_live_';
const SECRET_KEY_BYTE_LENGTH = 32; // 256 bits, a strong length for a secret
const BCRYPT_SALT_ROUNDS = 12; // A good balance between security and performance

/**
 * Generates a cryptographically secure random string to be used as a secret key.
 * @returns {string} A random hex-encoded string.
 */
const generateSecretKey = (): string => {
  return randomBytes(SECRET_KEY_BYTE_LENGTH).toString('hex');
};

/**
 * Hashes a plaintext secret key using bcrypt.
 * @param {string} secretKey The plaintext secret key.
 * @returns {Promise<string>} A promise that resolves with the bcrypt hash.
 */
const hashSecretKey = async (secretKey: string): Promise<string> => {
  return bcrypt.hash(secretKey, BCRYPT_SALT_ROUNDS);
};

/**
 * Generates a complete API key set, including the parts to store in the database
 * and the full key to be shown to the user.
 *
 * @returns {Promise<{ fullApiKey: string; publicKey: string; secretKeyHash: string; }>} An object containing the full key, the public key, and the hashed secret.
 */
export const generateApiKey = async () => {
  const publicKey = `${PUBLIC_KEY_PREFIX}${randomBytes(16).toString('hex')}`;
  const secretKey = generateSecretKey();
  const secretKeyHash = await hashSecretKey(secretKey);

  // The full API key is a concatenation of the public key and the *plaintext* secret key.
  // This format allows the auth middleware to easily split the key and verify the secret part.
  const fullApiKey = `${publicKey}_${SECRET_KEY_PREFIX}${secretKey}`;

  return {
    fullApiKey,
    publicKey,
    secretKeyHash,
  };
};

/**
 * Compares a plaintext secret key from an incoming request with a stored hash.
 *
 * @param {string} providedSecret The plaintext secret from the API key.
 * @param {string} storedHash The bcrypt hash from the database.
 * @returns {Promise<boolean>} True if the secret matches the hash, false otherwise.
 */
export const compareSecretKey = async (
  providedSecret: string,
  storedHash: string,
): Promise<boolean> => {
  return bcrypt.compare(providedSecret, storedHash);
};
