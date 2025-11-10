const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    categories: [{ type: String }],
    image: { type: String }, 
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "RateReview" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
