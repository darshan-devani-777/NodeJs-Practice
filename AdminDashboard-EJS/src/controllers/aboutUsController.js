const AboutUs = require("../models/AboutUs");
const logActivity = require("../utils/activityLogger");
const getValidationError = require("../utils/getValidationError");

/* ------------------- GET ABOUT US ------------------- */
exports.getAbout = async (req, res) => {
  try {
    const about = await AboutUs.findOne().populate("author", "name email role");

    if (!about) {
      return res.status(404).json({
        success: false,
        message: "About Us not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "About Us retrieved successfully",
      data: about
    });

  } catch (error) {
    console.error("❌ getAbout error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- CREATE OR UPDATE ABOUT US ------------------- */
exports.upsertAbout = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is required"
      });
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

    let about = await AboutUs.findOne();
    let actionType = "";

    if (about) {
      about.sections = sections;
      if (typeof isActive === "boolean") about.isActive = isActive;

      try {
        await about.save();
      } catch (error) {
        const message = getValidationError(error);
        return res.status(400).json({ success: false, message });
      }

      actionType = "UPDATE_ABOUT_US";

      res.json({
        success: true,
        message: "About Us updated successfully",
        data: about
      });

    } else {
      try {
        about = await AboutUs.create({
          sections,
          isActive: isActive ?? true,
          author: req.user._id,
        });
      } catch (error) {
        const message = getValidationError(error);
        return res.status(400).json({ success: false, message });
      }

      actionType = "CREATE_ABOUT_US";

      res.status(201).json({
        success: true,
        message: "About Us created successfully",
        data: about
      });
    }

    if (actionType) {
      await logActivity({
        user: req.user._id,
        action: actionType,
        description:
          actionType === "CREATE_ABOUT_US"
            ? "About Us created"
            : "About Us updated",
        req,
        status: "success",
      });
    }

  } catch (error) {
    console.error("❌ upsertAbout error:", error.message);

    await logActivity({
      user: req.user?._id || null,
      action: "UPSERT_ABOUT_US",
      description: "Operation failed",
      req,
      status: "failed",
    });

    res.status(500).json({ success: false, message: "Server error" });
  }
};