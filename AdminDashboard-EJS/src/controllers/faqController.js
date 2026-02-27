const Faq = require("../models/Faq");
const logActivity = require("../utils/activityLogger");
const getValidationError = require("../utils/getValidationError");
const mongoose = require("mongoose");

/* ------------------- CREATE FAQ ------------------- */
exports.createFaq = async (req, res) => {
  try {
    let { question, answer, tags } = req.body;

    question = question.trim();
    answer = answer.trim();

    if (!question) {
      return res.status(400).json({ success: false, message: "Question is required" });
    }

    if (!answer) {
      return res.status(400).json({ success: false, message: "Answer is required" });
    }

    const existingFaq = await Faq.findOne({ question: question });
    if (existingFaq) {
      return res.status(400).json({ success: false, message: "FAQ with this question already exists" });
    }

    if (tags && Array.isArray(tags)) {
      tags = tags.map((t) => t.trim()).filter((t) => t.length > 0);
    } else {
      tags = [];
    }

    const faq = await Faq.create({
      question,
      answer,
      tags,
      author: req.user._id,
    });

    await logActivity({
      user: req.user._id,
      action: "CREATE_FAQ",
      description: `FAQ created: "${question}"`,
      req,
      status: "success",
    });

    res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      data: faq,
    });
  } catch (error) {
    console.error("❌ createFaq error:", error.message);
    const message = getValidationError(error);

    await logActivity({
      user: req.user?._id || null,
      action: "CREATE_FAQ",
      description: "FAQ creation failed",
      req,
      status: "failed",
    });

    res.status(400).json({ success: false, message });
  }
};

/* ------------------- GET ALL FAQs ------------------- */
exports.getAllFaqs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const cursor = req.query.cursor;
    const search = req.query.search || "";
    const order = req.query.sort === "asc" ? 1 : -1;

    const query = {};

    if (req.user.role !== "admin") {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id =
        order === 1
          ? { $gt: new mongoose.Types.ObjectId(cursor) }
          : { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const faqs = await Faq.find(query)
      .populate("author", "name email role")
      .sort({ _id: order })
      .limit(limit + 1);

    const hasNextPage = faqs.length > limit;
    if (hasNextPage) faqs.pop();
    const nextCursor = faqs.length ? faqs[faqs.length - 1]._id : null;

    res.status(200).json({
      success: true,
      message: "FAQs retrieved successfully",
      pageInfo: { hasNextPage, nextCursor, limit },
      data: faqs,
    });
  } catch (error) {
    console.error("❌ getAllFaqs error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- GET SINGLE FAQ ------------------- */
exports.getFaqById = async (req, res) => {
  try {
    const { faqId } = req.params;

    const faq = await Faq.findById(faqId).populate("author", "name email role");

    if (!faq)
      return res.status(404).json({ success: false, message: "FAQ not found" });

    if (!faq.isActive && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.status(200).json({
      success: true,
      message: "FAQ retrieved successfully",
      data: faq,
    });
  } catch (error) {
    console.error("❌ getFaqById error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- GET FAQ STATS ------------------- */
exports.getFaqStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Faq.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          active: [{ $match: { isActive: true } }, { $count: "count" }],
          inactive: [{ $match: { isActive: false } }, { $count: "count" }],
          today: [{ $match: { createdAt: { $gte: today } } }, { $count: "count" }],
        },
      },
    ]);

    const s = stats[0];

    res.json({
      success: true,
      message: "FAQ stats retrieved successfully",
      stats: {
        total: s.total[0]?.count || 0,
        active: s.active[0]?.count || 0,
        inactive: s.inactive[0]?.count || 0,
        today: s.today[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error("❌ getFaqStats error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- UPDATE FAQ ------------------- */
exports.updateFaq = async (req, res) => {
  try {
    const { faqId } = req.params;
    let { question, answer, tags } = req.body;

    question = question.trim();
    answer = answer.trim();

    if (!question) return res.status(400).json({ success: false, message: "Question is required" });
    if (!answer) return res.status(400).json({ success: false, message: "Answer is required" });
    if (answer.length < 10) return res.status(400).json({ success: false, message: "Answer must be at least 10 characters" });

    const existing = await Faq.findOne({ question, _id: { $ne: faqId } });
    if (existing) return res.status(400).json({ success: false, message: "FAQ with this question already exists" });

    if (tags && Array.isArray(tags)) {
      tags = tags.map((t) => t.trim()).filter(Boolean);
    } else {
      tags = [];
    }

    const faq = await Faq.findByIdAndUpdate(
      faqId,
      { question, answer, tags },
      { new: true, runValidators: true }
    );

    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });

    await logActivity({
      user: req.user._id,
      action: "UPDATE_FAQ",
      description: `FAQ updated: "${question}"`,
      req,
      status: "success",
    });

    res.json({ success: true, message: "FAQ updated successfully", data: faq });
  } catch (error) {
    console.error("❌ updateFaq error:", error.message);
    const message = getValidationError(error);

    await logActivity({
      user: req.user?._id || null,
      action: "UPDATE_FAQ",
      description: "FAQ update failed",
      req,
      status: "failed",
    });

    res.status(400).json({ success: false, message });
  }
};

/* ------------------- DELETE FAQ ------------------- */
exports.deleteFaq = async (req, res) => {
  try {
    const { faqId } = req.params;

    const faq = await Faq.findById(faqId).populate(
      "author",
      "name email role"
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    if (
      faq.author._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const deletedFaq = faq.toObject();

    await faq.deleteOne();

    await logActivity({
      user: req.user._id,
      action: "DELETE_FAQ",
      description: `FAQ deleted: "${faq.question}"`,
      req,
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
      data: deletedFaq,
    });
  } catch (error) {
    console.error("❌ deleteFaq error:", error.message);

    await logActivity({
      user: req.user?._id || null,
      action: "DELETE_FAQ",
      description: "FAQ deletion failed",
      req,
      status: "failed",
    });

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ------------------- BULK TOGGLE STATUS ------------------- */
exports.bulkToggleFaqStatus = async (req, res) => {
  try {
    const { faqIds, isActive } = req.body;

    if (!faqIds || !faqIds.length || typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const faqs = await Faq.find({ _id: { $in: faqIds } }).populate(
      "author",
      "name email role"
    );

    if (!faqs.length) {
      return res.status(404).json({
        success: false,
        message: "No FAQs found",
      });
    }

    await Faq.updateMany(
      { _id: { $in: faqIds } },
      { isActive }
    );

    const updatedFaqs = faqs.map((faq) => ({
      ...faq.toObject(),
      isActive,
    }));

    await logActivity({
      user: req.user._id,
      action: "BULK_TOGGLE_FAQ_STATUS",
      description: `Bulk ${isActive ? "activated" : "deactivated"} FAQs`,
      req,
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: `FAQs ${isActive ? "activated" : "deactivated"} successfully`,
      data: {
        count: updatedFaqs.length,
        isActive,
        faqs: updatedFaqs,
      },
    });
  } catch (error) {
    console.error("❌ bulkToggleFaqStatus error:", error.message);

    await logActivity({
      user: req.user?._id || null,
      action: "BULK_TOGGLE_FAQ_STATUS",
      description: "Bulk FAQ status toggle failed",
      req,
      status: "failed",
    });

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

