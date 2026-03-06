const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit-table");

/* ---------------- USER REPORT ---------------- */
exports.userReport = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const users = await User.find()
      .select("name email createdAt")
      .sort({ createdAt: -1 });

    const monthlyStats = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalUsers: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 }
      }
    ]);

    return res.status(200).json({
      success: true,
      message: "User report retrieved successfully",
      data: {
        totalUsers,
        monthlyStats,
        users
      }
    });

  } catch (error) {
    console.error("❌ userReport error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user report"
    });
  }
};

/* ---------------- PRODUCT REPORT ---------------- */
exports.productReport = async (req, res) => {
  try {

    const totalProducts = await Product.countDocuments();

    const products = await Product.find()
      .select("title price createdAt")
      .sort({ createdAt: -1 });

    const topProducts = await Order.aggregate([
      { $unwind: "$items" },

      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" }
        }
      },

      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },

      { $unwind: "$product" },

      {
        $project: {
          _id: 0,
          productId: "$product._id",
          name: "$product.title",
          price: "$product.price",
          createdAt: "$product.createdAt",
          totalSold: 1
        }
      },

      { $sort: { totalSold: -1 } },

      { $limit: 10 }
    ]);

    return res.status(200).json({
      success: true,
      message: "Product report retrieved successfully",
      data: {
        totalProducts,
        topProducts,
        products
      }
    });

  } catch (error) {
    console.error("❌ productReport error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve product report"
    });
  }
};

/* ---------------- SALES REPORT ---------------- */
exports.salesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const match = {};

    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const sales = await Order.aggregate([
      { $match: match },

      { $unwind: "$items" },

      {
        $addFields: {
          itemSubtotal: {
            $multiply: ["$items.quantity", "$items.price"],
          },
        },
      },

      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },

      { $unwind: "$product" },

      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },

      { $unwind: "$user" },

      {
        $group: {
          _id: "$_id",

          orderDate: { $first: "$createdAt" },

          user: {
            $first: {
              name: "$user.name",
              email: "$user.email",
            },
          },

          items: {
            $push: {
              productName: "$product.title",
              quantity: "$items.quantity",
              price: "$items.price",
              subtotal: "$itemSubtotal",
            },
          },

          subTotal: { $sum: "$itemSubtotal" },

          totalAmount: { $first: "$totalAmount" },
        },
      },

      { $sort: { orderDate: -1 } },
    ]);

    const totalOrders = sales.length;

    const totalRevenue = sales.reduce((sum, order) => {
      return sum + order.totalAmount;
    }, 0);

    return res.status(200).json({
      success: true,
      message: "Sales report retrieved successfully",
      totalOrders,
      totalRevenue,
      data: sales,
    });
  } catch (error) {
    console.error("❌ salesReport error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve sales report",
    });
  }
};

/* ---------------- ORDER REPORT ---------------- */
exports.orderReport = async (req, res) => {
  try {
    const report = await Order.aggregate([
      { $unwind: "$items" },

      {
        $addFields: {
          itemSubtotal: {
            $multiply: ["$items.quantity", "$items.price"],
          },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },

      { $unwind: "$user" },

      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },

      { $unwind: "$product" },

      {
        $group: {
          _id: "$_id",

          orderDate: { $first: "$createdAt" },
          status: { $first: "$status" },

          user: {
            $first: {
              name: "$user.name",
              email: "$user.email",
            },
          },

          items: {
            $push: {
              productName: "$product.title",
              quantity: "$items.quantity",
              price: "$items.price",
              subtotal: "$itemSubtotal",
            },
          },

          subTotal: { $sum: "$itemSubtotal" },
          totalAmount: { $first: "$totalAmount" },
        },
      },

      { $sort: { orderDate: -1 } },
    ]);

    const statusSummary = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          totalOrders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalOrders = report.length;

    const totalRevenue = report.reduce((sum, order) => {
      return sum + order.totalAmount;
    }, 0);

    return res.status(200).json({
      success: true,
      message: "Order report generated successfully",

      totalOrders,
      totalRevenue,

      statusSummary,

      data: report,
    });
  } catch (error) {
    console.error("❌ orderReport error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate order report",
    });
  }
};

