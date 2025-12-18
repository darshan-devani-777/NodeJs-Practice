const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");

// GET ALL USER
exports.getAllUsers = async (req, res) => {
  try {
    let users;

    if (req.user.role === "superadmin") {
      users = await User.find({}, "-password");
    } else if (req.user.role === "admin") {
      users = await User.find({ role: "user" }, "-password");
    } else {
      return res.json({ statusCode:StatusCodes.FORBIDDEN , success: false, message: "Access denied" });
    }

    res.json({
      statusCode:StatusCodes.OK,
      success: true,
      message: "Users Fetched Successfully...",
      users: users || [],
    });
  } catch (err) {
    res.json({ statusCode:StatusCodes.INTERNAL_SERVER_ERROR , success: false, message: "Server error" });
  }
};

// GET ALL ROLE
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await User.distinct("role");
    res.json({
      statusCode:StatusCodes.OK,
      success: true,
      message: "Roles Fetched Successfully...",
      roles: roles || [],
    });
  } catch (err) {
    console.error("Error fetching roles:", err);
    res.json({ statusCode:StatusCodes.INTERNAL_SERVER_ERROR , success: false, message: "Server error" });
  }
};

// GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-password");
    if (!user)
      return res
        .json({ statusCode:StatusCodes.NOT_FOUND , success: false, message: "User not found" });

    res.json({
      statusCode:StatusCodes.OK,
      success: true,
      message: "User Fetched Successfully...",
      user,
    });
  } catch (err) {
    res.json({ statusCode:StatusCodes.INTERNAL_SERVER_ERROR , success: false, message: "Server error" });
  }
};

// UPDATE USER
exports.updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = { ...req.body };

    // Handle role only for superadmin
    if (req.user.role !== "superadmin" && updateData.role) {
      delete updateData.role;
    }

    // Handle password hashing
    if (updateData.password && updateData.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }

    // Handle image if uploaded
    if (req.file) {
      updateData.image = "uploads/users/" + req.file.filename;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.json({
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "User not found",
      });
    }

    const userResponse = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      image: updatedUser.image, 
    };

    return res.json({
      statusCode: StatusCodes.OK,
      success: true,
      message: "User Updated Successfully...",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Server error",
    });
  }
};

// DELETE USER
exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user)
      return res
        .json({ statusCode:StatusCodes.NOT_FOUND , success: false , message: "User not found" });

    res.json({
      statusCode:StatusCodes.OK,
      success: true,
      message: "User Deleted Successfully...",
    });
  } catch (err) {
    console.error("Delete Error:", err);
    res.json({ statusCode:StatusCodes.INTERNAL_SERVER_ERROR , success: false, message: "Server error" });
  }
};
