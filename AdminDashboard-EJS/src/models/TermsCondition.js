const mongoose = require("mongoose");

const termsConditionSchema = new mongoose.Schema(
  {
    sections: [
      {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true, trim: true },
      }
    ],
    isActive: { type: Boolean, default: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

termsConditionSchema.statics.getActiveTerms = function () {
  return this.findOne({ isActive: true })
    .sort({ updatedAt: -1 })
    .populate("author", "name email role");
};

module.exports = mongoose.model("TermsCondition", termsConditionSchema);