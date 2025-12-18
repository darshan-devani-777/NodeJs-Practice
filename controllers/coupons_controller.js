const { db } = require("../models/dbconfig");
const { Op } = require("sequelize");
const { asyncHandler } = require("../utils/asyncHandler");

const getCoupons = asyncHandler(async (req, res) => {
  try {
    let sort_column_index,
    sort_column,
    sort_order,
    condition = {},
    search = '';

    if (req.query.order) {
      sort_column_index = req.query.order[0]["column"];
      sort_column = req.query.columns[sort_column_index]["data"];
      sort_order = req.query.order[0]["dir"] || 'desc';
    } else {
      sort_column = "coupon_id";
      sort_order = "desc";
    }

    search = req.query?.search["value"] ? `%${req.query?.search["value"]}%` : '';
    if (search != "") {
      condition = {
        [Op.or]: [
          { coupon_name: { [Op.like]: search } },
          { discount: { [Op.like]: search } },
          { end_date: { [Op.like]: search } },
        ],
      };
    }

    let data = await db.coupons.findAndCountAll({
      where: condition,
      order: [[sort_column, sort_order]],
      limit: Number(req?.query?.length) || 10,
      offset: Number(req?.query?.start) || 0,
    });
    if (data && data.rows.length && data.count) {
      data = JSON.parse(JSON.stringify(data));
      return res.status(200).json({
        success: true,
        draw: req?.query?.draw || 10,
        recordsTotal: data.count,
        recordsFiltered: data.count,
        data: data.rows,
      });
    } else {
      return res.status(200).json({
        success: true,
        draw: req?.query?.draw || 10,
        recordsTotal: 0,
        recordsFiltered: 0,
        data: [],
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      draw: req?.query?.draw || 10,
      recordsTotal: 0,
      recordsFiltered: 0,
      data: [],
    });
  }
});

const createCoupon = asyncHandler(async (req, res) => {
  const { coupon_name, discount, end_date } = req.body;
  try {
    if (!coupon_name) {
      return res.status(400).json({ message: "Coupon name is required" });
    } else if (!discount) {
      return res.status(400).json({ message: "Coupon amount is required" });
    } else if (!end_date) {
      return res.status(400).json({ message: "Coupon end date is required" });
    }

    const newCoupon = await db.coupons.create({
      coupon_name,
      discount,
      end_date,
    });
    res.status(201).json({
      message: "Coupon created successfully!",
      success: true,
      data: newCoupon,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while creating coupon.",
      success: false,
      data: [],
    });
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { coupon_id } = req.params;
  try {
    if (!coupon_id) {
      return res.status(400).json({ error: "Coupon id is required" });
    }
    const coupon = await db.coupons.findByPk(coupon_id);
    if (!coupon) {
      return res.status(400).json({ error: "Coupon not found" });
    }

    // Soft delete the coupon
    await coupon.destroy();
    res.status(200).json({
      message: "Coupon deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while deleting coupon.",
      success: false,
      data: [],
    });
  }
});

module.exports = {
  getCoupons,
  createCoupon,
  deleteCoupon,
};
