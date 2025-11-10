const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const CODES = require("../response/responseCode");
const buildResponse = require("../helpers/response");
const logger = require("../config/logger");

// Register
exports.register = async (name, email, password, role = 'user') => {
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      logger.warn("Register blocked: email exists", { email });
      return buildResponse("ERROR", CODES.ERROR.EMAIL_EXISTS, "Email already registered.", null);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    logger.info("User registered", { userId: user._id.toString(), email, role });

    return buildResponse("SUCCESS", CODES.SUCCESS.USER_CREATED, "User registered successfully...", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    logger.error("Register failed", { email, error: err.message });
    return buildResponse("ERROR", CODES.ERROR.CREATE_FAILED, err.message, null);
  }
};

// Login
exports.login = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Login failed: user not found", { email });
      return buildResponse("ERROR", CODES.ERROR.USER_NOT_FOUND, "Invalid credentials", null);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn("Login failed: wrong password", { userId: user._id.toString(), email });
      return buildResponse("ERROR", CODES.ERROR.LOGIN_FAILED, "Invalid credentials", null);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    logger.info("Login success", { userId: user._id.toString(), email, role: user.role });
    return buildResponse("SUCCESS", "LOGIN_SUCCESS", "User login successfully...", {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    logger.error("Login failed: exception", { email, error: err.message });
    return buildResponse("ERROR", CODES.ERROR.LOGIN_FAILED, err.message, null);
  }
};
