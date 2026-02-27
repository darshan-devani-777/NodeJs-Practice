const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { guest } = require("../middlewares/guestMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const User = require("../models/User");
const Blog = require("../models/Blog");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Order = require("../models/Order"); 
const Faq = require("../models/Faq");
const PrivacyPolicy = require("../models/PrivacyPolicy"); 

// LOGIN
router.get("/", (req, res) => res.redirect("/login"));

// LOGIN 
router.get("/login", guest, (req, res) =>
  res.render("auth/login", {
    user: req.user,
    expired: req.query.expired,
    invalid: req.query.invalid,
    success: req.query.success,
    pageContent: "login.ejs",
  })
);

// FORGOT PASSWORD
router.get("/forgot-password", guest, (req, res) =>
  res.render("auth/forgot-password", {
    user: req.user,
    error: null,
    success: null,
    resetUrl: null,
    pageContent: "forgot-password.ejs",
  })
);

// RESET PASSWORD
router.get("/reset-password/:token", guest, (req, res) =>
  res.render("auth/reset-password", {
    user: req.user,
    token: req.params.token,
    pageContent: "reset-password.ejs"
  })
);

// DASHBOARD
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

// USERS
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

// BLOGS
router.get("/blogs", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const limit = 5;

    const blogs = await Blog.find()
      .populate("author", "name email")
      .sort({ _id: 1 })
      .limit(limit + 1);

    const hasNextPage = blogs.length > limit;
    if (hasNextPage) blogs.pop();

    res.render("layouts/header", {
      user: req.user,
      pageContent: "blogs.ejs",
      blogs,
      hasNextPage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// PRODUCTS
router.get("/products", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const limit = 5;

    const products = await Product.find()
      .populate("createdBy", "name email")
      .sort({ _id: 1 })
      .limit(limit + 1);

    const hasNextPage = products.length > limit;
    if (hasNextPage) products.pop();

    res.render("layouts/header", {
      user: req.user,
      pageContent: "products.ejs",
      products,
      hasNextPage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// CARTS 
router.get("/carts", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const limit = 5;
    const carts = await Cart.find()
      .populate("user", "name email")
      .populate("items.product", "title price image brand")
      .populate("updatedBy", "name email")
      .sort({ updatedAt: -1 })
      .limit(limit + 1);

    const hasNextPage = carts.length > limit;
    if (hasNextPage) carts.pop();

    res.render("layouts/header", {
      user: req.user,
      pageContent: "carts.ejs",
      carts,
      hasNextPage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ORDERS 
router.get("/orders", protect, authorizeRoles("user", "admin"), async (req, res) => {
  try {
    const limit = 5;
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "title price image brand")
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasNextPage = orders.length > limit;
    if (hasNextPage) orders.pop();

    res.render("layouts/header", {
      user: req.user,
      pageContent: "orders.ejs",
      orders,
      hasNextPage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// FAQS
router.get("/faqs", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const limit = 5;

    const faqs = await Faq.find()
      .sort({ _id: 1 })
      .limit(limit + 1);

    const hasNextPage = faqs.length > limit;
    if (hasNextPage) faqs.pop();

    res.render("layouts/header", {
      user: req.user,
      pageContent: "faqs.ejs",
      faqs,
      hasNextPage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// PRIVACY POLICY
router.get("/privacy-policy", protect, authorizeRoles("user", "admin"), async (req, res) => {
  try {
    const policy = await PrivacyPolicy.findOne();
    res.render("layouts/header", {
      user: req.user,
      pageContent: "privacy-policy.ejs", 
      policy,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// SETTINGS
router.get("/settings", protect, authorizeRoles("user", "admin"), (req, res) =>
  res.render("layouts/header", {
    user: req.user,
    pageContent: "settings.ejs",
  })
);

// ACTIVITY LOGS
router.get("/activity-logs", protect, authorizeRoles("admin"), (req, res) =>
  res.render("layouts/header", {
    user: req.user,
    pageContent: "activity-logs.ejs",
  })
);

// LOGOUT
router.get("/logout", protect, (req, res) => {
  res.clearCookie("token");
  res.redirect("/login?success=Logged out successfully");
});

module.exports = router;