/* ---------------- REVENUE REPORT ---------------- */
exports.revenueReport = async (req, res) => {
  try {
    const revenueStats = await Order.aggregate([
      { $unwind: "$items" },

      {
        $addFields: {
          itemSubtotal: {
            $multiply: ["$items.quantity", "$items.price"],
          },
        },
      },

      {
        $group: {
          _id: null,

          totalOrders: { $addToSet: "$_id" },

          totalItemsSold: { $sum: "$items.quantity" },

          subTotalRevenue: { $sum: "$itemSubtotal" },

          totalRevenue: { $sum: "$totalAmount" },

          avgOrderValue: { $avg: "$totalAmount" },
        },
      },

      {
        $project: {
          _id: 0,
          totalOrders: { $size: "$totalOrders" },
          totalItemsSold: 1,
          subTotalRevenue: 1,
          totalRevenue: 1,
          avgOrderValue: { $round: ["$avgOrderValue", 2] },
        },
      },
    ]);

    const monthlyRevenue = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalOrders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    const recentOrders = await Order.find()
      .populate("user", "name email")
      .select("totalAmount status createdAt user")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      message: "Revenue report generated successfully",

      summary: revenueStats[0] || {
        totalOrders: 0,
        totalItemsSold: 0,
        subTotalRevenue: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
      },

      monthlyRevenue,

      recentOrders,
    });
  } catch (error) {
    console.error("❌ revenueReport error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate revenue analytics report",
    });
  }
};

