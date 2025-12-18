const jwt = require("jsonwebtoken");
const { db } = require("../models/dbconfig");

const optionalVerifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next(); // No token provided, continue without blocking
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await db.users.findByPk(decoded.id, {
      attributes: [
        "user_id",
        "first_name",
        "last_name",
        "email",
        "profile_image",
        "bio",
      ],
    });

    req.user = user || null;
    next();
  } catch (error) {
    req.user = null; // Token invalid or expired, but do not block
    next();
  }
};

module.exports = { optionalVerifyToken };
