const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');
const User = require('../../src/models/User');

describe('User Routes Integration Tests', () => {
  let server;
  let testUser;
  let testUserId;

  beforeAll(async () => {
    server = app.listen(0);
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});

    testUser = await new User(global.testUtils.createTestUser({
      email: 'integration@example.com',
      firstName: 'Integration',
      lastName: 'Test'
    })).save();
    testUserId = testUser._id.toString();
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.firstName).toBe(userData.firstName);
      expect(response.body.data.password).toBeUndefined();
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
        firstName: '',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return error for duplicate email', async () => {
      const duplicateData = {
        email: 'integration@example.com',
        password: 'password123',
        firstName: 'Duplicate',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/users')
        .send(duplicateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      const additionalUsers = [
        global.testUtils.createTestUser({ firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' }),
        global.testUtils.createTestUser({ firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com' }),
        global.testUtils.createTestUser({ firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com' })
      ];

      await User.insertMany(additionalUsers);
    });

    it('should get all users with default pagination', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.hasNext).toBe(true);
    });

    it('should support search', async () => {
      const response = await request(app)
        .get('/api/users?search=Alice')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].firstName).toBe('Alice');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testUserId);
      expect(response.body.data.email).toBe(testUser.email);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return validation error for invalid ID', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phoneNumber: '+1234567890'
      };

      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
      expect(response.body.data.phoneNumber).toBe(updateData.phoneNumber);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/api/users/${fakeId}`)
        .send({ firstName: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');

      const deletedUser = await User.findById(testUserId);
      expect(deletedUser.isActive).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/users/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      await User.deleteMany({});
      testUser = await new User(global.testUtils.createTestUser({
        email: 'login@example.com',
        password: 'testpassword123'
      })).save();
      testUserId = testUser._id.toString();
    });

    it('should login user with correct credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'testpassword123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(loginData.email);
    });

    it('should return error for invalid credentials', async () => {
      const invalidData = {
        email: 'login@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(invalidData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return validation error for missing fields', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({ email: 'login@example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('PUT /api/users/:id/change-password', () => {
    beforeEach(async () => {
      await User.deleteMany({});
      testUser = await new User(global.testUtils.createTestUser({
        email: 'password@example.com',
        password: 'oldpassword123'
      })).save();
      testUserId = testUser._id.toString();
    });

    it('should change password', async () => {
      const changeData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put(`/api/users/${testUserId}/change-password`)
        .send(changeData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password changed successfully');

      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: 'password@example.com',
          password: 'newpassword123'
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    it('should return error for incorrect current password', async () => {
      const changeData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put(`/api/users/${testUserId}/change-password`)
        .send(changeData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });
});