/* ---------------- EXPORT CSV ---------------- */
exports.exportCSV = async (req, res) => {
  try {
    const { type } = req.query;
    let data = [];

    /* USERS */
    if (type === "users") {

      const totalUsers = await User.countDocuments();

      const users = await User.find()
        .select("name email createdAt")
        .sort({ createdAt: -1 })
        .lean();

      const monthlyStats = await User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            totalUsers: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.year": -1, "_id.month": -1 }
        }
      ]);

      data = [
        { type: "SUMMARY", totalUsers },

        ...users.map(u => ({
          type: "USER",
          id: u._id,
          name: u.name,
          email: u.email,
          createdAt: u.createdAt
        })),

        ...monthlyStats.map(m => ({
          type: "MONTHLY_STATS",
          year: m._id.year,
          month: m._id.month,
          totalUsers: m.totalUsers
        }))
      ];
    }

    /* PRODUCTS */
    else if (type === "products") {

      const totalProducts = await Product.countDocuments();

      const products = await Product.find()
        .select("title price createdAt")
        .sort({ createdAt: -1 })
        .lean();

      const topProducts = await Order.aggregate([
        { $unwind: "$items" },

        {
          $group: {
            _id: "$items.product",
            totalSold: { $sum: "$items.quantity" }
          }
        },

        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product"
          }
        },

        { $unwind: "$product" },

        {
          $project: {
            _id: 0,
            productId: "$product._id",
            name: "$product.title",
            price: "$product.price",
            createdAt: "$product.createdAt",
            totalSold: 1
          }
        },

        { $sort: { totalSold: -1 } },

        { $limit: 10 }
      ]);

      data = [
        { type: "SUMMARY", totalProducts },

        ...products.map(p => ({
          type: "PRODUCT",
          id: p._id,
          title: p.title,
          price: p.price,
          createdAt: p.createdAt
        })),

        ...topProducts.map(tp => ({
          type: "TOP_PRODUCT",
          productId: tp.productId,
          name: tp.name,
          price: tp.price,
          totalSold: tp.totalSold
        }))
      ];
    }

    /* SALES */
    else if (type === "sales") {

      const sales = await Order.aggregate([
        { $unwind: "$items" },

        {
          $addFields: {
            itemSubtotal: {
              $multiply: ["$items.quantity", "$items.price"]
            }
          }
        },

        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "product"
          }
        },

        { $unwind: "$product" },

        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
          }
        },

        { $unwind: "$user" },

        {
          $group: {
            _id: "$_id",

            orderDate: { $first: "$createdAt" },

            userName: { $first: "$user.name" },
            userEmail: { $first: "$user.email" },

            items: {
              $push: {
                productName: "$product.title",
                quantity: "$items.quantity",
                price: "$items.price",
                subtotal: "$itemSubtotal"
              }
            },

            subTotal: { $sum: "$itemSubtotal" },

            totalAmount: { $first: "$totalAmount" }
          }
        },

        { $sort: { orderDate: -1 } }
      ]);

      const totalOrders = sales.length;

      const totalRevenue = sales.reduce((sum, order) => {
        return sum + order.totalAmount;
      }, 0);

      data = sales.flatMap(order =>
        order.items.map(item => ({
          orderId: order._id,
          orderDate: order.orderDate,
          userName: order.userName,
          userEmail: order.userEmail,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          itemSubtotal: item.subtotal,
          orderSubTotal: order.subTotal,
          totalAmount: order.totalAmount,
          totalOrders,
          totalRevenue
        }))
      );
    }

    /* ORDERS */
    else if (type === "orders") {

      const orders = await Order.aggregate([
        { $unwind: "$items" },

        {
          $addFields: {
            itemSubtotal: {
              $multiply: ["$items.quantity", "$items.price"]
            }
          }
        },

        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },

        {
          $group: {
            _id: "$_id",
            orderDate: { $first: "$createdAt" },
            status: { $first: "$status" },
            userName: { $first: "$user.name" },
            userEmail: { $first: "$user.email" },
            subTotal: { $sum: "$itemSubtotal" },
            totalAmount: { $first: "$totalAmount" }
          }
        },

        { $sort: { orderDate: -1 } }
      ]);

      const totalOrders = orders.length;

      const totalRevenue = orders.reduce((sum, order) => {
        return sum + order.totalAmount;
      }, 0);

      data = orders.map(order => ({
        orderId: order._id,
        orderDate: order.orderDate,
        userName: order.userName,
        userEmail: order.userEmail,
        status: order.status,
        subTotal: order.subTotal,
        totalAmount: order.totalAmount,
        totalOrders,
        totalRevenue
      }));
    }

    /* REVENUE */
    else if (type === "revenue") {

      const revenueStats = await Order.aggregate([
        { $unwind: "$items" },
        {
          $addFields: {
            itemSubtotal: {
              $multiply: ["$items.quantity", "$items.price"]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $addToSet: "$_id" },
            totalItemsSold: { $sum: "$items.quantity" },
            subTotalRevenue: { $sum: "$itemSubtotal" },
            totalRevenue: { $sum: "$totalAmount" },
            avgOrderValue: { $avg: "$totalAmount" }
          }
        },
        {
          $project: {
            _id: 0,
            totalOrders: { $size: "$totalOrders" },
            totalItemsSold: 1,
            subTotalRevenue: 1,
            totalRevenue: 1,
            avgOrderValue: { $round: ["$avgOrderValue", 2] }
          }
        }
      ]);

      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("totalAmount status createdAt")
        .lean();

      const monthlyRevenue = await Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            totalOrders: { $sum: 1 },
            revenue: { $sum: "$totalAmount" }
          }
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } }
      ]);

      data = [
        ...revenueStats.map(r => ({
          type: "SUMMARY",
          totalOrders: r.totalOrders,
          totalItemsSold: r.totalItemsSold,
          subTotalRevenue: r.subTotalRevenue,
          totalRevenue: r.totalRevenue,
          avgOrderValue: r.avgOrderValue
        })),

        ...monthlyRevenue.map(m => ({
          type: "MONTHLY",
          year: m._id.year,
          month: m._id.month,
          totalOrders: m.totalOrders,
          revenue: m.revenue
        })),

        ...recentOrders.map(o => ({
          type: "RECENT_ORDER",
          orderDate: o.createdAt,
          status: o.status,
          totalAmount: o.totalAmount
        }))
      ];
    }

    if (!data.length) {
      return res.status(404).json({
        success: false,
        message: `No ${type} data available to export`,
      });
    }

    const parser = new Parser({
      flatten: true
    });
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment(`${type}-report.csv`);

    return res.status(200).send(csv);

  } catch (error) {
    console.error("❌ exportCSV error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to export CSV report",
    });
  }
};

