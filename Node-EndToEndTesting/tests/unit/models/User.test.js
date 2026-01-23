const User = require('../../../src/models/User');

describe('User Model', () => {
  describe('User creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email.toLowerCase());
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.role).toBe('user');
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should hash password before saving', async () => {
      const userData = {
        email: 'jane@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe'
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/);
    });

    it('should fail validation with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail validation with short password', async () => {
      const userData = {
        email: 'john@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail validation with missing required fields', async () => {
      const user = new User({});

      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      await new User(userData).save();

      await expect(new User(userData).save()).rejects.toThrow();
    });
  });

  describe('Virtual properties', () => {
    it('should return full name', async () => {
      const userData = {
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = new User(userData);
      await user.save();

      expect(user.fullName).toBe('John Doe');
    });
  });

  describe('Instance methods', () => {
    let user;

    beforeEach(async () => {
      user = await new User({
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      }).save();
    });

    it('should compare password correctly', async () => {
      const isValid = await user.comparePassword('password123');
      expect(isValid).toBe(true);

      const isInvalid = await user.comparePassword('wrongpassword');
      expect(isInvalid).toBe(false);
    });

    it('should update last login', async () => {
      const oldLastLogin = user.lastLogin;

      await user.updateLastLogin();

      expect(user.lastLogin).toBeDefined();
      expect(user.lastLogin).not.toBe(oldLastLogin);
    });
  });

  describe('Static methods', () => {
    it('should find active user by email', async () => {
      const userData = {
        email: 'active@example.com',
        password: 'password123',
        firstName: 'Active',
        lastName: 'User',
        isActive: true
      };

      await new User(userData).save();

      const foundUser = await User.findActiveByEmail('active@example.com');
      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(userData.email);

      const inactiveUser = await User.findActiveByEmail('nonexistent@example.com');
      expect(inactiveUser).toBeNull();
    });
  });

  describe('JSON transformation', () => {
    it('should exclude password and version when converting to JSON', async () => {
      const userData = {
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = new User(userData);
      await user.save();

      const userJson = user.toJSON();

      expect(userJson.password).toBeUndefined();
      expect(userJson.__v).toBeUndefined();
      expect(userJson.email).toBeDefined();
      expect(userJson.firstName).toBeDefined();
    });
  });
});
