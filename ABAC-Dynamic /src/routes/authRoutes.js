const express = require("express");
const router = express.Router();
const {register, login } = require("../controllers/authController");
const auth = require("../middleware/auth");
const traceMiddleware = require("../middleware/trace");

// REGISTER 
router.post("/register", traceMiddleware, auth, register);

// LOGIN
router.post("/login", traceMiddleware, login);

module.exports = router;