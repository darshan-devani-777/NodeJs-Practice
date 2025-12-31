const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    socketId: String,
    lat: Number,
    lng: Number,
  },
  { timestamps: true }
);

schema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model("LiveLocation", schema);
