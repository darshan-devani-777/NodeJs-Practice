const User = require("../models/userModel");
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");

// Role ckeck
exports.roleMiddleware = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role; 

    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied..!" });
    }
    next();
  };
};

// Middleware to check if user is SuperAdmin
exports.isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.json({ stausCode:StatusCodes.FORBIDDEN , success:false , message: "Requires superadmin role" });
  }
  next();
};

// Middleware to check if user is Admin or SuperAdmin
exports.isAdminOrSuperAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res
      .json({ stausCode:StatusCodes.FORBIDDEN , success:false , message: "Requires admin or superadmin role" });
  }
  next();
};

// Middleware to check if user can manage the target user
exports.canManageUser = async (req, res, next) => {
  try {
    let { id } = req.params;
    const requester = req.user;

    if (!id) {
      id = requester._id.toString();
      console.log("No ID param provided, using requester ID:", id);
    }

    console.log("Requester:", requester);
    console.log("Target user ID param:", id);

    // Validate id format (must be a valid ObjectId)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid user ID format");
      return res.json({ statusCode:StatusCodes.BAD_REQUEST , success:false , message: "Invalid user ID" });
    }

    // Superadmin can manage all
    if (requester.role === "superadmin") {
      console.log("Access granted: requester is superadmin");
      return next();
    }

    // Admin can manage own profile or users with role 'user'
    if (requester.role === "admin") {
      if (requester._id.toString() === id) {
        console.log("Access granted: admin managing own profile");
        return next();
      }

      const targetUser = await User.findById(id);
      console.log("TargetUser from DB:", targetUser);

      if (!targetUser) {
        console.log("User not found");
        return res.json({ statusCode:StatusCodes.NOT_FOUND , success:false , message: "User not found" });
      }

      if (targetUser.role && targetUser.role.toLowerCase() === "user") {
        console.log("Access granted: admin managing a user role profile");
        return next();
      } else {
        console.log(
          "Forbidden: Admin tried to manage a non-user or protected role"
        );
        return res.json({
          statusCode:StatusCodes.FORBIDDEN,
          success:false,
          message: "Admins can only manage users and their own profile",
        });
      }
    }

    // Normal user can manage only their own profile
    if (requester.role === "user") {
      if (requester._id.toString() === id) {
        console.log("Access granted: user managing own profile");
        return next();
      } else {
        console.log("Forbidden: user tried to manage another profile");
        return res.json({
          statusCode:StatusCodes.FORBIDDEN,
          success:false,
          message: "Users can only manage their own profile",
        });
      }
    }

    // Default deny if no matching role
    console.log("Unauthorized access attempt");
    return res.json({ statusCode:StatusCodes.FORBIDDEN , success:false , message: "Unauthorized" });
  } catch (error) {
    console.error("Authorization error:", error);
    return res.json({ stausCode:StatusCodes.INTERNAL_SERVER_ERROR , success:false , message: "Server error" });
  }
};

