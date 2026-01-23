const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');
const User = require('../../src/models/User');

describe('API End-to-End User Flows', () => {
  let server;
  let testUserId;

  beforeAll(async () => {
    server = app.listen(0);
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('Complete User Registration and Authentication Flow', () => {
    it('should allow a new user to register, login, and access protected resources', async () => {
      const timestamp = Date.now();
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: `john.doe.${timestamp}@example.com`,
        password: 'password@123'
      };

      const registerResponse = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.email).toBe(userData.email);
      expect(registerResponse.body.data.firstName).toBe(userData.firstName);

      testUserId = registerResponse.body.data._id;

      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.email).toBe(userData.email);
      expect(loginResponse.body.data.firstName).toBe(userData.firstName);

      const usersResponse = await request(app)
        .get('/api/users')
        .expect(200);

      expect(usersResponse.body.success).toBe(true);
      expect(usersResponse.body.data).toHaveLength(1);
      expect(usersResponse.body.data[0].email).toBe(userData.email);

      const userResponse = await request(app)
        .get(`/api/users/${testUserId}`)
        .expect(200);

      expect(userResponse.body.success).toBe(true);
      expect(userResponse.body.data._id).toBe(testUserId);
      expect(userResponse.body.data.email).toBe(userData.email);

      const updateData = {
        firstName: 'Johnny',
        lastName: 'Updated'
      };

      const updateResponse = await request(app)
        .put(`/api/users/${testUserId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.firstName).toBe(updateData.firstName);
      expect(updateResponse.body.data.lastName).toBe(updateData.lastName);

      const changePasswordResponse = await request(app)
        .put(`/api/users/${testUserId}/change-password`)
        .send({
          currentPassword: userData.password,
          newPassword: 'newpassword@123'
        })
        .expect(200);

      expect(changePasswordResponse.body.success).toBe(true);
      expect(changePasswordResponse.body.message).toBe('Password changed successfully');

      const newLoginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userData.email,
          password: 'newpassword@123'
        })
        .expect(200);

      expect(newLoginResponse.body.success).toBe(true);

      const deleteResponse = await request(app)
        .delete(`/api/users/${testUserId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toBe('User deleted successfully');

      await request(app)
        .get(`/api/users/${testUserId}`)
        .expect(404);

      const finalUsersResponse = await request(app)
        .get('/api/users')
        .expect(200);

      expect(finalUsersResponse.body.success).toBe(true);
      expect(finalUsersResponse.body.data).toHaveLength(0);
    });
  });

  describe('Multiple Users Workflow', () => {
    it('should handle multiple users registering and interacting', async () => {
      const timestamp = Date.now();
      const users = [
        {
          firstName: 'Alice',
          lastName: 'Smith',
          email: `alice.${timestamp}@example.com`,
          password: 'password@123'
        },
        {
          firstName: 'Bob',
          lastName: 'Johnson',
          email: `bob.${timestamp}@example.com`,
          password: 'password@123'
        },
        {
          firstName: 'Charlie',
          lastName: 'Brown',
          email: `charlie.${timestamp}@example.com`,
          password: 'password@123'
        }
      ];

      const registeredUsers = [];
      for (const userData of users) {
        const response = await request(app)
          .post('/api/users')
          .send(userData)
          .expect(201);

        registeredUsers.push(response.body.data);
      }

      const usersListResponse = await request(app)
        .get('/api/users')
        .expect(200);

      expect(usersListResponse.body.success).toBe(true);
      expect(usersListResponse.body.data).toHaveLength(3);

      const paginatedResponse = await request(app)
        .get('/api/users?page=1&limit=2')
        .expect(200);

      expect(paginatedResponse.body.success).toBe(true);
      expect(paginatedResponse.body.data).toHaveLength(2);
      expect(paginatedResponse.body.pagination.hasNext).toBe(true);

      const searchResponse = await request(app)
        .get('/api/users?search=Alice')
        .expect(200);

      expect(searchResponse.body.success).toBe(true);
      expect(searchResponse.body.data).toHaveLength(1);
      expect(searchResponse.body.data[0].firstName).toBe('Alice');

      for (const user of users) {
        const loginResponse = await request(app)
          .post('/api/users/login')
          .send({
            email: user.email,
            password: user.password
          })
          .expect(200);

        expect(loginResponse.body.success).toBe(true);
      }
    });
  });

  describe('Error Scenarios', () => {
    it('should handle various error scenarios properly', async () => {
      const timestamp = Date.now();

      const invalidLoginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password@123'
        })
        .expect(401);

      expect(invalidLoginResponse.body.success).toBe(false);

      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: `test.${timestamp}@example.com`,
        password: 'password@123'
      };

      const firstRegistration = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      const duplicateResponse = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(duplicateResponse.body.success).toBe(false);

      await request(app)
        .get('/api/users/507f1f77bcf86cd799439011')
        .expect(404);

      await request(app)
        .put('/api/users/507f1f77bcf86cd799439011')
        .send({ firstName: 'Updated' })
        .expect(404);
    });
  });

  describe('Health Check', () => {
    it('should return server health status', async () => {
      const healthResponse = await request(app)
        .get('/health')
        .expect(200);

      expect(healthResponse.body.status).toBe('OK');
      expect(healthResponse.body.timestamp).toBeDefined();
      expect(healthResponse.body.uptime).toBeDefined();
      expect(typeof healthResponse.body.uptime).toBe('number');
    });
  });
});
