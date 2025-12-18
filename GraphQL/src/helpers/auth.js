const jwt = require("jsonwebtoken");

const authMiddleware = (context) => {
  const authHeader = context.req.headers.authorization;
  if (!authHeader) throw new Error("Authorization header-token missing.");

  const token = authHeader.split(" ")[1];
  if (!token) throw new Error("Token missing");

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new Error("Invalid/Expired token.");
  }
};

module.exports = authMiddleware;
