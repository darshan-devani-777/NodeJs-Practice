const { Op } = require("sequelize");
const { db } = require("../models/dbconfig");
const { asyncHandler } = require("../utils/asyncHandler");

const makePurchase = asyncHandler(async (req, res) => {
  const { user_id, course_id, coupon_id, original_amount } = req.body;
  try {
    let discount = 0;
    if (!user_id || !course_id) {
      return res.status(400).json({ message: "User id and Course id is required" });
    }
    const user = await db.users.findByPk(user_id);
    const course = await db.courses.findByPk(course_id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!course) {
      return res.status(400).json({ message: "Course not found" });
    }
    if (coupon_id) {
      const today = new Date();
      const coupon = await db.coupons.findOne({ where: { coupon_id, end_date: { [Op.gt]: today } } });
      if (!coupon) {
        return res.status(400).json({ message: "Coupon is either unavailable or expired" });
      } else {
        discount = coupon.discount;
      }
    }
    const purchase = await db.purchases.create({
      user_id,
      course_id,
      coupon_id,
      purchase_time: new Date(),
      purchase_amount: original_amount - discount,
      original_amount,
    });

    const purchaseDetails = await db.purchases.findOne({
      where: { purchase_id: purchase.purchase_id },
      include: [
        {
          model: db.coupons,
          attributes: ["coupon_name", "discount"],
          as: "coupon",
        },
        {
          model: db.users,
          attributes: ["first_name", "email"],
          as: "user",
        },
      ],
    });
    res.status(201).json({ message: "Purchase successfull!", success: true, data: purchaseDetails });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while making purchase.",
      success: false,
      data: [],
    });
  }
});

const purchaseHistory = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  try {
    const { user_id } = req.user;
    if (!user_id) {
      res.status(403).json({ message: "User is required", success: false, data: [] });
    }
    const user = await db.users.findByPk(user_id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const history = await db.purchases.findAndCountAll({
      where: { user_id: user_id },
      limit,
      offset,
      include: [
        {
          model: db.coupons,
          attributes: ["coupon_name", "discount"],
          as: "coupon",
        },
        {
          model: db.users,
          attributes: ["first_name", "email"],
          as: "user",
        },
      ],
    });
    res.status(200).json({
      message: "Payment history fetched successfully!",
      success: true,
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while fetching purchase history.",
      success: false,
      data: [],
    });
  }
});

module.exports = {
  makePurchase,
  purchaseHistory,
};
