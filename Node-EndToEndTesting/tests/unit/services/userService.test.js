const userService = require('../../../src/services/userService');
const User = require('../../../src/models/User');
const { ApiError } = require('../../../src/utils/ApiError');

describe('User Service', () => {
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = global.testUtils.createTestUser({
        email: 'create@example.com',
        firstName: 'Create',
        lastName: 'User'
      });

      const user = await userService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.password).toBeUndefined();
    });

    it('should throw error if user with email already exists', async () => {
      const userData = global.testUtils.createTestUser({
        email: 'duplicate@example.com'
      });

      await userService.createUser(userData);

      await expect(userService.createUser(userData)).rejects.toThrow(ApiError);
      await expect(userService.createUser(userData)).rejects.toThrow('User with this email already exists');
    });
  });

  describe('getUserById', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await new User(global.testUtils.createTestUser()).save();
    });

    it('should return user by ID', async () => {
      const user = await userService.getUserById(testUser._id);

      expect(user).toBeDefined();
      expect(user._id.toString()).toBe(testUser._id.toString());
      expect(user.email).toBe(testUser.email);
    });

    it('should throw error for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await expect(userService.getUserById(fakeId)).rejects.toThrow(ApiError);
      await expect(userService.getUserById(fakeId)).rejects.toThrow('User not found');
    });
  });

  describe('getAllUsers', () => {
    beforeEach(async () => {
      const users = [
        global.testUtils.createTestUser({ firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' }),
        global.testUtils.createTestUser({ firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com' }),
        global.testUtils.createTestUser({ firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com' })
      ];

      await User.insertMany(users);
    });

    it('should return paginated users', async () => {
      const result = await userService.getAllUsers({ page: 1, limit: 2 });

      expect(result.users).toHaveLength(2);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should search users by name', async () => {
      const result = await userService.getAllUsers({ search: 'Alice' });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].firstName).toBe('Alice');
    });

    it('should search users by email', async () => {
      const result = await userService.getAllUsers({ search: 'bob@example.com' });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].email).toBe('bob@example.com');
    });
  });

  describe('updateUser', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await new User(global.testUtils.createTestUser()).save();
    });

    it('should update user successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phoneNumber: '+1234567890'
      };

      const updatedUser = await userService.updateUser(testUser._id, updateData);

      expect(updatedUser.firstName).toBe(updateData.firstName);
      expect(updatedUser.lastName).toBe(updateData.lastName);
      expect(updatedUser.phoneNumber).toBe(updateData.phoneNumber);
    });

    it('should not update sensitive fields', async () => {
      const originalEmail = testUser.email;
      const updateData = {
        email: 'newemail@example.com',
        password: 'newpassword',
        role: 'admin'
      };

      const updatedUser = await userService.updateUser(testUser._id, updateData);

      expect(updatedUser.email).toBe(originalEmail);
      expect(updatedUser.role).toBe('user');
    });

    it('should throw error for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await expect(userService.updateUser(fakeId, { firstName: 'Test' })).rejects.toThrow('User not found');
    });
  });

  describe('deleteUser', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await new User(global.testUtils.createTestUser()).save();
    });

    it('should soft delete user', async () => {
      await userService.deleteUser(testUser._id);

      const deletedUser = await User.findById(testUser._id);
      expect(deletedUser.isActive).toBe(false);
    });

    it('should throw error for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await expect(userService.deleteUser(fakeId)).rejects.toThrow('User not found');
    });
  });

  describe('authenticateUser', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await new User(global.testUtils.createTestUser({
        email: 'auth@example.com',
        password: 'correctpassword'
      })).save();
    });

    it('should authenticate user with correct credentials', async () => {
      const user = await userService.authenticateUser('auth@example.com', 'correctpassword');

      expect(user).toBeDefined();
      expect(user.email).toBe('auth@example.com');
      expect(user.lastLogin).toBeDefined();
    });

    it('should throw error for invalid email', async () => {
      await expect(userService.authenticateUser('wrong@example.com', 'correctpassword'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      await expect(userService.authenticateUser('auth@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error for inactive user', async () => {
      await User.findByIdAndUpdate(testUser._id, { isActive: false });

      await expect(userService.authenticateUser('auth@example.com', 'correctpassword'))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('changePassword', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await new User(global.testUtils.createTestUser({
        email: 'password@example.com',
        password: 'oldpassword'
      })).save();
    });

    it('should change password successfully', async () => {
      await userService.changePassword(testUser._id, 'oldpassword', 'newpassword123');

      const user = await userService.authenticateUser('password@example.com', 'newpassword123');
      expect(user).toBeDefined();
    });

    it('should throw error for incorrect current password', async () => {
      await expect(userService.changePassword(testUser._id, 'wrongpassword', 'newpassword123'))
        .rejects.toThrow('Current password is incorrect');
    });

    it('should throw error for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await expect(userService.changePassword(fakeId, 'oldpassword', 'newpassword123'))
        .rejects.toThrow('User not found');
    });
  });
});
