const { db } = require("../models/dbconfig");
const { Op } = require('sequelize');
const { asyncHandler } = require("../utils/asyncHandler");

const createFAQ = asyncHandler(async (req, res) => {
  const { question, answer } = req.body;
  try {
    if (!question) {
      return res.status(400).json({ message: "question is required" });
    } else if (!answer) {
      return res.status(400).json({ message: "answer is required" });
    }

    const newFAQ = await db.faqs.create({
      question,
      answer,
    });
    res.status(201).json({
      message: "FAQ created successfully!",
      success: true,
      data: newFAQ,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while creating coupon.",
      success: false,
      data: [],
    });
  }
});

const deleteFAQ = asyncHandler(async (req, res) => {
  const { faq_id } = req.params;
  try {
    if (!faq_id) {
      return res.status(400).json({ error: "FAQ id is required" });
    }
    const faq = await db.faqs.findByPk(faq_id);
    if (!faq) {
      return res.status(400).json({ error: "FAQ not found" });
    }

    // Soft delete the FAQ
    await faq.destroy();
    res.status(200).json({
      message: "FAQ deleted successfully",
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

const getFAQByID = asyncHandler(async (req, res) => {
  const { faq_id } = req.params;
  try {
    if (!faq_id) {
      return res.status(400).json({ error: "FAQ id is required" });
    }
    const faq = await db.faqs.findByPk(faq_id);
    if (!faq) {
      return res.status(400).json({ error: "FAQ not found" });
    }

    res.status(200).json({
      message: "FAQ fetched successfully",
      success: true,
      data: faq
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while deleting coupon.",
      success: false,
      data: [],
    });
  }
});

const updateFAQ = asyncHandler(async (req, res) => {
  const { faq_id } = req.params;
  const { question, answer } = req.body;
  try {
    const faq = await db.faqs.findByPk(faq_id);
    if (!faq) {
      return res.status(400).json({ error: "FAQ not found" });
    }
    
    if (question) faq.question = question;
    if (answer) faq.answer = answer;

    await faq.save();
    res.status(200).json({
      message: "FAQ updated successfully!",
      success: true,
      data: faq,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while editing article.",
      success: false,
      data: null,
    });
  }
});

const getAFAQs = asyncHandler(async (req, res) => {
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
      sort_column = "faq_id";
      sort_order = "desc";
    }

    search = req.query?.search["value"] ? `%${req.query?.search["value"]}%` : '';
    if (search != "") {
      condition = {
        [Op.or]: [
          { question: { [Op.like]: search } },
          { answer: { [Op.like]: search } },
        ],
      };
    }

    let data = await db.faqs.findAndCountAll({
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

const listFAQs = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  try {
    const faqs = await db.faqs.findAndCountAll({
      limit,
      offset,
    });
    res.status(200).json({
      message: "FAQs fetched successfully!",
      success: true,
      data: faqs,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while fetching articles.",
      success: false,
      data: [],
    });
  }
});

module.exports = {
  createFAQ,
  deleteFAQ,
  getFAQByID,
  updateFAQ,
  getAFAQs,
  listFAQs
};
