const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { guest } = require("../middlewares/guestMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const User = require("../models/User");

router.get("/", (req, res) => res.redirect("/login"));

router.get("/login", guest, (req, res) =>
  res.render("auth/login", {
    user: req.user,
    expired: req.query.expired,
    invalid: req.query.invalid,
    success: req.query.success,
    pageContent: "login.ejs",
  })
);

router.get("/forgot-password", guest, (req, res) =>
  res.render("auth/forgot-password", {
    user: req.user,
    error: null,
    success: null,
    resetUrl: null,
    pageContent: "forgot-password.ejs",
  })
);

router.get("/reset-password/:token", guest, (req, res) =>
  res.render("auth/reset-password", {
    user: req.user,
    token: req.params.token,
    pageContent: "reset-password.ejs"
  })
);

router.get(
  "/dashboard",
  protect,
  authorizeRoles("user", "admin"),
  (req, res) => {
    try {
      res.render("layouts/header", {
        user: req.user,
        pageContent: "dashboard.ejs",
      });
    } catch (error) {
      res.status(500).send("Render failed: " + error.message);
    }
  }
);

router.get("/users", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const limit = 2;
    const users = await User.find()
      .sort({ _id: 1 })
      .limit(limit + 1);
    const hasNextPage = users.length > limit;
    if (hasNextPage) users.pop();

    res.render("layouts/header", {
      user: req.user,
      pageContent: "users.ejs",
      users,
      hasNextPage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/settings", protect, authorizeRoles("user", "admin"), (req, res) =>
  res.render("layouts/header", {
    user: req.user,
    pageContent: "settings.ejs",
  })
);

router.get("/activity-logs", protect, authorizeRoles("admin"), (req, res) =>
  res.render("layouts/header", {
    user: req.user,
    pageContent: "activity-logs.ejs",
  })
);

router.get("/logout", protect, (req, res) => {
  res.clearCookie("token");
  res.redirect("/login?success=Logged out successfully");
});

module.exports = router;
