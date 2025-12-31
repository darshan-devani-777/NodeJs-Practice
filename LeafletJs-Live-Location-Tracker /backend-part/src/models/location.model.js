const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    socketId: String,

    start: {
      name: String,
      lat: Number,
      lng: Number,
    },

    end: {
      name: String,
      lat: Number,
      lng: Number,
    },

    distanceKm: {
      type: Number,
      required: true,
    },

    durationMin: {
      type: Number,
      required: true,
    },

    durationHr: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Location", schema);
