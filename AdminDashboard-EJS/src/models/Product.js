const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      unique: [true, "Title must be unique"],
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
      match: [/^[a-zA-Z0-9\s]+$/, "Title must only contain letters, numbers, and spaces"],
    },

    description: {
      type: String,
      trim: true,
      required: [true, "Description is required"],
      minlength: [30, "Description must be at least 30 characters"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    price: {
      type: Number,
      trim: true,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },

    category: {
      type: [String],
      trim: true,
      required: [true, "Category is required"],
      validate: {
        validator: function (categories) {
          return categories.length > 0;
        },
        message: "At least one category is required",
      },
    },

    subCategory: {
      type: [String],
      trim: true,
      required: [true, "subCategory is required"],
      validate: {
        validator: function (subCategories) {
          return subCategories && subCategories.length > 0;
        },
        message: "At least one subcategory is required",
      },
      default: [],
    },

    tags: {
      type: [String],
      trim: true,
      default: [],
      validate: {
        validator: function (tags) {
          return tags.every((tag) => tag.length <= 40);
        },
        message: "Each tag must be 40 characters or less",
      },
    },

    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      match: [/^[a-zA-Z0-9\s]+$/, "Brand must only contain letters, numbers, and spaces"],
    },

    attributes: {
      color: {
        type: String,
        trim: true,
        required: [true, "Color is required"],
      },
      size: {
        type: String,
        trim: true,
        required: [true, "Size is required"],
      },
    },

    inventory: {
      type: Number,
      trim: true,
      required: [true, "Inventory is required"],
      min: [0, "Inventory cannot be negative"],
    },

    image: {
      type: String,
      required: [true, "Image is required"],
      match: [
        /\.(jpg|jpeg|png|webp)$/,
        "Image must be of type jpg, jpeg, png, or webp"
      ],
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false
    },

    averageRating: {
      type: Number,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    },

    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

productSchema.index({ title: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);
