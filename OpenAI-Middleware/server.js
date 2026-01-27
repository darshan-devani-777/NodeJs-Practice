const express = require("express");
const dotenv = require("dotenv");
const chatRoutes = require("./src/routes/chatRoutes");
const dlqRoutes = require("./src/routes/dlqRoutes");
const imageRoute = require("./src/routes/imageGenerate");
const path = require("path");
const cors = require("cors");
const authMiddleware = require("./src/middleware/auth");
const rateLimiter = require("./src/middleware/rateLimiter");
const validateRequest = require("./src/middleware/validateRequest");
const { startChatWorker } = require("./src/workers/chatWorker");

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const allowedOrigins = ["http://localhost:7070", "http://192.168.29.31:7070"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use("/api", imageRoute);
app.use("/api", rateLimiter, validateRequest, chatRoutes);
app.use("/api/dlq", authMiddleware, rateLimiter, dlqRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
  console.log(`📡 API Gateway: http://localhost:${PORT}/api`);
  console.log(`💀 DLQ Management: http://localhost:${PORT}/api/dlq`);

  setTimeout(async () => {
    try {
      startChatWorker();
      console.log("Worker pool started...");
    } catch (error) {
      console.log("⚠️ Worker pool not available (Redis not running)");
      console.log("💡 To enable queue features: start Redis with 'redis-server'");
    }
  }, 1000);
});

process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  const { stopChatWorker } = require("./src/workers/chatWorker");
  await stopChatWorker();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received, shutting down gracefully...");
  const { stopChatWorker } = require("./src/workers/chatWorker");
  await stopChatWorker();
  process.exit(0);
});
