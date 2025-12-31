const { Server } = require("socket.io");
const redis = require("../config/redis");
const Location = require("../models/location.model");

module.exports = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    /* ROUTE SAVE */
    socket.on("create-route", async ({ start, end, route }) => {
      try {
        await Location.create({
          socketId: socket.id,

          start: {
            name: start.name,
            lat: start.lat,
            lng: start.lng,
          },

          end: {
            name: end.name,
            lat: end.lat,
            lng: end.lng,
          },

          distanceKm: Number((route.distance / 1000).toFixed(2)),
          durationMin: Math.round(route.duration / 60),
          durationHr: Number((route.duration / 3600).toFixed(2)),
        });

        socket.emit("route-saved", { success: true });
      } catch (err) {
        console.error("❌ Route save error:", err.message);
      }
    });

    /* LIVE LOCATION */
    socket.on("live-location", async ({ lat, lng }) => {
      const key = `live:${socket.id}`;

      await redis.hSet(key, {
        lat,
        lng,
        updatedAt: Date.now(),
      });

      await redis.expire(key, 120);

      io.emit("location-updated", { lat, lng });
    });

    socket.on("disconnect", async () => {
      await redis.del(`live:${socket.id}`);
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });
};
