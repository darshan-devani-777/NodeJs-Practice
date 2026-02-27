  const mongoose = require("mongoose");

  const blogSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        unique:true,
        minlength: [3, "Title must be at least 3 characters"],
        maxlength: [100, "Title cannot exceed 100 characters"],
      },

      content: {
        type: String,
        required: [true, "Content is required"],
        minlength: [30, "Content must be at least 30 characters"],
      },

      tags: {
        type: [String],
        default: [],
        validate: {
          validator: function (tags) {
            return tags.every((tag) => tag.length <= 20);
          },
          message: "Each tag must be 20 characters or less",
        },
      },

      isPublished: {
        type: Boolean,
        default: false,
      },

      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    { timestamps: true }
  );

  module.exports = mongoose.model("Blog", blogSchema);
