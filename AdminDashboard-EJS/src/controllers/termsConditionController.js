const TermsCondition = require("../models/TermsCondition");
const logActivity = require("../utils/activityLogger");
const getValidationError = require("../utils/getValidationError");

/* ------------------- GET TERMS & CONDITIONS ------------------- */
exports.getTerms = async (req, res) => {
  try {
    const terms = await TermsCondition.findOne().populate("author", "name email role");

    if (!terms) {
      return res.status(404).json({ success: false, message: "Terms & Conditions not found" });
    }

    res.status(200).json({
      success: true,
      message: "Terms & Conditions retrieved",
      data: terms
    });

  } catch (error) {
    console.error("❌ getTerms error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- CREATE OR UPDATE TERMS & CONDITIONS ------------------- */
exports.upsertTerms = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ success: false, message: "Request body is required" });
    }

    const { sections, isActive } = req.body;

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one section is required"
      });
    }

    for (const sec of sections) {
      if (!sec.title || !sec.content) {
        return res.status(400).json({
          success: false,
          message: "Each section must have a title and content"
        });
      }

      sec.title = sec.title.trim();
      sec.content = sec.content.trim();
    }

    let terms = await TermsCondition.findOne();
    let actionType = "";

    if (terms) {
      terms.sections = sections;
      if (typeof isActive === "boolean") terms.isActive = isActive;

      try {
        await terms.save();
      } catch (error) {
        const message = getValidationError(error);
        return res.status(400).json({ success: false, message });
      }

      actionType = "UPDATE_TERMS_CONDITIONS";

      res.json({
        success: true,
        message: "Terms & Conditions updated successfully",
        data: terms
      });

    } else {
      try {
        terms = await TermsCondition.create({
          sections,
          isActive: isActive ?? true,
          author: req.user._id,
        });
      } catch (error) {
        const message = getValidationError(error);
        return res.status(400).json({ success: false, message });
      }

      actionType = "CREATE_TERMS_CONDITIONS";

      res.status(201).json({
        success: true,
        message: "Terms & Conditions created successfully",
        data: terms
      });
    }

    if (actionType) {
      await logActivity({
        user: req.user._id,
        action: actionType,
        description:
          actionType === "CREATE_TERMS_CONDITIONS"
            ? "Terms & Conditions created"
            : "Terms & Conditions updated",
        req,
        status: "success",
      });
    }

  } catch (error) {
    console.error("❌ upsertTerms error:", error.message);

    await logActivity({
      user: req.user?._id || null,
      action: "UPSERT_TERMS_CONDITIONS",
      description: "Operation failed",
      req,
      status: "failed",
    });

    res.status(500).json({ success: false, message: "Server error" });
  }
};