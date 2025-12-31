const cron = require("node-cron");
const redis = require("../config/redis");
const LiveLocation = require("../models/liveLocation.model");

cron.schedule("*/1 * * * *", async () => {
  const keys = await redis.keys("live:*");

  for (const key of keys) {
    const socketId = key.split(":")[1];
    const data = await redis.hGetAll(key);

    if (data.lat && data.lng) {
      await LiveLocation.create({
        socketId,
        lat: Number(data.lat),
        lng: Number(data.lng),
      });
    }
  }
});
