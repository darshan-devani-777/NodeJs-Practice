const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const { StatusCodes } = require("http-status-codes");

// ADD PRODUCT TO CART ( Access all carts )
exports.addProductToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.json({
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.json({
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({
      user: userId,
      "products.product": productId,
    });

    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId
      );

      const currentQuantity = cart.products[productIndex].quantity;
      const totalRequestedQuantity = currentQuantity + quantity;

      if (totalRequestedQuantity > product.quantity + currentQuantity) {
        return res.json({
          statusCode: StatusCodes.BAD_REQUEST,
          success: false,
          message: `Cannot add ${quantity} items. Only ${
            product.quantity - currentQuantity
          } left in stock.`,
        });
      }

      cart.products[productIndex].quantity = totalRequestedQuantity;
      await cart.save();
    } else {
      if (quantity > product.quantity) {
        return res.json({
          statusCode: StatusCodes.BAD_REQUEST,
          success: false,
          message: `Cannot add ${quantity} items. Only ${product.quantity} left in stock.`,
        });
      }

      cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, products: [] });
      }

      cart.products.push({ product: productId, quantity });
      await cart.save();
    }

    // Subtract quantity from product stock
    product.quantity -= quantity;
    await product.save();

    const addedProductEntry = cart.products.find(
      (p) => p.product.toString() === productId
    );
    const populatedProduct = await Product.findById(productId).select(
      "name price description"
    );

    const addedProduct = {
      quantity: addedProductEntry.quantity,
      product: populatedProduct,
    };

    res.json({
      statusCode: StatusCodes.OK,
      success: true,
      message: "Product Added to cart",
      cart,
      addedProduct,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Internal Server Error",
    });
  }
};

// GET USER SPECIFIC CART ( Access All by Own cart )
exports.getUserCart = async (req, res) => {
  try {
    const requester = req.user;
    let userIdToFetch;

    console.log("Requester:", requester);
    console.log("Request Params:", req.params);

    if (requester.role === "superadmin") {
      userIdToFetch = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(userIdToFetch)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Invalid user ID format",
        });
      }
    } else {
      userIdToFetch = requester._id.toString();

      if (req.params.id && req.params.id !== userIdToFetch) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "You are not authorized to access this cart",
        });
      }
    }

    const cart = await Cart.findOne({ user: userIdToFetch })
      .populate("products.product", "name price description")
      .populate("user", "name email");

    if (!cart) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Cart is empty",
        cart: null,
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Cart fetched successfully",
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE CARTS (Access All by Own carts )
exports.updateProductQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.json({
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.json({
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "Cart not found",
      });
    }

    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === productId
    );
    if (productIndex === -1) {
      return res.json({
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "Product not found in cart",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.json({
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "Product not found",
      });
    }

    const currentQuantityInCart = cart.products[productIndex].quantity;
    const quantityDifference = quantity - currentQuantityInCart;

    // If increasing quantity, check stock
    if (quantityDifference > 0) {
      if (quantityDifference > product.quantity) {
        return res.json({
          statusCode: StatusCodes.BAD_REQUEST,
          success: false,
          message: `Only ${product.quantity} items available in stock.`,
        });
      }

      product.quantity -= quantityDifference;
    } else if (quantityDifference < 0) {
      product.quantity += Math.abs(quantityDifference);
    }
    await product.save();

    // Update cart quantity
    cart.products[productIndex].quantity = quantity;
    await cart.save();

    res.json({
      statusCode: StatusCodes.OK,
      success: true,
      message: "Cart and product stock updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Update quantity error:", error);
    res.json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Internal Server Error",
    });
  }
};

// REMOVE PRODUCT FROM CART ( Access own carts)
exports.removeProductFromCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate(
      "products.product",
      "name price description quantity"
    );

    if (!cart) {
      return res.json({
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "Cart not found or already deleted.",
      });
    }

    for (const item of cart.products) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }
    }

    // Step 2: Delete the cart
    await Cart.deleteOne({ _id: cart._id });

    res.json({
      statusCode: StatusCodes.OK,
      success: true,
      message: "Cart removed successfully and product stock restored.",
      deletedCart: cart,
    });
  } catch (error) {
    console.error("Remove cart error:", error);
    res.json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Internal Server Error",
    });
  }
};

// GET ALL CARTS ( superadmin / admin / user )
exports.getAllCarts = async (req, res) => {
  try {
    const requester = req.user;

    let filter = {};

    if (requester.role === "superadmin") {
      // Superadmin sees all
      filter = {};
    } else if (requester.role === "admin") {
      // Admin sees users + self
      const users = await User.find({ role: "user" }).select("_id");
      const userIds = users.map((u) => u._id);
      userIds.push(requester._id);
      filter.user = { $in: userIds };
    } else if (requester.role === "user") {
      // User sees own cart
      filter.user = requester._id;
    } else {
      return res.json({
        statusCode: StatusCodes.UNAUTHORIZED,
        success: false,
        message: "Unauthorized access",
      });
    }

    // Fetch carts and populate required fields
    const carts = await Cart.find(filter)
      .populate("user", "_id name email role") //
      .populate("products.product", "name price");

    res.json({
      statusCode: StatusCodes.OK,
      success: true,
      message: "Carts Fetched Successfully.",
      carts,
    });
  } catch (error) {
    console.error("Get all carts error:", error);
    res.json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Internal Server Error",
    });
  }
};
