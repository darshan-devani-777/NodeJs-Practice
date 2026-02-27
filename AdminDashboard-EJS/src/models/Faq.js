const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
      minlength: [5, "Question must be at least 5 characters"],
      maxlength: [200, "Question cannot exceed 200 characters"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
      minlength: [10, "Answer must be at least 10 characters"],
      maxlength: [1000, "Answer cannot exceed 1000 characters"],
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return tags.every((tag) => tag.length <= 30);
        },
        message: "Each tag must be 30 characters or less",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faq", faqSchema);
