const Refund = require("../models/Refund");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const mongoose = require("mongoose");
const logActivity = require("../utils/activityLogger");
const generateInvoicePDF = require("../utils/invoiceGenerator");

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000);
  return `ORD${date}${random}`;
}

function generateTrackingNumber() {
  const courierPrefixes = ['DTDC', 'BlueDart', 'FedEx', 'Delhivery', 'Ecom'];
  const prefix = courierPrefixes[Math.floor(Math.random() * courierPrefixes.length)];
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${prefix}${date}${random}`;
}

function generateInvoiceNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV${date}${random}`;
}

/* ------------------- CREATE ORDER ------------------- */
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('name');
    const { shippingAddress, paymentMethod, notes } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Shipping address and payment method are required",
      });
    }

    const finalShippingAddress = {
      ...shippingAddress,
      fullName: shippingAddress.fullName || user.name || 'Customer'
    };

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    for (const item of cart.items) {
      const product = item.product;
      if (product.inventory < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}. Only ${product.inventory} available`,
        });
      }
    }

    const orderData = {
      user: userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
      shippingAddress: finalShippingAddress,
      paymentMethod,
      notes,
      orderNumber: generateOrderNumber(),
    };

    const order = await Order.create(orderData);

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { inventory: -item.quantity },
      });
    }

    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], totalItems: 0, totalAmount: 0 }
    );

    await logActivity({
      user: userId,
      action: "CREATE_ORDER",
      description: `Created order ${order.orderNumber}`,
      req,
      status: "success",
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("items.product", "title price image brand")
      .populate("user", "name email");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: populatedOrder,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("❌ createOrder error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- GET USER ORDERS ------------------- */
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const status = req.query.status;
    const paymentStatus = req.query.paymentStatus;
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    const minAmount = req.query.minAmount;
    const maxAmount = req.query.maxAmount;
    const search = req.query.search || "";

    let query = { user: userId };

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } }
      ];
    }

    if (status) query.status = status;

    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
    }

    if (minAmount || maxAmount) {
      query.totalAmount = {};
      if (minAmount) query.totalAmount.$gte = Number(minAmount);
      if (maxAmount) query.totalAmount.$lte = Number(maxAmount);
    }

    const orders = await Order.find(query)
      .populate("items.product", "title price image brand")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNextPage: page * limit < total,
        limit,
      },
      data: orders,
    });
  } catch (error) {
    console.error("❌ getUserOrders error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- GET SINGLE ORDER ------------------- */
exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const query = req.user.role === "admin"
      ? { _id: orderId }
      : { _id: orderId, user: userId };

    const order = await Order.findOne(query)
      .populate("items.product", "title price image brand inventory");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    console.error("❌ getOrder error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- GET ALL ORDERS ------------------- */
exports.getAllOrders = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const search = req.query.search || "";
    const status = req.query.status;
    const paymentStatus = req.query.paymentStatus;
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    const minAmount = req.query.minAmount;
    const maxAmount = req.query.maxAmount;
    const paymentMethod = req.query.paymentMethod;
    const city = req.query.city;
    const state = req.query.state;

    let userIds = [];

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      }).select("_id");

      userIds = users.map(u => u._id);
    }

    let query = {};

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
        { "shippingAddress.phone": { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
        { user: { $in: userIds } }
      ];
    }

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (paymentMethod) query.paymentMethod = paymentMethod;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
    }

    if (minAmount || maxAmount) {
      query.totalAmount = {};
      if (minAmount) query.totalAmount.$gte = Number(minAmount);
      if (maxAmount) query.totalAmount.$lte = Number(maxAmount);
    }

    if (city) query["shippingAddress.city"] = { $regex: city, $options: "i" };
    if (state) query["shippingAddress.state"] = { $regex: state, $options: "i" };

    let sortOption = { createdAt: -1 };

    if (req.query.sort === "asc") {
      sortOption = { createdAt: 1 };
    } else if (req.query.sort === "total-desc") {
      sortOption = { totalAmount: -1 };
    } else if (req.query.sort === "total-asc") {
      sortOption = { totalAmount: 1 };
    }

    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("items.product", "title price image brand")
      .sort(sortOption)
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      message: `Orders retrieved successfully (${orders.length} found)`,
      filtersApplied: req.query,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNextPage: page * limit < total,
        limit,
      },
      data: orders,
    });
  } catch (error) {
    console.error("❌ getAllOrders error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- UPDATE ORDER STATUS ------------------- */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus, trackingNumber } = req.body;
    const userId = req.user._id;

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const currentOrder = await Order.findById(orderId);

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const updateData = { updatedAt: Date.now() };

    if (status) {
      const newStatus = status.toLowerCase();

      updateData.status = newStatus;

      if (newStatus === "shipped" && currentOrder.status !== "shipped") {
        updateData.trackingNumber =
          trackingNumber && trackingNumber.trim() !== ""
            ? trackingNumber.trim()
            : generateTrackingNumber();

        updateData.shippedAt = new Date();
      }

      if (newStatus === "delivered") {
        updateData.deliveredAt = new Date();
      }

      if (newStatus === "cancelled") {
        updateData.trackingNumber = null;
        updateData.cancelledAt = new Date();
      }
    }

    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus;

      if (
        paymentStatus === "paid" &&
        !currentOrder.invoiceNumber
      ) {
        updateData.invoiceNumber = generateInvoiceNumber();
        updateData.invoiceDate = new Date();
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    ).populate("items.product", "title price image brand");

    await logActivity({
      user: userId,
      action: "UPDATE_ORDER_STATUS",
      description: `Updated order ${updatedOrder.orderNumber} - Status: ${updatedOrder.status}`,
      req,
      status: "success",
    });

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      trackingNumber: updatedOrder.trackingNumber,
      invoiceNumber: updatedOrder.invoiceNumber,
      data: updatedOrder,
    });

  } catch (error) {
    console.error("❌ updateOrderStatus ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

/* ------------------- CANCEL ORDER ------------------- */
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled",
      });
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { inventory: item.quantity },
      });
    }

    order.status = "cancelled";
    await order.save();

    await logActivity({
      user: userId,
      action: "CANCEL_ORDER",
      description: `Cancelled order ${order.orderNumber}`,
      req,
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("❌ cancelOrder error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- GET ORDER STATS ------------------- */
exports.getOrderStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] },
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "shipped"] }, 1, 0] },
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      message: "Order stats retrieved successfully",
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
      },
    });
  } catch (error) {
    console.error("❌ getOrderStats error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- REQUEST REFUND ------------------- */
exports.requestRefund = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot request refund for cancelled order",
      });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Refund allowed only for delivered orders",
      });
    }

    if (order.refundStatus !== "none") {
      return res.status(400).json({
        success: false,
        message: "Refund already requested",
      });
    }

    const refund = await Refund.create({
      order: order._id,
      user: userId,
      amount: order.totalAmount,
      reason,
    });

    order.refundStatus = "requested";
    await order.save();

    await logActivity({
      user: userId,
      action: "REQUEST_REFUND",
      description: `Requested refund for order ${order.orderNumber}`,
      req,
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: "Refund request submitted successfully",
      data: refund,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ------------------- UPDATE REFUND STATUS ------------------- */
exports.updateRefundStatus = async (req, res) => {
  try {
    const { refundId } = req.params;
    const { status, transactionId } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const allowedStatuses = ["requested", "approved", "rejected", "processed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund status",
      });
    }

    const refund = await Refund.findById(refundId).populate("order");

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    refund.status = status;

    if (status === "approved") {
      refund.order.refundStatus = "approved";
    }

    if (status === "processed") {
      refund.order.refundStatus = "processed";
      refund.order.paymentStatus = "refunded";
      refund.order.status = "cancelled";
      refund.transactionId = transactionId;

      await refund.order.populate("items.product");

      for (const item of refund.order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { inventory: item.quantity },
        });
      }
    }

    await refund.order.save();
    await refund.save();

    await logActivity({
      user: req.user._id,
      action: "UPDATE_REFUND_STATUS",
      description: `Updated refund ${refund._id} to ${status}`,
      req,
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: "Refund status updated successfully",
      data: refund,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ------------------- GET ALL REFUNDS ------------------- */
exports.getAllRefunds = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { search, status, dateFrom, dateTo } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo + "T23:59:59.999Z");
    }

    let searchQuery = {};

    if (search) {
      searchQuery = {
        $or: [
          { reason: { $regex: search, $options: "i" } },
        ],
      };
    }

    const refunds = await require("../models/Refund")
      .find({ ...query, ...searchQuery })
      .populate("order", "orderNumber totalAmount status paymentStatus")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await require("../models/Refund").countDocuments({
      ...query,
      ...searchQuery,
    });

    res.status(200).json({
      success: true,
      message: "Refunds retrieved successfully",
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRefunds: total,
      },
      data: refunds,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ------------------- GET USER REFUNDS ------------------- */
exports.getUserRefunds = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { search, status, dateFrom, dateTo } = req.query;

    let query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo + "T23:59:59.999Z");
    }

    if (search) {
      query.$or = [
        { reason: { $regex: search, $options: "i" } },
      ];
    }

    const refunds = await require("../models/Refund")
      .find(query)
      .populate("order", "orderNumber totalAmount status")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await require("../models/Refund").countDocuments(query);

    res.status(200).json({
      success: true,
      message: "User refunds retrieved successfully",
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRefunds: total,
      },
      data: refunds,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ------------------- DOWNLOAD INVOICE ------------------- */
exports.downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    const query = req.user.role === "admin"
      ? { _id: orderId }
      : { _id: orderId, user: req.user._id };

    const order = await Order.findOne(query)
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.invoiceNumber) {
      order.invoiceNumber = generateInvoiceNumber();
      order.invoiceDate = new Date();
      await order.save();
    }

    generateInvoicePDF(order, res);

  } catch (error) {
    console.error("Invoice error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate invoice",
    });
  }
};