const userService = require('../Service/user.service');

// ADD USER
exports.createUser = async (req, res) => {
  try {
    if (!req.body.name || !req.body.email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const user = await userService.createUser(req.body);
    if (!user) {
      return res.status(500).json({ error: 'Error creating user' });
    }
    res.status(201).json({
      message: 'User Created Successfully...',
      user: user
    });
  } catch (err) {
    console.error('Error in createUser:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

// GET ALL USER
exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }
    res.status(200).json({
      message: 'User Fetched Successfully...',
      user: users
    });
    } catch (err) {
    console.error('Error in getUsers:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

// GET SPECIFIC USER
exports.getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      message: 'User Fetched Successfully...',
      user: user
    });
    } catch (err) {
    console.error('Error in getUser:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const updated = await userService.updateUser(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'User not found or update failed' });
    }
    res.json({
      message: 'User Updated Successfully',
      updatedUser: updated
    });
  } catch (err) {
    console.error('Error in updateUser:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await userService.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      message: 'User deleted successfully',
      deletedUser: deleted
    });
  } catch (err) {
    console.error('Error in deleteUser:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

