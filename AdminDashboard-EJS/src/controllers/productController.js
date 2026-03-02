const Product = require("../models/Product");
const Review = require("../models/Review");
const mongoose = require("mongoose");
const logActivity = require("../utils/activityLogger");
const getValidationError = require("../utils/getValidationError");
const fs = require("fs");
const csvParser = require("csv-parser");
const { Parser } = require("json2csv");

/* ------------------- ADD PRODUCT ------------------- */
exports.addProduct = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is empty. Please provide the product details.",
      });
    }

    const { title, description, price, category, subCategory, tags, brand, attributes, inventory } = req.body;
    const userId = req.user._id;

    let imageUrl = '';
    if (req.file) {
      imageUrl = req.file.path;
    }

    const existingProduct = await Product.findOne({ title });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: `Product with title "${title}" already exists`,
      });
    }

    const product = await Product.create({
      title,
      description,
      price,
      category,
      subCategory,
      tags,
      brand,
      attributes,
      inventory,
      image: imageUrl,
      createdBy: userId,
    });

    await logActivity({
      user: userId,
      action: "ADD_PRODUCT",
      description: `Product added with title "${title}"`,
      req,
      status: "success",
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    console.error("❌ addProduct error:", error.message);

    if (error.name === "ValidationError") {
      const validationErrors = {};
      const attributeErrors = {};

      Object.keys(error.errors).forEach((key) => {
        const err = error.errors[key];

        if (key === "attributes.color" || key === "attributes.size") {
          attributeErrors[key] = err.message;
        } else {
          validationErrors[key] = err.message;
        }
      });

      if (Object.keys(attributeErrors).length) {
        Object.keys(attributeErrors).forEach((key) => {
          validationErrors[key] = attributeErrors[key];
        });
      }

      await logActivity({
        user: req.user?._id || null,
        action: "ADD_PRODUCT",
        description: "Product addition failed",
        req,
        status: "failed",
      });

      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    } else {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
};

/* ------------------- GET ALL PRODUCTS ------------------- */
exports.getAllProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const cursor = req.query.cursor;
    const search = req.query.search || "";
    const sort = req.query.sort || "desc";

    let query = {};

    if (search) {
      const priceNumber = parseFloat(search);
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $elemMatch: { $regex: search, $options: "i" } } },
        { category: { $elemMatch: { $regex: search, $options: "i" } } },
        { brand: { $regex: search, $options: "i" } },
      ];

      if (!isNaN(priceNumber)) {
        query.$or.push({ price: priceNumber });
      }
    }

    if (req.query.isApproved !== undefined) {
      query.isApproved = req.query.isApproved === "true";
    }

    if (req.query.isFeatured !== undefined) {
      query.isFeatured = req.query.isFeatured === "true";
    }

    let sortQuery = { _id: -1 }; 

    if (sort === "asc") sortQuery = { _id: 1 };             
    else if (sort === "price-desc") sortQuery = { price: -1 }; 
    else if (sort === "price-asc") sortQuery = { price: 1 };  

    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      let cursorQuery = {};

      if (sort === "asc") cursorQuery = { _id: { $gt: cursor } };
      else if (sort === "desc") cursorQuery = { _id: { $lt: cursor } };
      else if (sort.startsWith("price")) {
        const lastProduct = await Product.findById(cursor);
        if (lastProduct) {
          cursorQuery = sort === "price-asc"
            ? { price: { $gt: lastProduct.price } }
            : { price: { $lt: lastProduct.price } };
        }
      }

      if (query.$or) {
        query = { $and: [{ $or: query.$or }, cursorQuery] };
      } else {
        query = { ...query, ...cursorQuery };
      }
    }

    const products = await Product.find(query)
      .populate({
        path: "reviews",
        match: { isApproved: true },
        populate: { path: "user", select: "name" },
      })
      .sort(sortQuery)
      .limit(limit + 1);

    const hasNextPage = products.length > limit;
    if (hasNextPage) products.pop();

    const nextCursor = products.length ? products[products.length - 1]._id : null;

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      pageInfo: { hasNextPage, nextCursor, limit },
      data: products,
    });
  } catch (error) {
    console.error("❌ getAllProducts error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- GET SINGLE PRODUCT ------------------- */
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId",
      });
    }

    const product = await Product.findById(productId)
      .populate({
        path: "reviews",
        match: { isApproved: true },
        populate: {
          path: "user",
          select: "name"
        }
      })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });

  } catch (error) {
    console.error("❌ getProductById error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- GET PRODUCT STATS ------------------- */
exports.getProductStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Product.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          inStock: [{ $match: { inventory: { $gt: 0 } } }, { $count: "count" }],
          approved: [{ $match: { isApproved: true } }, { $count: "count" }],
          featured: [{ $match: { isFeatured: true, isApproved: true } }, { $count: "count" }],
          today: [{ $match: { createdAt: { $gte: today } } }, { $count: "count" }]
        }
      }
    ]);

    const s = stats[0];

    res.json({
      success: true,
      message: "Product stats retrieved successfully",
      stats: {
        total: s.total[0]?.count || 0,
        inStock: s.inStock[0]?.count || 0,
        approved: s.approved[0]?.count || 0,
        featured: s.featured[0]?.count || 0,
        today: s.today[0]?.count || 0
      }
    });
  } catch (e) {
    console.error("❌ getProductStats error:", e.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- EDIT PRODUCT ------------------- */
exports.editProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { title, description, price, category, subCategory, tags, brand, attributes, inventory } = req.body || {};
    const userId = req.user._id;
    let imageUrl = '';

    const isAnyFieldUpdated = (
      (title && title.trim() !== "") ||
      (description && description.trim() !== "") ||
      (price && price > 0) ||
      (category && category.length > 0) ||
      (subCategory && subCategory.length > 0) ||
      (tags && tags.length > 0) ||
      (brand && brand.trim() !== "") ||
      (attributes && attributes.color && attributes.size) ||
      (inventory && inventory > 0) ||
      req.file
    );

    if (!isAnyFieldUpdated) {
      return res.status(400).json({
        success: false,
        message: "At least one field must be provided to update the product",
      });
    }

    if (req.file) {
      imageUrl = req.file.path;
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (title && title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty",
      });
    }

    if (description && description.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Description cannot be empty",
      });
    }

    if (price && price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than zero",
      });
    }

    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (subCategory) product.subCategory = subCategory;
    if (tags) product.tags = tags;
    if (brand) product.brand = brand;
    if (attributes) product.attributes = attributes;
    if (inventory) product.inventory = inventory;

    if (imageUrl) {
      product.image = imageUrl;
    }

    product.updatedBy = userId;

    const validationErrors = {};
    try {
      await product.validate();
    } catch (err) {
      Object.keys(err.errors).forEach((key) => {
        validationErrors[key] = err.errors[key].message;
      });

      await logActivity({
        user: req.user?._id || null,
        action: "EDIT_PRODUCT",
        description: "Product edit failed due to validation error",
        req,
        status: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    await product.save();

    await logActivity({
      user: userId,
      action: "EDIT_PRODUCT",
      description: `Product updated with id "${productId}"`,
      req,
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: {
        ...product.toObject(),
        createdAt: product.createdAt,
        image: product.image,
      },
    });
  } catch (error) {
    console.error("❌ editProduct error:", error.message);

    await logActivity({
      user: req.user?._id || null,
      action: "EDIT_PRODUCT",
      description: "Product edit failed",
      req,
      status: "failed",
    });

    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- DELETE PRODUCT ------------------- */
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const deletedProduct = { ...product.toObject() };

    await Product.findByIdAndDelete(productId);

    await logActivity({
      user: userId,
      action: "DELETE_PRODUCT",
      description: `Product deleted with id "${productId}"`,
      req,
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deletedProduct,
    });
  } catch (error) {
    console.error("❌ deleteProduct error:", error.message);

    await logActivity({
      user: req.user?._id || null,
      action: "DELETE_PRODUCT",
      description: "Product deletion failed",
      req,
      status: "failed",
    });

    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- APPROVE SELLER PRODUCT ------------------- */
exports.toggleProductApproval = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isApproved = !product.isApproved;
    product.updatedBy = userId;
    await product.save();

    await logActivity({
      user: userId,
      action: "TOGGLE_PRODUCT_APPROVAL",
      description: `Product ${product._id} approval set to ${product.isApproved}`,
      req,
      status: "success",
    });

    res.json({
      success: true,
      data: {
        id: product._id,
        isApproved: product.isApproved,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to toggle approval",
    });
  }
};

/* ------------------- TOGGLE FEATURED PRODUCT ------------------- */
exports.toggleFeaturedProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?._id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      await logActivity({
        user: userId || null,
        action: "TOGGLE_FEATURED_PRODUCT",
        description: `Failed: Invalid productId (${productId})`,
        req,
        status: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Invalid productId",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      await logActivity({
        user: userId || null,
        action: "TOGGLE_FEATURED_PRODUCT",
        description: `Failed: Product not found (${productId})`,
        req,
        status: "failed",
      });

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.isApproved) {
      await logActivity({
        user: userId,
        action: "TOGGLE_FEATURED_PRODUCT",
        description: `Failed: Tried to feature unapproved product (${productId})`,
        req,
        status: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Only approved products can be featured",
      });
    }

    product.isFeatured = !product.isFeatured;
    product.updatedBy = userId;

    await product.save();

    await logActivity({
      user: userId,
      action: "TOGGLE_FEATURED_PRODUCT",
      description: `Product "${product.title}" featured status changed to ${product.isFeatured}`,
      req,
      status: "success",
    });

    return res.status(200).json({
      success: true,
      message: `Product ${product.isFeatured ? "marked as Featured" : "removed from Featured"} successfully`,
      data: product.toObject(),
    });

  } catch (error) {
    console.error("❌ toggleFeaturedProduct error:", error.message);

    await logActivity({
      user: req.user?._id || null,
      action: "TOGGLE_FEATURED_PRODUCT",
      description: `Server error: ${error.message}`,
      req,
      status: "failed",
    });

    return res.status(500).json({
      success: false,
      message: "Server error while toggling featured product",
    });
  }
};

