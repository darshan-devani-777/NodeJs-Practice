const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const queueController = require("../controllers/queueController");
const authMiddleware = require("../middleware/auth");

// Streaming endpoint (existing)
router.post("/chatGPT", chatController.handleChatRequest);

// Queue endpoint (non-streaming, uses worker pool)
router.post("/chatGPT/queue", authMiddleware, queueController.queueChatRequest);

// Queue statistics
router.get("/queue/stats", authMiddleware, queueController.getQueueStatistics);

// Get job status
router.get("/queue/jobs/:jobId", authMiddleware, queueController.getJobStatus);

module.exports = router;
