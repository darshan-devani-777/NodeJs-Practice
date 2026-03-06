const mongoose = require("mongoose");

const aboutUsSchema = new mongoose.Schema(
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

aboutUsSchema.statics.getActiveAbout = function () {
  return this.findOne({ isActive: true })
    .sort({ updatedAt: -1 })
    .populate("author", "name email role");
};

module.exports = mongoose.model("AboutUs", aboutUsSchema);