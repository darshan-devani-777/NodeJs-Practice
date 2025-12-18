const Product = require("../models/productModel");
const User = require("../../../user-service/src/models/userModel");

exports.createProduct = (req, res) => {
  const { name, price, userId } = req.body;

  if (!name || !price || !userId) {
    return res.status(400).json({
      success: false,
      message: "name, price, and userId are required",
    });
  }

  const user = User.getUserById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found — cannot create product",
    });
  }

  const newProduct = Product.createProduct({
    name,
    price,
    ownerId: user.id,
    ownerName: user.name,
  });

  if (!newProduct) {
    return res.status(409).json({
      success: false,
      message: "Product already exists",
    });
  }

  return res.status(201).json({
    success: true,
    message: "Product created successfully...",
    data: newProduct,
  });
};

exports.getAllProducts = (req, res) => {
  try {
    const products = Product.getAllProducts();

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully...",
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
      error: error.message,
    });
  }
};

