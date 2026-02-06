const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const getValidationError = require("../utils/getValidationError");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const logActivity = require("../utils/activityLogger");
const Activitylogs = require("../models/Activitylogs");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });

/* ------------------- REGISTER USER ------------------- */
exports.registerUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    await logActivity({
      user: user._id,
      action: "REGISTER",
      description: `User registered with email ${user.email}`,
      req,
      status: "success",
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    const message = getValidationError(error);
    await logActivity({
      user: null,
      action: "REGISTER",
      description: `User registration failed with email ${req.body.email}`,
      req,
      status: "failed",
    });
    return res.status(400).json({ success: false, message });
  }
};

/* ------------------- LOGIN USER ------------------- */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password)))
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    const token = generateToken(user._id);
    res.cookie("token", token, { httpOnly: true });

    await logActivity({
      user: user._id,
      action: "LOGIN",
      description: `User logged in with email ${user.email}`,
      req,
      status: "success",
    });

    return res.status(200).json({
      success: true,
      message: "User login successfully",
      data: { id: user._id, name: user.name, email: user.email, token },
    });
  } catch (error) {
    console.error(error);
    await logActivity({
      user: null,
      action: "LOGIN",
      description: `User login failed with email ${req.body.email}`,
      req,
      status: "failed",
    });
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- FORGOT PASSWORD ------------------- */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const message = `
      <h3>Password Reset Request</h3>
      <p>Hello ${user.name},</p>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
    `;

    await transporter.sendMail({
      from: `"Admin Dashboard" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: message,
    });

    await logActivity({
      user: user._id,
      action: "FORGOT_PASSWORD",
      description: `Password reset link sent to ${user.email}`,
      req,
      status: "success",
    });

    return res.status(200).json({
      success: true,
      message: `Reset link sent to ${user.email} successfully`,
    });
  } catch (error) {
    console.error(error);
    await logActivity({
      user: null,
      action: "FORGOT_PASSWORD",
      description: `Password reset link failed to send to ${req.body.email}`,
      req,
      status: "failed",
    });
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- RESET PASSWORD ------------------- */
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });

    if (!password || !confirmPassword)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    if (password !== confirmPassword)
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    await logActivity({
      user: user._id,
      action: "RESET_PASSWORD",
      description: `Password updated for user ${user.email}`,
      req,
      status: "success",
    });

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    const message = getValidationError(error);
    await logActivity({
      user: null,
      action: "RESET_PASSWORD",
      description: `Password update failed for user ${req.body.email}`,
      req,
      status: "failed",
    });
    return res.status(400).json({ success: false, message });
  }
};

/* ------------------- GET ALL USERS ------------------- */
exports.getAllUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const cursor = req.query.cursor;
    const search = req.query.search || "";
    const order = req.query.sort === "asc" ? 1 : -1;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id =
        order === 1
          ? { $gt: new mongoose.Types.ObjectId(cursor) }
          : { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const users = await User.find(query)
      .select("_id name email role isActive createdAt")
      .sort({ _id: order })
      .limit(limit + 1);

    const hasNextPage = users.length > limit;

    if (hasNextPage) users.pop();

    const nextCursor = users.length ? users[users.length - 1]._id : null;

    return res.status(200).json({
      success: true,
      data: users,
      pageInfo: { hasNextPage, nextCursor, limit },
    });
  } catch (error) {
    console.error("❌ getAllUsers error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ------------------- UPDATE PROFILE ------------------- */
exports.updateProfile = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { userId, name, email, password, role } = req.body;

    if (!loggedInUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const User = require("../models/User");
    const userToUpdate = userId ? await User.findById(userId) : loggedInUser;

    if (!userToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (role && userToUpdate._id.toString() !== loggedInUser._id.toString()) {
      if (loggedInUser.role !== "admin") {
        return res
          .status(403)
          .json({
            success: false,
            message: "Forbidden: Only admins can change roles",
          });
      }
      userToUpdate.role = role;
    }

    userToUpdate.name = name || userToUpdate.name;
    userToUpdate.email = email || userToUpdate.email;

    let passwordChanged = false;
    if (password && password.trim() !== "") {
      userToUpdate.password = password;
      passwordChanged = true;
    }

    await userToUpdate.save();

    if (
      passwordChanged &&
      userToUpdate._id.toString() === loggedInUser._id.toString()
    ) {
      res.clearCookie("token");
      return res.json({
        success: true,
        message: "Password changed. Please login again.",
        redirect: "/login",
      });
    }

    await logActivity({
      user: userToUpdate._id,
      action: "UPDATE_PROFILE",
      description: `Profile updated for user ${userToUpdate.email}`,
      req,
      status: "success",
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role,
      },
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    await logActivity({
      user: null,
      action: "UPDATE_PROFILE",
      description: `Profile update failed for user ${req.body.email}`,
      req,
      status: "failed",
    });
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- TOGGLE USER STATUS ------------------- */
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId, isActive } = req.body;

    if (!userId || typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    );

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await logActivity({
      user: user._id,
      action: "TOGGLE_USER_STATUS",
      description: `User ${
        isActive ? "activated" : "deactivated"
      } with userId ${userId}`,
      req,
      status: "success",
    });

    return res
      .status(200)
      .json({
        success: true,
        message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      });
  } catch (error) {
    console.error("❌ toggleUserStatus error:", error.message);
    await logActivity({
      user: null,
      action: "TOGGLE_USER_STATUS",
      description: `User status toggle failed for userId ${userId}`,
      req,
      status: "failed",
    });
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- BULK ACTIVATE USERS ------------------- */
exports.bulkActivateUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !userIds.length)
      return res
        .status(400)
        .json({ success: false, message: "No users selected" });

    await User.updateMany({ _id: { $in: userIds } }, { isActive: true });

    await logActivity({
      user: req.user._id,
      action: "BULK_ACTIVATE_USERS",
      description: `Bulk activate users with userIds ${userIds}`,
      req,
      status: "success",
    });

    res
      .status(200)
      .json({ success: true, message: "Users activated successfully" });
  } catch (error) {
    console.error("❌ bulkActivateUsers error:", error.message);
    await logActivity({
      user: null,
      action: "BULK_ACTIVATE_USERS",
      description: `Bulk activate users failed`,
      req,
      status: "failed",
    });
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- BULK DEACTIVATE USERS ------------------- */
exports.bulkDeactivateUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !userIds.length)
      return res
        .status(400)
        .json({ success: false, message: "No users selected" });

    await User.updateMany({ _id: { $in: userIds } }, { isActive: false });

    await logActivity({
      user: req.user._id,
      action: "BULK_DEACTIVATE_USERS",
      description: `Bulk deactivate users with userIds ${userIds}`,
      req,
      status: "success",
    });

    res
      .status(200)
      .json({ success: true, message: "Users deactivated successfully" });
  } catch (error) {
    console.error("❌ bulkDeactivateUsers error:", error.message);
    await logActivity({
      user: null,
      action: "BULK_DEACTIVATE_USERS",
      description: `Bulk deactivate users failed`,
      req,
      status: "failed",
    });
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- BULK DELETE USERS ------------------- */
exports.bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !userIds.length)
      return res
        .status(400)
        .json({ success: false, message: "No users selected" });

    await User.deleteMany({ _id: { $in: userIds } });

    await logActivity({
      user: req.user._id,
      action: "BULK_DELETE_USERS",
      description: `Bulk delete users with userIds ${userIds}`,
      req,
      status: "success",
    });

    res
      .status(200)
      .json({ success: true, message: "Users deleted successfully" });
  } catch (error) {
    console.error("❌ bulkDeleteUsers error:", error.message);
    await logActivity({
      user: null,
      action: "BULK_DELETE_USERS",
      description: `Bulk delete users failed`,
      req,
      status: "failed",
    });
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- BULK CREATE USERS ------------------- */
exports.bulkCreateUsers = async (req, res) => {
  try {
    const { users } = req.body;
    if (!users || !users.length) {
      return res
        .status(400)
        .json({ success: false, message: "No users provided" });
    }

    const usersWithHashedPasswords = await Promise.all(
      users.map(async (u) => {
        const plainPassword = u.password || u.name.replace(/\s/g, "") + "@123";
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        return {
          ...u,
          password: hashedPassword,
        };
      })
    );

    await User.insertMany(usersWithHashedPasswords);

    await logActivity({
      user: req.user._id,
      action: "BULK_CREATE_USERS",
      description: `Bulk created users: ${users
        .map((u) => u.email)
        .join(", ")}`,
      req,
      status: "success",
    });

    res
      .status(200)
      .json({ success: true, message: "Users created successfully" });
  } catch (error) {
    console.error("❌ bulkCreateUsers error:", error.message);
    await logActivity({
      user: null,
      action: "BULK_CREATE_USERS",
      description: `Bulk create users failed`,
      req,
      status: "failed",
    });
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- GET ALL ACTIVITY LOGS ------------------- */
exports.getAllActivityLogs = async (req, res) => {
  try {
    const activityLogs = await Activitylogs.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: activityLogs,
    });
  } catch (error) {
    console.error("❌ getAllActivityLogs error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
