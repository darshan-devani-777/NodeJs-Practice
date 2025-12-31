const mongoose = require("mongoose");

const liveLocationSchema = new mongoose.Schema(
  {
    socketId: { type: String, index: true },
    lat: Number,
    lng: Number,
  },
  { timestamps: true }
);

liveLocationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 600 }
);

module.exports = mongoose.model("LiveLocation", liveLocationSchema);
