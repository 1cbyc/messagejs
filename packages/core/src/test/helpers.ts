/**
 * @file Test helper utilities
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { testPrisma } from './setup';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing-only';

/**
 * Creates a test user and returns user data and auth token
 */
export async function createTestUser(email: string = 'test@example.com', password: string = 'TestPass123!') {
  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = await testPrisma.user.create({
    data: {
      email,
      passwordHash,
      name: 'Test User',
    },
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { user, token };
}

/**
 * Generates a JWT token for a user
 */
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Creates a test API key for a project
 */
export async function createTestApiKey(projectId: string, publicKey?: string, secretKey?: string) {
  const crypto = await import('crypto');
  const actualPublicKey = publicKey || `pk_test_${crypto.randomBytes(16).toString('hex')}`;
  const actualSecretKey = secretKey || crypto.randomBytes(32).toString('hex');
  const secretKeyHash = await bcrypt.hash(actualSecretKey, 10);

  const apiKey = await testPrisma.apiKey.create({
    data: {
      publicKey: actualPublicKey,
      secretKeyHash,
      projectId,
      rateLimit: 1000,
    },
  });

  // Return the full API key in the format expected by the API: <publicKey>_sk_<secretKey>
  const fullApiKey = `${actualPublicKey}_sk_${actualSecretKey}`;

  return { apiKey, fullApiKey, publicKey: actualPublicKey, secretKey: actualSecretKey };
}

