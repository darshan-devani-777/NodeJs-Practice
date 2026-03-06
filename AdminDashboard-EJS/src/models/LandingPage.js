const mongoose = require("mongoose");

const landingPageSchema = new mongoose.Schema(
  {
    sectionName: {
      type: String,
      required: [true, "Section name is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Section name must be at least 3 characters"],
      maxlength: [100, "Section name must be at most 100 characters"],
      validate: {
        validator: v => /^[a-z0-9\-_\s]+$/.test(v),
        message: "Section name can contain letters, numbers, spaces, dashes and underscores only",
      },
    },

    content: {
      type: Object,
      required: [true, "Content is required"],
      validate: {
        validator: v => v && typeof v === "object" && !Array.isArray(v),
        message: "Content must be a non-empty object",
      },
    },

    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "CreatedBy is required"],
      index: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  { timestamps: true }
);

landingPageSchema.index({ sectionName: 1 }, { unique: true });

module.exports = mongoose.model("LandingPage", landingPageSchema);
