const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");

// CREATE ORDER - ONLY USER
exports.createOrder = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Only users can place an order.",
      });
    }

    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user || !user.address || !user.address.street || !user.address.city) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "User address is missing or incomplete.",
      });
    }

    const address = user.address;

    const cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );

    if (!cart || cart.products.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Cart is empty. Please add items before placing an order.",
      });
    }

    let totalAmount = 0;
    const orderProducts = cart.products.map((item) => {
      const price = item.product.price;
      const quantity = item.quantity;
      totalAmount += price * quantity;

      return {
        product: item.product._id,
        quantity,
      };
    });

    const newOrder = new Order({
      user: userId,
      products: orderProducts,
      contact: user.contact,
      totalAmount,
      address,
    });

    console.log("New Order:", newOrder);

    const savedOrder = await newOrder.save();

    await Cart.findOneAndDelete({ user: userId });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Order Placed Successfully... Cart has been cleared.",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server Error. Please try again later.",
    });
  }
};

// GET ALL ORDER (admin, superadmin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product", "name price image description categories");
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Order Retrieved Successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server Error" });
  }
};

// GET SPECIFIC ORDER (own order)
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id })
      .populate("user", "name email")
      .populate("products.product", "name price image description categories");
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Order Retrieved Successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Get User Orders Error:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server Error" });
  }
};

// UPDATE ORDER (user only)
exports.updateOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: "Order not found" });
    }

    const isAdminOrSuperAdmin =
      req.user.role === "admin" || req.user.role === "superadmin";
    const isOwner = order.user.toString() === req.user.id;

    // If not owner and not admin/superadmin -> reject
    if (!isAdminOrSuperAdmin && !isOwner) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "You are not allowed to update this order",
      });
    }

    const { products, address, contact } = req.body;

    let newTotalAmount = 0;

    if (isOwner || isAdminOrSuperAdmin) {
      if (products) {
        const mongoose = require("mongoose");

        for (const updatedProduct of products) {
          console.log("Product from request:", updatedProduct._id);

          const existingProduct = order.products.find(
            (product) =>
              product.product.toString() ===
              new mongoose.Types.ObjectId(updatedProduct._id).toString()
          );

          if (existingProduct) {
            console.log(
              `Found product: ${existingProduct.product} with quantity: ${existingProduct.quantity}`
            );
            console.log(
              `Updating quantity for product ${existingProduct.product} to ${updatedProduct.quantity}`
            );

            // Update the quantity
            existingProduct.quantity = updatedProduct.quantity;

            const product = await Product.findById(updatedProduct._id);

            if (product && product.price && !isNaN(product.price)) {
              // Recalculate totalAmount
              newTotalAmount += updatedProduct.quantity * product.price;
            } else {
              console.error(
                `Price not found or invalid for product ${updatedProduct._id}`
              );
            }
          } else {
            console.log(`Product ${updatedProduct._id} not found in order.`);
          }
        }
      }

      // Ensure totalAmount is updated with the new total or preserved if unchanged
      order.totalAmount = newTotalAmount || order.totalAmount;
      order.address = address || order.address;
      order.contact = contact || order.contact;
    }

    const updatedOrder = await order.save();

    console.log("Updated order:", updatedOrder);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Order Updated Successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Update Order Details Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server Error",
    });
  }
};

// UPDATE ORDER STATUS (SuperAdmin / Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: "Order not found" });
    }

    const isAdminOrSuperAdmin =
      req.user.role === "admin" || req.user.role === "superadmin";

    // Only admins or superadmins can update payment or delivery status
    if (!isAdminOrSuperAdmin) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "You are not authorized to update payment or delivery status",
      });
    }

    const { paymentStatus, deliveryStatus } = req.body;

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (deliveryStatus) order.deliveryStatus = deliveryStatus;

    const updatedOrder = await order.save();

    console.log("Updated order status:", updatedOrder);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server Error",
    });
  }
};

// DELETE ORDER (user only)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ success: false, message: "Not allowed to delete this order" });
    }

    await order.deleteOne();
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Order Deleted Successfully",
      deletedOrder: order,
    });
  } catch (error) {
    console.error("Delete Order Error:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server Error" });
  }
};