/* ------------------- GET LOW STOCK PRODUCTS ------------------- */
exports.getLowStockProducts = async (req, res) => {
  try {
    const userId = req.user?._id;

    let threshold = parseInt(req.query.threshold);

    if (isNaN(threshold) || threshold <= 0) {
      threshold = 5;
    }

    const limit = parseInt(req.query.limit) || 1000;

    const products = await Product.find({
      inventory: { $lte: threshold },
      isApproved: true,
    })
      .sort({ inventory: 1 })
      .limit(limit);

    await logActivity({
      user: userId || null,
      action: "GET_LOW_STOCK_PRODUCTS",
      description: `Fetched ${products.length} low stock products (threshold: ${threshold})`,
      req,
      status: "success",
    });

    return res.status(200).json({
      success: true,
      message:
        products.length > 0
          ? "Low stock products retrieved successfully"
          : "No low stock products found",
      count: products.length,
      threshold,
      data: products.map((product) => product.toObject()),
    });

  } catch (error) {
    console.error("❌ getLowStockProducts error:", error.message);

    await logActivity({
      user: req.user?._id || null,
      action: "GET_LOW_STOCK_PRODUCTS",
      description: `Failed to fetch low stock products: ${error.message}`,
      req,
      status: "failed",
    });

    return res.status(500).json({
      success: false,
      message: "Server error while fetching low stock products",
    });
  }
};

