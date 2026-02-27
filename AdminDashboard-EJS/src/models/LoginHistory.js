const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ip: String,
    userAgent: String,
    status: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoginHistory", loginHistorySchema);