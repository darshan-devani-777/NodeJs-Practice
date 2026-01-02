const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.post("/chatGPT", chatController.handleChatRequest);

module.exports = router;