/* ------------------- BULK UPLOAD PRODUCTS (CSV) ------------------- */
exports.bulkUploadProducts = async (req, res) => {
  let filePath;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please upload a valid products CSV file.",
      });
    }

    filePath = req.file.path;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const rows = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => rows.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    if (!rows.length) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: "CSV file is empty. Please upload valid product data.",
      });
    }

    const requiredHeaders = [
      "title",
      "description",
      "price",
      "category",
      "subCategory",
      "tags",
      "brand",
      "attributes.color",
      "attributes.size",
      "inventory",
      "image",
    ];

    const csvHeaders = Object.keys(rows[0]);

    const missingHeaders = requiredHeaders.filter(
      (header) => !csvHeaders.includes(header)
    );

    const extraHeaders = csvHeaders.filter(
      (header) => !requiredHeaders.includes(header)
    );

    if (missingHeaders.length > 0 || extraHeaders.length > 0) {
      fs.unlinkSync(filePath);

      return res.status(400).json({
        success: false,
        message:
          "Invalid CSV format. Please upload CSV with correct product fields.",
        requiredFields: requiredHeaders,
        missingFields: missingHeaders,
        unexpectedFields: extraHeaders,
        note:
          "Field names must match exactly (case-sensitive). Example: attributes.color",
      });
    }

    const toArray = (value) => {
      if (!value) return [];
      return value.split("|").map((v) => v.trim());
    };

    const products = rows.map((product, index) => ({
      title: product.title?.trim(),
      description:
        product.description?.length >= 30
          ? product.description
          : product.description +
          " - High quality product suitable for daily use and long durability.",
      price: Number(product.price),
      category: toArray(product.category),
      subCategory: toArray(product.subCategory),
      tags: toArray(product.tags),
      brand: product.brand?.trim(),
      attributes: {
        color: product["attributes.color"]?.trim(),
        size: product["attributes.size"]?.trim(),
      },
      inventory: Number(product.inventory),
      image: product.image?.trim(),
      createdBy: userId,
      updatedBy: userId,
    }));

    const insertedDocs = await Product.insertMany(products, {
      ordered: false,
    });

    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      message: "Products bulk uploaded successfully.",
      insertedCount: insertedDocs.length,
    });

  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.error("Bulk Upload Error:", error);

    return res.status(500).json({
      success: false,
      message: "Bulk upload failed due to server error.",
      error: error.message,
    });
  }
};

