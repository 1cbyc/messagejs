/**
 * @file Unit tests for authentication endpoints
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../../test/app';
import { testPrisma } from '../../test/setup';
import bcrypt from 'bcrypt';

const app = createTestApp();

describe('POST /api/v1/auth/register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      })
      .expect(201);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.user.name).toBe('Test User');
    expect(response.body).not.toHaveProperty('token'); // Token should be in cookie, not body

    // Check that http-only cookie was set
    expect(response.headers['set-cookie']).toBeDefined();
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeInstanceOf(Array);
    expect(cookies[0]).toContain('authToken=');
    expect(cookies[0]).toContain('HttpOnly');

    // Verify user was created in database
    const user = await testPrisma.user.findUnique({
      where: { email: 'test@example.com' },
    });
    expect(user).toBeTruthy();
    expect(user?.email).toBe('test@example.com');
    expect(user?.name).toBe('Test User');
    expect(user?.passwordHash).toBeTruthy();
    expect(user?.passwordHash).not.toBe('SecurePass123!'); // Should be hashed
  });

  it('should reject registration with existing email', async () => {
    // Create a user first
    await testPrisma.user.create({
      data: {
        email: 'existing@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
      },
    });

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'existing@example.com',
        password: 'AnotherPass123!',
        name: 'Another User',
      })
      .expect(409);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('USER_EXISTS');
  });

  it('should reject registration with invalid email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'not-an-email',
        password: 'SecurePass123!',
        name: 'Test User',
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should reject registration with weak password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'weak@example.com',
        password: '123', // Too short
        name: 'Test User',
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should reject registration without required fields', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'missing@example.com',
        // Missing password
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});

describe('POST /api/v1/auth/login', () => {
  it('should login with correct credentials', async () => {
    // Create a test user for this test
    await testPrisma.user.create({
      data: {
        email: 'login@example.com',
        passwordHash: await bcrypt.hash('TestPassword123!', 10),
        name: 'Login Test User',
      },
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login@example.com',
        password: 'TestPassword123!',
      })
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('login@example.com');
    expect(response.body).not.toHaveProperty('token'); // Token should be in cookie

    // Check that http-only cookie was set
    expect(response.headers['set-cookie']).toBeDefined();
    const cookies = response.headers['set-cookie'];
    expect(cookies[0]).toContain('authToken=');
    expect(cookies[0]).toContain('HttpOnly');
  });

  it('should reject login with incorrect password', async () => {
    // Create a test user for this test
    await testPrisma.user.create({
      data: {
        email: 'login@example.com',
        passwordHash: await bcrypt.hash('TestPassword123!', 10),
        name: 'Login Test User',
      },
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login@example.com',
        password: 'WrongPassword123!',
      })
      .expect(401);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should reject login with non-existent email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'AnyPassword123!',
      })
      .expect(401);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should reject login without required fields', async () => {
    // Create a test user for this test
    await testPrisma.user.create({
      data: {
        email: 'login@example.com',
        passwordHash: await bcrypt.hash('TestPassword123!', 10),
        name: 'Login Test User',
      },
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login@example.com',
        // Missing password
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('should logout successfully and clear cookie', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Logged out successfully');

    // Check that cookie was cleared
    const cookies = response.headers['set-cookie'];
    if (cookies && cookies.length > 0) {
      expect(cookies[0]).toContain('authToken=');
      expect(cookies[0]).toContain('Max-Age=0'); // Cookie expired
    }
  });
});

