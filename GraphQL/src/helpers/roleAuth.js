const jwt = require("jsonwebtoken");
const User = require("../models/User");
const CODES = require("../response/responseCode");
const buildResponse = require("./response");

const authMiddleware = (context) => {
  const token = context.req.headers.authorization;
  if (!token) {
    return buildResponse("ERROR", CODES.ERROR.NO_TOKEN, "No token provided", null);
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    context.user = decoded;
    return { success: true, user: decoded };
  } catch (err) {
    return buildResponse("ERROR", CODES.ERROR.INVALID_TOKEN, "Invalid token", null);
  }
};

const requireRole = (roles) => {
  return async (context) => {
    const authResult = authMiddleware(context);
    if (!authResult.success) {
      return authResult; 
    }
    
    try {
      const currentUser = await User.findById(authResult.user.id);
      if (!currentUser) {
        return buildResponse("ERROR", CODES.ERROR.USER_NOT_FOUND, "User not found", null);
      }

      if (!roles.includes(currentUser.role)) {
        return buildResponse("ERROR", CODES.ERROR.ACCESS_DENIED, `Access denied. Required roles: ${roles.join(", ")}`, null);
      }

      return { success: true, user: currentUser };
    } catch (err) {
      return buildResponse("ERROR", CODES.ERROR.USER_NOT_AUTHENTICATED, "Authentication failed", null);
    }
  };
};

const requireAdmin = () => requireRole(['admin']);
const requireUser = () => requireRole(['user', 'admin']);

module.exports = {
  authMiddleware,
  requireRole,
  requireAdmin,
  requireUser,
};
