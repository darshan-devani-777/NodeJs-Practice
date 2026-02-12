const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* ------------------- AUTH PROTECT ------------------- */
exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return handleUnauthorized(req, res, "Login required / Provide token");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      res.clearCookie("token");

      if (err.name === "TokenExpiredError") {
        return handleUnauthorized(req, res, "Token expired");
      }

      return handleUnauthorized(req, res, "Invalid token");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      res.clearCookie("token");
      return handleUnauthorized(req, res, "Invalid token");
    }

    req.user = user;
    res.locals.user = user;
    next();
  } catch (err) {
    console.error("Protect middleware error:", err);
    res.clearCookie("token");
    return handleUnauthorized(req, res, "Unauthorized access");
  }
};

/* ------------------- HELPERS ------------------- */
const handleUnauthorized = (req, res, message) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(401).json({
      success: false,
      message,
    });
  }

  if (message === "Token expired") {
    return res.redirect("/login?expired=true");
  }

  if (message === "Invalid token") {
    return res.redirect("/login?invalid=true");
  }

  return res.redirect("/login");
};

