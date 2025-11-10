const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

const { register, login } = require("../controllers/authController");

// REGISTER 
router.post("/register", upload.single("image"), register);

// LOGIN
router.post("/login", login);

module.exports = router;
