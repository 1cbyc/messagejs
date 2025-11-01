/**
 * @file Unit tests for project endpoints
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../../test/app';
import { testPrisma, cleanDatabase } from '../../test/setup';
import { createTestUser, generateToken } from '../../test/helpers';

const app = createTestApp();

describe('GET /api/v1/projects', () => {
  beforeAll(async () => {
    await cleanDatabase();
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/v1/projects')
      .expect(401);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('AUTH_MISSING_TOKEN');
  });

  it('should return empty list when user has no projects', async () => {
    const { token } = await createTestUser('noprojects@example.com');

    const response = await request(app)
      .get('/api/v1/projects')
      .set('Cookie', `authToken=${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('projects');
    expect(response.body.projects).toEqual([]);
  });

  it('should return all projects for authenticated user', async () => {
    const { user, token } = await createTestUser('hasprojects@example.com');

    // Create projects for this user
    const project1 = await testPrisma.project.create({
      data: { name: 'Project 1', userId: user.id },
    });
    const project2 = await testPrisma.project.create({
      data: { name: 'Project 2', userId: user.id },
    });

    const response = await request(app)
      .get('/api/v1/projects')
      .set('Cookie', `authToken=${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('projects');
    expect(response.body.projects).toHaveLength(2);
    expect(response.body.projects[0].name).toBe('Project 2'); // Ordered by createdAt desc
    expect(response.body.projects[1].name).toBe('Project 1');
  });

  it('should only return projects owned by the authenticated user', async () => {
    const { user: user1, token: token1 } = await createTestUser('user1@example.com');
    const { user: user2 } = await createTestUser('user2@example.com');

    // Create project for user1
    await testPrisma.project.create({
      data: { name: 'User1 Project', userId: user1.id },
    });

    // Create project for user2
    await testPrisma.project.create({
      data: { name: 'User2 Project', userId: user2.id },
    });

    const response = await request(app)
      .get('/api/v1/projects')
      .set('Cookie', `authToken=${token1}`)
      .expect(200);

    expect(response.body.projects).toHaveLength(1);
    expect(response.body.projects[0].name).toBe('User1 Project');
  });
});

describe('POST /api/v1/projects', () => {
  beforeAll(async () => {
    await cleanDatabase();
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .post('/api/v1/projects')
      .send({ name: 'New Project' })
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });

  it('should create a new project successfully', async () => {
    const { token } = await createTestUser('creator@example.com');

    const response = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', `authToken=${token}`)
      .send({ name: 'My New Project' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name', 'My New Project');
    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('createdAt');

    // Verify project was created in database
    const project = await testPrisma.project.findUnique({
      where: { id: response.body.id },
    });
    expect(project).toBeTruthy();
    expect(project?.name).toBe('My New Project');
  });

  it('should reject project creation without name', async () => {
    const { token } = await createTestUser('noname@example.com');

    const response = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', `authToken=${token}`)
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should reject project creation with empty name', async () => {
    const { token } = await createTestUser('emptyname@example.com');

    const response = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', `authToken=${token}`)
      .send({ name: '' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});

describe('GET /api/v1/projects/:id', () => {
  beforeAll(async () => {
    await cleanDatabase();
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/v1/projects/project123')
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });

  it('should return project by ID for owner', async () => {
    const { user, token } = await createTestUser('owner@example.com');
    
    const project = await testPrisma.project.create({
      data: { name: 'My Project', userId: user.id },
    });

    const response = await request(app)
      .get(`/api/v1/projects/${project.id}`)
      .set('Cookie', `authToken=${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', project.id);
    expect(response.body).toHaveProperty('name', 'My Project');
    expect(response.body).toHaveProperty('userId', user.id);
  });

  it('should return 404 for non-existent project', async () => {
    const { token } = await createTestUser('noproject@example.com');

    const response = await request(app)
      .get('/api/v1/projects/nonexistent-id')
      .set('Cookie', `authToken=${token}`)
      .expect(404);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('PROJECT_NOT_FOUND');
  });

  it('should return 404 for project owned by another user', async () => {
    const { user: user1 } = await createTestUser('user1@example.com');
    const { token: token2 } = await createTestUser('user2@example.com');

    const project = await testPrisma.project.create({
      data: { name: 'User1 Project', userId: user1.id },
    });

    const response = await request(app)
      .get(`/api/v1/projects/${project.id}`)
      .set('Cookie', `authToken=${token2}`)
      .expect(404);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('PROJECT_NOT_FOUND');
  });
});

