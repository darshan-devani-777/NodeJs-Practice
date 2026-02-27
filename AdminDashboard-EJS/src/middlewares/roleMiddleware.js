exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return handleUnauthorized(req, res);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return handleForbidden(req, res);
    }

    next();
  };
};

/* ------------------- HELPERS ------------------- */
const handleUnauthorized = (req, res) => {
  // API requests
  if (req.originalUrl.startsWith("/api")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  // Page requests
  return res.redirect("/login");
};

const handleForbidden = (req, res) => {
  // API requests
  if (req.originalUrl.startsWith("/api")) {
    return res.status(403).json({
      success: false,
      message: "Forbidden access",
    });
  }

  // Page requests
  return res.status(403).render("errors/403", {
    user: req.user,
    showSidebar: false,
    message: "You do not have permission to access this page",
  });
};
