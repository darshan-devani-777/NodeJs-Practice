const Redis = require("ioredis");

let client;
let bullmqClient;

// GET REDIS CLIENT
function getRedisClient() {
  if (client) return client;

  const redisUrl = process.env.REDIS_URL;

  console.log("🧱 [REDIS] Initializing client", {
    usingUrl: !!redisUrl,
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
  });

  const connectionOptions = redisUrl
    ? { url: redisUrl }
    : {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT || 6379),
    };

  client = new Redis(connectionOptions);

  client.on("error", (err) => {
    console.error("❌ Redis error:", err.message);
  });

  client.on("connect", () => {
    console.log("✅ Redis Connected...");
  });

  return client;
}

// GET REDIS CONNECTION FOR BULLMQ
function getBullMQConnection() {
  if (bullmqClient) return bullmqClient;

  const redisUrl = process.env.REDIS_URL;

  console.log("🔗 [REDIS] Initializing BullMQ connection", {
    usingUrl: !!redisUrl,
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
  });

  if (redisUrl) {
    bullmqClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
    });
  } else {
    bullmqClient = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT || 6379),
      maxRetriesPerRequest: null,
    });
  }

  bullmqClient.on("error", (err) => {
    console.error("❌ BullMQ Redis error:", err.message);
  });

  bullmqClient.on("connect", () => {
    console.log("✅ BullMQ Redis Connected...");
  });

  return bullmqClient;
}

module.exports = {
  getRedisClient,
  getBullMQConnection,
};