/* ---------------- EXPORT PDF ---------------- */
exports.exportPDF = async (req, res) => {
  let pdfStarted = false;
  try {
    const { type } = req.query;

    let tables = [];

    // USERS -> 2 TABLES (Users List + Summary/Monthly)
    if (type === "users") {
      const totalUsers = await User.countDocuments();

      const users = await User.find()
        .select("name email createdAt")
        .sort({ createdAt: -1 })
        .lean();

      const monthlyStats = await User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            totalUsers: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
      ]);

      // Table 1: Users list
      const usersTable = {
        title: "Users Report - Users",
        headers: [
          { label: "User ID", property: "userId", width: 110 },
          { label: "Name", property: "name", width: 140 },
          { label: "Email", property: "email", width: 170 },
          { label: "Created At", property: "createdAt", width: 120 },
        ],
        datas: [],
      };

      users.forEach((u) => {
        usersTable.datas.push({
          userId: String(u._id),
          name: u.name,
          email: u.email,
          createdAt: new Date(u.createdAt).toLocaleString(),
        });
      });

      // Table 2: Summary + Monthly stats
      const userStatsTable = {
        title: "Users Report - Summary",
        headers: [
          { label: "Type", property: "type", width: 80 },
          { label: "Period", property: "period", width: 130 },
          { label: "Total Users", property: "totalUsers", width: 90 },
        ],
        datas: [],
      };

      userStatsTable.datas.push({
        type: "SUMMARY",
        period: "-",
        totalUsers,
      });

      monthlyStats.forEach((m) => {
        const year = m._id.year;
        const month = m._id.month;
        userStatsTable.datas.push({
          type: "MONTHLY",
          period: `${year}-${String(month).padStart(2, "0")}`,
          totalUsers: m.totalUsers,
        });
      });

      tables.push(usersTable);
      tables.push(userStatsTable);
    }

    // PRODUCTS -> 2 TABLES (All Products + Summary/Top)
    else if (type === "products") {
      const totalProducts = await Product.countDocuments();

      const products = await Product.find()
        .select("title price createdAt")
        .sort({ createdAt: -1 })
        .lean();

      const topProducts = await Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            totalSold: { $sum: "$items.quantity" },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            productId: "$product._id",
            name: "$product.title",
            price: "$product.price",
            createdAt: "$product.createdAt",
            totalSold: 1,
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ]);

      // Table 1: All products
      const productsTable = {
        title: "Products Report - All Products",
        headers: [
          { label: "Product ID", property: "productId", width: 110 },
          { label: "Name", property: "name", width: 180 },
          { label: "Price", property: "price", width: 60 },
          { label: "Created At", property: "createdAt", width: 120 },
        ],
        datas: [],
      };

      products.forEach((p) => {
        productsTable.datas.push({
          productId: String(p._id),
          name: p.title,
          price: p.price,
          createdAt: new Date(p.createdAt).toLocaleString(),
        });
      });

      // Table 2: Summary + Top products
      const productStatsTable = {
        title: "Products Report - Summary & Top Products",
        headers: [
          { label: "Type", property: "type", width: 80 },
          { label: "Product / Info", property: "name", width: 190 },
          { label: "Price", property: "price", width: 60 },
          { label: "Total Sold", property: "totalSold", width: 70 },
        ],
        datas: [],
      };

      productStatsTable.datas.push({
        type: "SUMMARY",
        name: `Total Products: ${totalProducts}`,
        price: "-",
        totalSold: "-",
      });

      topProducts.forEach((tp) => {
        productStatsTable.datas.push({
          type: "TOP_PRODUCT",
          name: tp.name,
          price: tp.price,
          totalSold: tp.totalSold,
        });
      });

      tables.push(productsTable);
      tables.push(productStatsTable);
    }

    // SALES -> 2 TABLES (Line Items + Order Summary) 
    else if (type === "sales") {
      const sales = await Order.aggregate([
        { $unwind: "$items" },
        {
          $addFields: {
            itemSubtotal: {
              $multiply: ["$items.quantity", "$items.price"],
            },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$_id",
            orderDate: { $first: "$createdAt" },
            userName: { $first: "$user.name" },
            userEmail: { $first: "$user.email" },
            items: {
              $push: {
                productName: "$product.title",
                quantity: "$items.quantity",
                price: "$items.price",
                subtotal: "$itemSubtotal",
              },
            },
            subTotal: { $sum: "$itemSubtotal" },
            totalAmount: { $first: "$totalAmount" },
          },
        },
        { $sort: { orderDate: -1 } },
      ]);

      const totalOrders = sales.length;
      const totalRevenue = sales.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );

      // Table 1: Line items
      const salesDetailTable = {
        title: "Sales Report - Line Items",
        headers: [
          { label: "Order ID", property: "orderId", width: 80 },
          { label: "Order Date", property: "orderDate", width: 90 },
          { label: "Customer", property: "customer", width: 130 },
          { label: "Product", property: "productName", width: 90 },
          { label: "Qty", property: "quantity", width: 50 },
          { label: "Price", property: "price", width: 50 },
          {
            label: "Item Subtotal",
            property: "itemSubtotal",
            width: 55,
          },
        ],
        datas: [],
      };

      // Table 2: Orders summary 
      const salesSummaryTable = {
        title: "Sales Report - Orders Summary",
        headers: [
          { label: "Order ID", property: "orderId", width: 90 },
          { label: "Order Date", property: "orderDate", width: 90 },
          { label: "Customer", property: "customer", width: 130 },
          { label: "Order Subtotal", property: "orderSubTotal", width: 60 },
          { label: "Order Total", property: "totalAmount", width: 60 },
          { label: "Total Orders", property: "totalOrders", width: 50 },
          { label: "Total Revenue", property: "totalRevenue", width: 60 },
        ],
        datas: [],
      };

      sales.forEach((order) => {
        order.items.forEach((item) => {
          salesDetailTable.datas.push({
            orderId: String(order._id),
            orderDate: new Date(order.orderDate).toLocaleString(),
            customer: `${order.userName} (${order.userEmail})`,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            itemSubtotal: item.subtotal,
          });
        });

        salesSummaryTable.datas.push({
          orderId: String(order._id),
          orderDate: new Date(order.orderDate).toLocaleString(),
          customer: `${order.userName} (${order.userEmail})`,
          orderSubTotal: order.subTotal,
          totalAmount: order.totalAmount,
          totalOrders,
          totalRevenue,
        });
      });

      tables.push(salesDetailTable);
      tables.push(salesSummaryTable);
    }

    // ORDERS -> 2 TABLES (Orders List + Overall Summary) 
    else if (type === "orders") {
      const orders = await Order.aggregate([
        { $unwind: "$items" },
        {
          $addFields: {
            itemSubtotal: {
              $multiply: ["$items.quantity", "$items.price"],
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$_id",
            orderDate: { $first: "$createdAt" },
            status: { $first: "$status" },
            userName: { $first: "$user.name" },
            userEmail: { $first: "$user.email" },
            subTotal: { $sum: "$itemSubtotal" },
            totalAmount: { $first: "$totalAmount" },
          },
        },
        { $sort: { orderDate: -1 } },
      ]);

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );

      // Table 1: Orders list
      const ordersTable = {
        title: "Orders Report - Orders",
        headers: [
          { label: "Order ID", property: "orderId", width: 100 },
          { label: "Order Date", property: "orderDate", width: 100 },
          { label: "Customer", property: "customer", width: 150 },
          { label: "Status", property: "status", width: 60 },
          { label: "Sub Total", property: "subTotal", width: 70 },
          { label: "Total Amount", property: "totalAmount", width: 70 },
        ],
        datas: [],
      };

      orders.forEach((o) => {
        ordersTable.datas.push({
          orderId: String(o._id),
          orderDate: new Date(o.orderDate).toLocaleString(),
          customer: `${o.userName} (${o.userEmail})`,
          status: o.status,
          subTotal: o.subTotal,
          totalAmount: o.totalAmount,
        });
      });

      // Table 2: Overall summary 
      const ordersSummaryTable = {
        title: "Orders Report - Summary",
        headers: [
          { label: "Total Orders", property: "totalOrders", width: 80 },
          { label: "Total Revenue", property: "totalRevenue", width: 100 },
        ],
        datas: [],
      };

      ordersSummaryTable.datas.push({
        totalOrders,
        totalRevenue,
      });

      tables.push(ordersTable);
      tables.push(ordersSummaryTable);
    }

    // REVENUE -> 2 TABLES (Summary + Monthly/Recent)
    else if (type === "revenue") {
      const revenueStats = await Order.aggregate([
        { $unwind: "$items" },
        {
          $addFields: {
            itemSubtotal: {
              $multiply: ["$items.quantity", "$items.price"],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $addToSet: "$_id" },
            totalItemsSold: { $sum: "$items.quantity" },
            subTotalRevenue: { $sum: "$itemSubtotal" },
            totalRevenue: { $sum: "$totalAmount" },
            avgOrderValue: { $avg: "$totalAmount" },
          },
        },
        {
          $project: {
            _id: 0,
            totalOrders: { $size: "$totalOrders" },
            totalItemsSold: 1,
            subTotalRevenue: 1,
            totalRevenue: 1,
            avgOrderValue: { $round: ["$avgOrderValue", 2] },
          },
        },
      ]);

      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("totalAmount status createdAt")
        .lean();

      const monthlyRevenue = await Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            totalOrders: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
      ]);

      // Table 1: Overall summary
      const summaryTable = {
        title: "Revenue Report - Summary",
        headers: [
          { label: "Total Orders", property: "totalOrders", width: 80 },
          {
            label: "Total Items Sold",
            property: "totalItemsSold",
            width: 90,
          },
          {
            label: "SubTotal Revenue",
            property: "subTotalRevenue",
            width: 90,
          },
          { label: "Total Revenue", property: "totalRevenue", width: 90 },
          {
            label: "Avg Order Value",
            property: "avgOrderValue",
            width: 90,
          },
        ],
        datas: [],
      };

      if (revenueStats[0]) {
        const r = revenueStats[0];
        summaryTable.datas.push({
          totalOrders: r.totalOrders,
          totalItemsSold: r.totalItemsSold,
          subTotalRevenue: r.subTotalRevenue,
          totalRevenue: r.totalRevenue,
          avgOrderValue: r.avgOrderValue,
        });
      }

      // Table 2: Monthly + Recent
      const monthlyTable = {
        title: "Revenue Report - Monthly & Recent",
        headers: [
          { label: "Type", property: "type", width: 80 },
          { label: "Period / Date", property: "periodOrDate", width: 140 },
          { label: "Total Orders", property: "totalOrders", width: 80 },
          { label: "Revenue", property: "totalRevenue", width: 90 },
          { label: "Status", property: "status", width: 70 },
        ],
        datas: [],
      };

      monthlyRevenue.forEach((m) => {
        monthlyTable.datas.push({
          type: "MONTHLY",
          periodOrDate: `${m._id.year}-${String(m._id.month).padStart(
            2,
            "0"
          )}`,
          totalOrders: m.totalOrders,
          totalRevenue: m.revenue,
          status: "-",
        });
      });

      recentOrders.forEach((o) => {
        monthlyTable.datas.push({
          type: "RECENT_ORDER",
          periodOrDate: new Date(o.createdAt).toLocaleString(),
          totalOrders: "-",
          totalRevenue: o.totalAmount,
          status: o.status,
        });
      });

      tables.push(summaryTable);
      tables.push(monthlyTable);
    }

    if (!tables.length || !tables.some((t) => t.datas.length)) {
      return res.status(404).json({
        success: false,
        message: `No ${type} data available`,
      });
    }

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    pdfStarted = true;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${type}-report.pdf`
    );

    doc.pipe(res);

    const contentWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;

    for (let i = 0; i < tables.length; i++) {
      const t = tables[i];
      if (!t.datas.length) continue;

      if (i > 0) {
        doc.moveDown(2);
      }

      await doc.table(
        {
          title: t.title,
          headers: t.headers,
          datas: t.datas,
        },
        {
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
          prepareRow: () => doc.font("Helvetica").fontSize(8),
          padding: 2,
          columnSpacing: 2,
          width: contentWidth * 0.9,
        }
      );
    }

    doc.end();

  } catch (error) {
    console.error("❌ exportPDF error:", error.message);

    if (!res.headersSent && !pdfStarted) {
      return res.status(500).json({
        success: false,
        message: "Failed to export PDF report",
      });
    }
  }
};