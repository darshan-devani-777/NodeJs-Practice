const mongoose = require("mongoose");

const privacyPolicySchema = new mongoose.Schema(
  {
    sections: [
      {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true, trim: true },
      }
    ],
    isActive: { type: Boolean, default: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // optional if you want
  },
  { timestamps: true }
);

// Static method to get the latest active policy
privacyPolicySchema.statics.getActivePolicy = function () {
  return this.findOne({ isActive: true })
    .sort({ updatedAt: -1 })
    .populate("author", "name email role");
};

module.exports = mongoose.model("PrivacyPolicy", privacyPolicySchema);
