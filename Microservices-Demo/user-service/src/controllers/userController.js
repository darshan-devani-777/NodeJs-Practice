const User = require("../models/userModel");

exports.createUser = (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const existingUser = User.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const newUser = User.createUser({ name, email });

    return res.status(201).json({
      success: true,
      message: "User created successfully...",
      data: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating user",
      error: error.message,
    });
  }
};

exports.getAllUsers = (req, res) => {
  try {
    const users = User.getAllUsers();

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully...",
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users",
      error: error.message,
    });
  }
};
