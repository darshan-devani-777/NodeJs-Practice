const User = require("../models/User");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  try {

    const { name, email, password, role, department, roles = [] } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        traceId: res.locals.traceId,
        status: "FAILED",
        message: "Email already registered."
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      roles
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      traceId: res.locals.traceId,
      status: "SUCCESS",
      message: "User registered successfully.",
      data: userObj
    });

  } catch (error) {
    console.error("Register Error:", error);

    res.status(500).json({
      traceId: res.locals.traceId,
      status: "ERROR",
      message: "Internal server error"
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select("+password")
      .populate("roles");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        traceId: res.locals.traceId,
        status: "FAILED",
        message: "Invalid email or password."
      });
    }

    const allPermissions = [...new Set(user.permissions)];

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: user.roles.map(r => ({
        id: r._id,
        name: r.name,
        permissions: r.permissions
      })),
      permissions: allPermissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      traceId: res.locals.traceId,
      status: "SUCCESS",
      message: "User login successfully...",
      meta: {
        loginTime: new Date().toISOString(),
        tokenExpiry: "1h"
      },
      data: {
        token,
        user: userData
      }
    });

  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      traceId: res.locals.traceId,
      status: "ERROR",
      message: "Internal server error"
    });
  }
};