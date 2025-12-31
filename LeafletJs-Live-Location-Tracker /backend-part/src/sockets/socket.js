const { Server } = require("socket.io");
const axios = require("axios");
const redis = require("../config/redis");
const Location = require("../models/location.model");

module.exports = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    // CREATE ROUTE (OSRM)
    socket.on("create-route", async ({ start, end }) => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

        const { data } = await axios.get(url);
        const route = data.routes[0];

        const distanceKm = +(route.distance / 1000).toFixed(2);
        const durationMin = +(route.duration / 60).toFixed(1); 
        const durationHr = +(route.duration / 3600).toFixed(2);

        await Location.create({
          socketId: socket.id,
          start,
          end,
          distanceKm,
          durationMin,
          durationHr,
        });

        socket.emit("route-created", {
          start,
          end,
          distanceKm,
          durationMin,
          durationHr,
          path: route.geometry.coordinates,
        });
      } catch (err) {
        console.error(err);
        socket.emit("route-error", { message: err.message });
      }
    });

    // LIVE LOCATION
    socket.on("live-location", async ({ lat, lng }) => {
      await redis.hSet(`live:${socket.id}`, {
        lat,
        lng,
        updatedAt: Date.now(),
      });
      await redis.expire(`live:${socket.id}`, 120);

      socket.emit("location-updated", { lat, lng });
    });

    socket.on("disconnect", async () => {
      await redis.del(`live:${socket.id}`);
      console.log("🔴 Disconnected:", socket.id);
    });
  });
};
