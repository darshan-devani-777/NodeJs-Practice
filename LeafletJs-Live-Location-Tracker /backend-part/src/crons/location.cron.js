const cron = require("node-cron");
const redis = require("../config/redis");
const LiveLocation = require("../models/liveLocation.model");

cron.schedule("*/1 * * * *", async () => {
  const startTime = new Date();

  console.log("🕒 Cron started:", startTime.toLocaleString());

  try {
    const keys = await redis.keys("live:*");
    console.log(`📦 Redis keys found: ${keys.length}`);

    if (keys.length === 0) {
      console.log("⚠️ No live locations to save");
      return;
    }

    for (const key of keys) {
      const socketId = key.split(":")[1];
      const data = await redis.hGetAll(key);

      if (!data.lat || !data.lng) {
        console.log(`⏭ Skipped (missing coords): ${socketId}`);
        continue;
      }

      await LiveLocation.create({
        socketId,
        lat: Number(data.lat),
        lng: Number(data.lng),
      });

      console.log(
        `✅ Saved → socketId=${socketId}, lat=${data.lat}, lng=${data.lng}`
      );
    }

    console.log(
      `🎉 Cron completed successfully at ${new Date().toLocaleString()}`
    );
  } catch (error) {
    console.error("❌ Cron error:", error.message);
  }
});
