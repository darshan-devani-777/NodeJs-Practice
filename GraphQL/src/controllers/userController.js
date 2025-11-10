const User = require("../models/User");
const logger = require("../config/logger");
const CODES = require("../response/responseCode");
const buildResponse = require("../helpers/response");

// Get All User
exports.getUsers = async () => {
  try {
    const users = await User.find().select("-password");
    logger.info("Users listed", { count: users.length });
    return buildResponse("SUCCESS", CODES.SUCCESS.USERS_FETCHED, "Users fetched successfully...", users);
  } catch (err) {
    logger.error("Users fetch failed", { error: err.message });
    return buildResponse("ERROR", CODES.ERROR.FETCH_FAILED, err.message, null);
  }
};

// Get ALl User (Cursor-based Pagination)
exports.getUsersPaginated = async ({ first = 10, after, last, before }) => {
  try {
    const limit = Math.min(first || last || 10, 100);
    const query = {};

    if (after) {
      query._id = { $gt: after };
    } else if (before) {
      query._id = { $lt: before };
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ _id: 1 })
      .limit(limit + 1);

    const hasNextPage = users.length > limit;
    if (hasNextPage) users.pop();

    const edges = users.map((u) => ({
      node: { id: u._id.toString(), name: u.name, email: u.email, role: u.role },
      cursor: u._id.toString()
    }));

    const totalCount = await User.countDocuments();

    const connection = {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: Boolean(after),
        startCursor: edges[0]?.cursor || null,
        endCursor: edges[edges.length - 1]?.cursor || null,
      },
      totalCount,
    };

    logger.info("Users paginated listed", { returned: users.length, totalCount });
    return buildResponse(
     "SUCCESS", CODES.SUCCESS.USERS_FETCHED,
      "Users fetched successfully...",
      connection
    );

  } catch (err) {
    return buildResponse(
      "error",
      "500",
      err.message || "Failed to fetch users",
      null
    );
  }
};

// Get User By Id
exports.getUserById = async (id) => {
  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      logger.warn("User not found", { id });
      return buildResponse("ERROR", CODES.ERROR.USER_NOT_FOUND, "User not found", null);
    }
    logger.info("User fetched", { id });
    return buildResponse("SUCCESS", CODES.SUCCESS.USER_FETCHED, "User fetched successfully...", user);
  } catch (err) {
    logger.error("User fetch by id failed", { id, error: err.message });
    return buildResponse("ERROR", CODES.ERROR.FETCH_FAILED, err.message, null);
  }
};

// Update User
exports.updateUser = async (id, data) => {
  try {
    if (data.password) delete data.password; 
    const user = await User.findByIdAndUpdate(id, data, { new: true }).select("-password");
    if (!user) {
      logger.warn("Update failed: user not found", { id });
      return buildResponse("ERROR", CODES.ERROR.USER_NOT_FOUND, "User not found", null);
    }
    logger.info("User updated", { id });
    return buildResponse("SUCCESS", CODES.SUCCESS.USER_UPDATED, "User updated successfully...", user);
  } catch (err) {
    logger.error("User update failed", { id, error: err.message });
    return buildResponse("ERROR", CODES.ERROR.UPDATE_FAILED, err.message, null);
  }
};

// Delete User
exports.deleteUser = async (id) => {
  try {
    const user = await User.findByIdAndDelete(id).select("-password");
    if (!user) {
      logger.warn("Delete failed: user not found", { id });
      return buildResponse("ERROR", CODES.ERROR.USER_NOT_FOUND, "User not found", null);
    }
    logger.info("User deleted self", { id });
    return buildResponse("SUCCESS", CODES.SUCCESS.USER_DELETED, "User deleted successfully...", user);
  } catch (err) {
    logger.error("User delete failed", { id, error: err.message });
    return buildResponse("ERROR", CODES.ERROR.DELETE_FAILED, err.message, null);
  }
};

// Update User Role (Admin only)
exports.updateUserRole = async (id, role) => {
  try {
    const user = await User.findByIdAndUpdate(
      id, 
      { role }, 
      { new: true }
    ).select("-password");
    
    if (!user) {
      logger.warn("Role update failed: user not found", { id, role });
      return buildResponse("ERROR", CODES.ERROR.USER_NOT_FOUND, "User not found", null);
    }
    logger.info("User role updated", { id, role });
    return buildResponse("SUCCESS", CODES.SUCCESS.USER_UPDATED, "User role updated successfully...", user);
  } catch (err) {
    logger.error("User role update failed", { id, role, error: err.message });
    return buildResponse("ERROR", CODES.ERROR.UPDATE_FAILED, err.message, null);
  }
};

// Delete User by Admin (Admin only)
exports.deleteUserByAdmin = async (id) => {
  try {
    const user = await User.findByIdAndDelete(id).select("-password");
    if (!user) {
      logger.warn("Admin delete failed: user not found", { id });
      return buildResponse("ERROR", CODES.ERROR.USER_NOT_FOUND, "User not found", null);
    }
    logger.info("Admin deleted user", { id });
    return buildResponse("SUCCESS", CODES.SUCCESS.USER_DELETED, "User deleted by admin successfully...", user);
  } catch (err) {
    logger.error("Admin delete failed", { id, error: err.message });
    return buildResponse("ERROR", CODES.ERROR.DELETE_FAILED, err.message, null);
  }
};
