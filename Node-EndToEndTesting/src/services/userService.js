const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');

class UserService {

  async createUser(userData) {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new ApiError('User with this email already exists', 400);
      }

      const user = new User(userData);
      await user.save();

      const userObj = user.toObject();
      delete userObj.password;

      return userObj;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to create user', 500);
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findOne({ _id: userId, isActive: true });
      if (!user) {
        throw new ApiError('User not found', 404);
      }
      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to get user', 500);
    }
  }  

  async getAllUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = ''
      } = options;

      const skip = (page - 1) * limit;
      const query = { isActive: true };

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const sortOptions = {
        [sortBy]: sortOrder === 'desc' ? -1 : 1
      };

      const users = await User.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .select('-password');

      const total = await User.countDocuments(query);

      return {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new ApiError('Failed to get users', 500);
    }
  }

  async updateUser(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError('User not found', 404);
      }
  
      const allowedFields = [
        'firstName',
        'lastName',
        'phoneNumber',
        'avatar'
      ];
  
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          user[field] = updateData[field];
        }
      }
  
      user.updatedAt = new Date();
      await user.save();
  
      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to update user', 500);
    }
  }  

  async deleteUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      user.isActive = false;
      user.updatedAt = new Date();
      await user.save();

      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to delete user', 500);
    }
  }

  async authenticateUser(email, password) {
    try {
      const user = await User.findActiveByEmail(email).select('+password');
      if (!user) {
        throw new ApiError('Invalid credentials', 401);
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new ApiError('Invalid credentials', 401);
      }

      await user.updateLastLogin();

      const userObj = user.toObject();
      delete userObj.password;

      return userObj;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Authentication failed', 500);
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new ApiError('Current password is incorrect', 400);
      }

      user.password = newPassword;
      await user.save();

      return;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to change password', 500);
    }
  }
}

module.exports = new UserService();
