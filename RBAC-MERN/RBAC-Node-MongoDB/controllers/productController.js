const Product = require("../models/productModel");
const RateReview = require("../models/rateReviewModel");
const { StatusCodes } = require("http-status-codes");

// CREATE PRODUCT (admin / superadmin only)
exports.createProduct = async (req, res) => {
  try {
    let {
      name = "",
      description = "",
      price,
      categories,
      quantity,
    } = req.body;

    name = name.trim();
    description = description.trim();

    if (typeof categories === "string") {
      try {
        categories = JSON.parse(categories); 
      } catch (err) {
        categories = categories.split(",").map((cat) => cat.trim());
      }
    }

    //  Step 3: Create product
    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      categories,
      image: req.file ? "/uploads/products/" + req.file.filename : null,
      createdBy: req.user._id,
    });
    const savedProduct = await newProduct.save();

    res.json({
      statusCode: 201,
      success: true,
      message: "Product Created Successfully",
      product: savedProduct,
    });
  } catch (err) {
    console.error("Product creation error:", err);
    res.json({
      statusCode: 500,
      success: false,
      message: "Internal Server Error",
    });
  }
};

// GET ALL PRODUCTS (accessible to all)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const productsWithAvgRating = await Promise.all(
      products.map(async (product) => {
        const reviews = await RateReview.find({ product: product._id }).populate("user", "name email");
    
        let avgRating = 0;
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          avgRating = totalRating / reviews.length;
        }
    
        return {
          ...product.toObject(),
          avgRating: avgRating.toFixed(1),
          reviews,
          createdBy: product.createdBy?.toString() || null 
        };
      })
    );
    
    res.status(200).json({
      success: true,
      message: "Products Fetched Successfully...",
      products: productsWithAvgRating,
    });
    
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while fetching products. Please try again later.",
      error: error.message,
    });
  }
};

// GET SPECIFIC ID (accessible to all)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate({
        path: "reviews",
        populate: {
          path: "user",
          select: "name _id", 
        },
      });

    if (!product) {
      return res.status(404).json({
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      statusCode: StatusCodes.OK,
      success: true,
      message: "Product Retrieved Successfully...",
      product,
    });
  } catch (err) {
    res.status(500).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Internal Server Error",
    });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // Parse categories from string to array if necessary
    if (typeof req.body.categories === "string") {
      try {
        req.body.categories = JSON.parse(req.body.categories);
      } catch (err) {
        req.body.categories = req.body.categories
          .split(",")
          .map((cat) => cat.trim());
      }
    }

    let imagePath = product.image;
    if (req.file) {
      imagePath = `/uploads/products/${req.file.filename}`;
    }

    const updatedData = {
      ...req.body,
      image: imagePath,
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true }
    ).populate("createdBy", "name email role");

    res.status(200).json({
      success: true,
      message: "Product Updated Successfully...",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE PRODUCT (admin / superadmin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("createdBy", "name email role");

    if (!product) {
      return json({ statusCode:StatusCodes.NOT_FOUND , success: false, message: "Product not found" });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({
      statusCode:StatusCodes.OK,
      success: true,
      message: "Product Deleted Successfully",
      deletedProduct: product,
    });

  } catch (err) {
    console.error("Delete Error:", err);
    res.json({ statusCode:StatusCodes.INTERNAL_SERVER_ERROR , success: false, message: "Internal Server Error" });
  }
};

// GET ALL CATEGORIES
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("categories");
    res.json({ statusCode:StatusCodes.OK , success: true, message: "Fetched All Categories..." , categories });
  } catch (err) {
    res.json({ statusCode:StatusCodes.INTERNAL_SERVER_ERROR , success: false, message: "Internal Server Error" });
  }
};
