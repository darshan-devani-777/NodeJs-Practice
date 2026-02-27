const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product is required"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
    max: [1000, "Quantity cannot exceed 1000"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price must be positive"],
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },
    items: [cartItemSchema],
    totalItems: {
      type: Number,
      default: 0,
      min: [0, "Total items cannot be negative"],
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: [0, "Total amount cannot be negative"],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    abandoned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 });
cartSchema.index({ "items.product": 1 });

module.exports = mongoose.model("Cart", cartSchema);
