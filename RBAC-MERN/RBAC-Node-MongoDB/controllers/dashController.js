const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const { StatusCodes } = require("http-status-codes");

exports.getDashboardData = async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error, please try again later.',
    });
  }
};
