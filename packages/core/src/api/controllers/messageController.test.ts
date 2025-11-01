/**
 * @file Unit tests for message endpoints
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../../test/app';
import { testPrisma } from '../../test/setup';
import { createTestUser, createTestApiKey } from '../../test/helpers';

const app = createTestApp();

describe('POST /api/v1/messages', () => {
  it('should require API key authentication', async () => {
    const response = await request(app)
      .post('/api/v1/messages')
      .send({
        connectorId: 'conn_123',
        templateId: 'tpl_123',
        to: '+1234567890',
        variables: {},
      })
      .expect(401);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('AUTH_MISSING_HEADER');
  });

  it('should send a message successfully', async () => {
    // Setup: Create user, project, service, template, and API key
    const { user } = await createTestUser('sender@example.com');
    const project = await testPrisma.project.create({
      data: { name: 'Test Project', userId: user.id },
    });

    const service = await testPrisma.service.create({
      data: {
        type: 'WHATSAPP',
        credentials: 'encrypted-credentials',
        projectId: project.id,
      },
    });

    const template = await testPrisma.template.create({
      data: {
        name: 'Test Template',
        connectorType: 'WHATSAPP',
        body: 'Hello {{name}}!',
        projectId: project.id,
      },
    });

    const { fullApiKey } = await createTestApiKey(project.id);

    const response = await request(app)
      .post('/api/v1/messages')
      .set('Authorization', `Bearer ${fullApiKey}`)
      .send({
        connectorId: service.id,
        templateId: template.id,
        to: '+1234567890',
        variables: { name: 'John' },
      })
      .expect(202);

    expect(response.body).toHaveProperty('messageId');
    expect(response.body).toHaveProperty('status', 'queued');

    // Verify message log was created
    const messageLog = await testPrisma.messageLog.findUnique({
      where: { id: response.body.messageId },
    });
    expect(messageLog).toBeTruthy();
    expect(messageLog?.status).toBe('QUEUED');
    expect(messageLog?.recipient).toBe('+1234567890');
    expect(messageLog?.projectId).toBe(project.id);
  });

  it('should handle idempotency key correctly', async () => {
    const { user } = await createTestUser('idempotent@example.com');
    const project = await testPrisma.project.create({
      data: { name: 'Idempotent Project', userId: user.id },
    });

    const service = await testPrisma.service.create({
      data: {
        type: 'WHATSAPP',
        credentials: 'encrypted-credentials',
        projectId: project.id,
      },
    });

    const template = await testPrisma.template.create({
      data: {
        name: 'Idempotent Template',
        connectorType: 'WHATSAPP',
        body: 'Test',
        projectId: project.id,
      },
    });

    const { fullApiKey } = await createTestApiKey(project.id);
    const idempotencyKey = 'test-idempotency-key-123';

    // First request
    const response1 = await request(app)
      .post('/api/v1/messages')
      .set('Authorization', `Bearer ${fullApiKey}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        connectorId: service.id,
        templateId: template.id,
        to: '+1234567890',
        variables: {},
      })
      .expect(202);

    const firstMessageId = response1.body.messageId;

    // Second request with same idempotency key
    const response2 = await request(app)
      .post('/api/v1/messages')
      .set('Authorization', `Bearer ${fullApiKey}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        connectorId: service.id,
        templateId: template.id,
        to: '+1234567890',
        variables: {},
      })
      .expect(202);

    // Should return the same message ID
    expect(response2.body.messageId).toBe(firstMessageId);
  });

  it('should reject request with invalid connector ID', async () => {
    const { user } = await createTestUser('invalidconn@example.com');
    const project = await testPrisma.project.create({
      data: { name: 'Invalid Conn Project', userId: user.id },
    });

    const template = await testPrisma.template.create({
      data: {
        name: 'Template',
        connectorType: 'WHATSAPP',
        body: 'Test',
        projectId: project.id,
      },
    });

    const { fullApiKey } = await createTestApiKey(project.id);

    const response = await request(app)
      .post('/api/v1/messages')
      .set('Authorization', `Bearer ${fullApiKey}`)
      .send({
        connectorId: 'invalid-connector-id',
        templateId: template.id,
        to: '+1234567890',
        variables: {},
      })
      .expect(404);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('should reject request with invalid template ID', async () => {
    const { user } = await createTestUser('invalidtpl@example.com');
    const project = await testPrisma.project.create({
      data: { name: 'Invalid Tpl Project', userId: user.id },
    });

    const service = await testPrisma.service.create({
      data: {
        type: 'WHATSAPP',
        credentials: 'encrypted-credentials',
        projectId: project.id,
      },
    });

    const { fullApiKey } = await createTestApiKey(project.id);

    const response = await request(app)
      .post('/api/v1/messages')
      .set('Authorization', `Bearer ${fullApiKey}`)
      .send({
        connectorId: service.id,
        templateId: 'invalid-template-id',
        to: '+1234567890',
        variables: {},
      })
      .expect(404);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('should reject request with missing required fields', async () => {
    const { user } = await createTestUser('missing@example.com');
    const project = await testPrisma.project.create({
      data: { name: 'Missing Project', userId: user.id },
    });

    const { fullApiKey } = await createTestApiKey(project.id);

    const response = await request(app)
      .post('/api/v1/messages')
      .set('Authorization', `Bearer ${fullApiKey}`)
      .send({
        // Missing connectorId, templateId, to, variables
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});

describe('GET /api/v1/messages', () => {
  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/v1/messages?projectId=proj123')
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });

  it('should require projectId query parameter', async () => {
    const { token } = await createTestUser('query@example.com');

    const response = await request(app)
      .get('/api/v1/messages')
      .set('Cookie', `authToken=${token}`)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('BAD_REQUEST');
  });

  it('should return messages for user\'s project', async () => {
    const { user, token } = await createTestUser('messages@example.com');
    const project = await testPrisma.project.create({
      data: { name: 'Messages Project', userId: user.id },
    });

    const service = await testPrisma.service.create({
      data: {
        type: 'WHATSAPP',
        credentials: 'encrypted-credentials',
        projectId: project.id,
      },
    });

    // Create some message logs
    await testPrisma.messageLog.createMany({
      data: [
        {
          projectId: project.id,
          serviceId: service.id,
          recipient: '+1111111111',
          status: 'SENT',
        },
        {
          projectId: project.id,
          serviceId: service.id,
          recipient: '+2222222222',
          status: 'DELIVERED',
        },
      ],
    });

    const response = await request(app)
      .get(`/api/v1/messages?projectId=${project.id}`)
      .set('Cookie', `authToken=${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('messages');
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.messages).toHaveLength(2);
    expect(response.body.pagination.total).toBe(2);
  });

  it('should return 404 for project not owned by user', async () => {
    const { user: user1 } = await createTestUser('user1@example.com');
    const { token: token2 } = await createTestUser('user2@example.com');

    const project = await testPrisma.project.create({
      data: { name: 'User1 Project', userId: user1.id },
    });

    const response = await request(app)
      .get(`/api/v1/messages?projectId=${project.id}`)
      .set('Cookie', `authToken=${token2}`)
      .expect(404);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('PROJECT_NOT_FOUND');
  });

  it('should support pagination', async () => {
    const { user, token } = await createTestUser('pagination@example.com');
    const project = await testPrisma.project.create({
      data: { name: 'Pagination Project', userId: user.id },
    });

    const service = await testPrisma.service.create({
      data: {
        type: 'WHATSAPP',
        credentials: 'encrypted-credentials',
        projectId: project.id,
      },
    });

    // Create 5 message logs
    await testPrisma.messageLog.createMany({
      data: Array.from({ length: 5 }, (_, i) => ({
        projectId: project.id,
        serviceId: service.id,
        recipient: `+111111111${i}`,
        status: 'SENT',
      })),
    });

    // Get first page (limit 2)
    const response1 = await request(app)
      .get(`/api/v1/messages?projectId=${project.id}&limit=2&offset=0`)
      .set('Cookie', `authToken=${token}`)
      .expect(200);

    expect(response1.body.messages).toHaveLength(2);
    expect(response1.body.pagination.total).toBe(5);
    expect(response1.body.pagination.limit).toBe(2);
    expect(response1.body.pagination.offset).toBe(0);

    // Get second page
    const response2 = await request(app)
      .get(`/api/v1/messages?projectId=${project.id}&limit=2&offset=2`)
      .set('Cookie', `authToken=${token}`)
      .expect(200);

    expect(response2.body.messages).toHaveLength(2);
    expect(response2.body.pagination.offset).toBe(2);
  });
});