/* ------------------- BULK EXPORT PRODUCTS (CSV) ------------------- */
exports.exportProducts = async (req, res) => {
  try {

    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const products = await Product.find({}).lean();

    if (!products.length) {
      return res.status(400).json({
        success: false,
        message: "No products found to export"
      });
    }

    const formatted = products.map(p => ({
      title: p.title || "",
      description: p.description || "",
      price: p.price || 0,
      category: p.category?.join("|") || "",
      subCategory: p.subCategory?.join("|") || "",
      tags: p.tags?.join("|") || "",
      brand: p.brand || "",
      "attributes.color": p.attributes?.color || "",
      "attributes.size": p.attributes?.size || "",
      inventory: p.inventory || 0,
      image: p.image || ""
    }));

    const fields = [
      "title",
      "description",
      "price",
      "category",
      "subCategory",
      "tags",
      "brand",
      "attributes.color",
      "attributes.size",
      "inventory",
      "image"
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(formatted);

    res.header("Content-Type", "text/csv");
    res.attachment("products_export.csv");
    return res.send(csv);

  } catch (error) {
    console.error("Export Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during export"
    });
  }
};

/* ------------------- MANAGE INVENTORY ------------------- */
exports.manageInventory = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user?._id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      await logActivity({
        user: userId,
        action: "MANAGE_INVENTORY",
        description: `Failed inventory update: Invalid or missing productId (${productId})`,
        req,
        status: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Invalid or missing productId",
      });
    }

    if (quantity === undefined || isNaN(quantity) || quantity <= 0) {
      await logActivity({
        user: userId,
        action: "MANAGE_INVENTORY",
        description: `Failed inventory update for product ${productId}: Invalid quantity (${quantity})`,
        req,
        status: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number and cannot be empty",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      await logActivity({
        user: userId,
        action: "MANAGE_INVENTORY",
        description: `Failed inventory update: Product not found (${productId})`,
        req,
        status: "failed",
      });

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.inventory += quantity;
    product.updatedBy = userId;
    await product.save();

    await logActivity({
      user: userId,
      action: "MANAGE_INVENTORY",
      description: `Inventory updated for product ${productId}: Added ${quantity}, New stock: ${product.inventory}`,
      req,
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: `Inventory updated successfully. New stock: ${product.inventory}`,
      data: product,
    });
  } catch (error) {
    const userId = req.user?._id;
    console.error("❌ manageInventory error:", error.message);

    await logActivity({
      user: userId,
      action: "MANAGE_INVENTORY",
      description: `Inventory update failed: ${error.message}`,
      req,
      status: "failed",
    });

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ------------------- ADD REVIEW ------------------- */
exports.addReview = async (req, res) => {
  const userId = req.user?._id;

  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      await logActivity({
        user: userId || null,
        action: "ADD_REVIEW",
        description: `Failed: Invalid productId (${productId})`,
        req,
        status: "failed",
      });
      return res.status(400).json({ success: false, message: "Invalid productId" });
    }

    if (!rating || rating < 1 || rating > 5) {
      await logActivity({
        user: userId,
        action: "ADD_REVIEW",
        description: `Failed: Invalid rating value (${rating})`,
        req,
        status: "failed",
      });
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      await logActivity({
        user: userId,
        action: "ADD_REVIEW",
        description: `Failed: Product not found (${productId})`,
        req,
        status: "failed",
      });
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (!product.isApproved) {
      await logActivity({
        user: userId,
        action: "ADD_REVIEW",
        description: `Failed: Tried to review unapproved product (${productId})`,
        req,
        status: "failed",
      });
      return res.status(403).json({ success: false, message: "Cannot review an unapproved product" });
    }

    const review = await Review.create({ product: productId, user: userId, rating, comment });

    product.reviews.push(review._id);

    const stats = await Review.aggregate([
      {
        $match: {
          product: product._id,
          isApproved: true
        }
      },
      { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    product.averageRating = stats.length > 0 ? stats[0].avgRating : 0;
    product.reviewCount = stats.length > 0 ? stats[0].count : 0;
    await product.save();

    const fullProduct = await Product.findById(productId)
      .populate({
        path: "reviews",
        match: { isApproved: true },
        populate: { path: "user", select: "name email" },
        options: { sort: { createdAt: -1 } }
      });

    await logActivity({
      user: userId,
      action: "ADD_REVIEW",
      description: `Review added successfully for product "${productId}"`,
      req,
      status: "success",
    });

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: {
        product: fullProduct,
        newReview: review,
      },
    });

  } catch (error) {
    console.error("❌ addReview error:", error.message);

    await logActivity({
      user: userId || null,
      action: "ADD_REVIEW",
      description: `Server error while adding review: ${error.message}`,
      req,
      status: "failed",
    });

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- TOGGLE REVIEW APPROVAL ------------------- */
exports.toggleReviewApproval = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const adminId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.isApproved = !review.isApproved;
    review.approvedBy = adminId;
    await review.save();

    const stats = await Review.aggregate([
      {
        $match: {
          product: review.product,
          isApproved: true
        }
      },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    await Product.findByIdAndUpdate(review.product, {
      averageRating: stats.length > 0 ? stats[0].avgRating : 0,
      reviewCount: stats.length > 0 ? stats[0].count : 0
    });

    await logActivity({
      user: adminId,
      action: "TOGGLE_REVIEW_APPROVAL",
      description: `Review approval updated: ${reviewId}`,
      req,
      status: "success",
    });

    return res.json({
      success: true,
      message: "Review approval updated successfully",
      data: review
    });

  } catch (error) {
    console.error("❌ toggleReviewApproval error:", error.message);

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- REPORT REVIEW ------------------- */
exports.reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    const alreadyReported = review.reportedBy.some(
      r => r.user.toString() === userId.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: "You already reported this review"
      });
    }

    review.reportCount += 1;
    review.isReported = true;

    review.reportedBy.push({
      user: userId,
      reason
    });

    if (review.reportCount >= 3) {
      review.isApproved = false;
    }

    await review.save();

    await logActivity({
      user: userId,
      action: "REPORT_REVIEW",
      description: `Review reported: ${reviewId}`,
      req,
      status: "success",
    });

    res.json({
      success: true,
      message: "Review reported successfully"
    });

  } catch (error) {
    console.error("❌ reportReview error:", error.message);

    await logActivity({
      user: userId,
      action: "REPORT_REVIEW",
      description: `Server error while reporting review: ${error.message}`,
      req,
      status: "failed",
    });

    res.status(500).json({
      success: false,
      message: "Server error while reporting review"
    });
  }
};

/* ------------------- UPDATE REVIEW ------------------- */
exports.updateReview = async (req, res) => {
  const userId = req.user?._id;

  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, message: "Invalid reviewId" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this review" });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    const stats = await Review.aggregate([
      {
        $match: {
          product: review.product,
          isApproved: true
        }
      },
      { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    await Product.findByIdAndUpdate(review.product, {
      averageRating: stats[0]?.avgRating || 0,
      reviewCount: stats[0]?.count || 0
    });

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review
    });

  } catch (error) {
    console.error("❌ updateReview error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- DELETE REVIEW ------------------- */
exports.deleteReview = async (req, res) => {
  const userId = req.user?._id;

  try {
    const { reviewId } = req.params;

    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, message: "Invalid reviewId" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this review" });
    }

    const productId = review.product;

    await Review.findByIdAndDelete(reviewId);

    await Product.findByIdAndUpdate(productId, {
      $pull: { reviews: reviewId }
    });

    const stats = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          isApproved: true
        }
      },
      { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    await Product.findByIdAndUpdate(productId, {
      averageRating: stats[0]?.avgRating || 0,
      reviewCount: stats[0]?.count || 0
    });

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });

  } catch (error) {
    console.error("❌ deleteReview error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};