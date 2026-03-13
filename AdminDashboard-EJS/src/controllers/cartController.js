const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const mongoose = require("mongoose");
const logActivity = require("../utils/activityLogger");

/* ------------------- ADD TO CART ------------------- */
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (quantity < 1 || quantity > 1000) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be between 1 and 1000",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.inventory < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.inventory} items available`,
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {

      const existingQuantity = cart.items[existingItemIndex].quantity;
      const newQuantity = existingQuantity + quantity;
    
      if (newQuantity > product.inventory) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.inventory} items available in stock`,
        });
      }
    
      cart.items[existingItemIndex].quantity = newQuantity;
    
    } else {
    
      if (quantity > product.inventory) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.inventory} items available in stock`,
        });
      }
    
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    
    }

    await updateCartTotals(cart);
    cart.updatedBy = userId;
    cart.abandoned = false;
    await cart.save();

    await logActivity({
      user: userId,
      action: "ADD_TO_CART",
      description: `Added ${quantity}x ${product.title} to cart`,
      req,
      status: "success",
    });

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "title price image brand inventory"
    );

    res.status(201).json({
      success: true,
      message: "Product added to cart successfully",
      data: populatedCart,
    });
  } catch (error) {
    console.error("❌ addToCart error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- GET CART ------------------- */
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === "admin";

    if (!isAdmin) {
      const cart = await Cart.findOne({ user: userId }).populate(
        "items.product",
        "title price image brand inventory category"
      );

      if (!cart) {
        return res.status(200).json({
          success: true,
          message: "Cart is empty",
          data: { items: [], totalItems: 0, totalAmount: 0 },
        });
      }

      return res.status(200).json({
        success: true,
        message: "Cart retrieved successfully",
        data: cart,
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let query = {};


    if (search) {
      query.$or = [];

      const products = await Product.find({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      if (products.length > 0) {
        query.$or.push({
          "items.product": { $in: products.map((p) => p._id) },
        });
      }

      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      if (users.length > 0) {
        query.$or.push({
          user: { $in: users.map((u) => u._id) },
        });
      }

      if (mongoose.Types.ObjectId.isValid(search)) {
        query.$or.push({
          user: new mongoose.Types.ObjectId(search),
        });
      }

      if (query.$or.length === 0) {
        query._id = null;
      }
    }

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);

      const products = await Product.find({
        price: priceFilter,
      }).select("_id");

      query["items.product"] = {
        $in: products.map((p) => p._id),
      };
    }


    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const filter = req.query.filter;
    const sortParam = req.query.sort;

    if (filter === "active") {
      query["items.0"] = { $exists: true };
    }

    if (filter === "empty") {
      query["items.0"] = { $exists: false };
    }

    if (filter === "abandoned") {
      const cutoff = new Date(Date.now() - 3 * 60 * 60 * 1000); // 24h
      query.items = { $ne: [] };
      query.updatedAt = { $lte: cutoff };
    }

    if (filter === "notabandoned") {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      query.items = { $ne: [] };
      query.updatedAt = { $gt: cutoff };
    }

    let sortOption = { updatedAt: -1 };

    if (sortParam === "asc") sortOption = { updatedAt: 1 };
    if (sortParam === "total-desc") sortOption = { totalAmount: -1 };
    if (sortParam === "total-asc") sortOption = { totalAmount: 1 };

    const carts = await Cart.find(query)
      .populate("user", "name email")
      .populate("items.product", "title price image brand inventory category")
      .populate("updatedBy", "name email")
      .sort(sortOption)
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Cart.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: `Carts retrieved successfully (${carts.length} found)`,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCarts: total,
        hasNextPage: page * limit < total,
        limit,
      },
      data: carts,
    });

  } catch (error) {
    console.error("❌ getCart error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ------------------- GET SPECIFIC CART BY ID ------------------- */
exports.getSpecificCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === "admin";

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart ID",
      });
    }

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const cart = await Cart.findById(cartId)
      .populate("user", "name email")
      .populate("items.product", "title price image brand inventory category")
      .populate("updatedBy", "name email");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (error) {
    console.error("❌ getSpecificCart error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- UPDATE CART ITEM ------------------- */
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be 0 or greater (0 to remove item)",
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    
    if (quantity > product.inventory) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.inventory} items available in stock`,
      });
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].price = product.price;
    }

    await updateCartTotals(cart);
    cart.updatedBy = userId;
    cart.abandoned = false;
    await cart.save();

    await logActivity({
      user: userId,
      action: "UPDATE_CART_ITEM",
      description: `Updated cart item ${productId} to quantity ${quantity}`,
      req,
      status: "success",
    });

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "title price image brand inventory"
    );

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: populatedCart,
    });
  } catch (error) {
    console.error("❌ updateCartItem error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- REMOVE CART ITEM ------------------- */
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    cart.items.splice(itemIndex, 1);
    await updateCartTotals(cart);
    cart.updatedBy = userId;
    cart.abandoned = false;
    await cart.save();

    await logActivity({
      user: userId,
      action: "REMOVE_FROM_CART",
      description: `Removed item ${productId} from cart`,
      req,
      status: "success",
    });

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "title price image brand inventory"
    );

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: populatedCart,
    });
  } catch (error) {
    console.error("❌ removeFromCart error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- CLEAR CART ------------------- */
exports.clearCart = async (req, res) => {
  const userId = req.user._id;

  try {
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      {
        items: [],
        totalItems: 0,
        totalAmount: 0,
        abandoned: false,
        updatedBy: userId,
        updatedAt: Date.now(),
      },
      { new: true, upsert: true } 
    );

    await logActivity({
      user: userId,
      action: "CLEAR_CART",
      description: "Cleared entire cart",
      req,
      status: "success",
    });

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "title price image brand inventory"
    );

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: populatedCart,
    });

  } catch (error) {
    console.error("❌ clearCart error:", error.message);

    await logActivity({
      user: userId,
      action: "CLEAR_CART",
      description: "Failed to clear cart",
      req,
      status: "error",
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: "Server error: Failed to clear cart"
    });
  }
};

/* ------------------- GET CART STATS ------------------- */
exports.getCartStats = async (req, res) => {
  try {
    const stats = await Cart.aggregate([
      {
        $facet: {
          totalCarts: [{ $count: "count" }],
          totalItems: [
            {
              $addFields: {
                totalItemsFlat: {
                  $sum: {
                    $map: {
                      input: "$items",
                      as: "item",
                      in: "$$item.quantity"
                    }
                  }
                }
              }
            },
            { $group: { _id: null, total: { $sum: "$totalItemsFlat" } } }
          ],
          totalValue: [
            {
              $addFields: {
                totalValueFlat: {
                  $sum: {
                    $map: {
                      input: "$items",
                      as: "item",
                      in: { $multiply: ["$$item.quantity", "$$item.price"] }
                    }
                  }
                }
              }
            },
            { $group: { _id: null, total: { $sum: "$totalValueFlat" } } }
          ]
        }
      }
    ]);

    const s = stats[0];

    res.json({
      success: true,
      message: "Cart stats retrieved successfully",
      stats: {
        totalCarts: s.totalCarts[0]?.count || 0,
        totalItems: s.totalItems[0]?.total || 0,
        totalValue: s.totalValue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("❌ getCartStats error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// HELPER
async function updateCartTotals(cart) {
  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalAmount = cart.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
}
