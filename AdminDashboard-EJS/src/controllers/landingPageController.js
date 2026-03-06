const mongoose = require("mongoose");
const LandingPage = require("../models/LandingPage");
const logActivity = require("../utils/activityLogger");

/* ------------------- UPSERT SECTION ------------------- */
exports.upsertSection = async (req, res) => {
  try {
    const { sectionName, content } = req.body;

    if (!sectionName || !sectionName.trim()) {
      await logActivity({
        user: req.user?._id,
        action: "UPSERT_LANDING_SECTION",
        description: "Section name missing while saving landing section",
        req,
        status: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Section name is required",
      });
    }

    if (!content || typeof content !== "object" || Array.isArray(content)) {
      await logActivity({
        user: req.user?._id,
        action: "UPSERT_LANDING_SECTION",
        description: `Invalid content provided for section "${sectionName}"`,
        req,
        status: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Content must be a valid object",
      });
    }

    const normalizedSection = sectionName.trim().toLowerCase();

    const existingSection = await LandingPage.findOne({ sectionName: normalizedSection });

    let actionType = "CREATE_LANDING_SECTION";
    let description = `Landing page section created: "${normalizedSection}"`;

    const updateData = { sectionName: normalizedSection, content };

    if (existingSection) {
      actionType = "UPDATE_LANDING_SECTION";
      description = `Landing page section updated: "${normalizedSection}"`;
      updateData.updatedBy = req.user._id;
    } else {
      updateData.createdBy = req.user._id;
    }

    const section = await LandingPage.findOneAndUpdate(
      { sectionName: normalizedSection },
      updateData,
      { new: true, upsert: true, runValidators: true }
    )
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    await logActivity({
      user: req.user._id,
      action: actionType,
      description,
      req,
      status: "success",
    });

    return res.status(200).json({
      success: true,
      message: existingSection
        ? "Section updated successfully"
        : "Section created successfully",
      data: section,
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      await logActivity({
        user: req.user?._id,
        action: "UPSERT_LANDING_SECTION",
        description: "Validation failed while saving landing section",
        req,
        status: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error, 
      });
    }

    if (error.code === 11000) {
      await logActivity({
        user: req.user?._id,
        action: "UPSERT_LANDING_SECTION",
        description: "Duplicate section name while saving landing section",
        req,
        status: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Duplicate key error",
        error,
        duplicateField: error.keyValue, 
      });
    }

    await logActivity({
      user: req.user?._id,
      action: "UPSERT_LANDING_SECTION",
      description: "Error occurred while saving landing section",
      req,
      status: "failed",
    });

    return res.status(500).json({
      success: false,
      message: "Failed to save section",
      error,
    });
  }
};

/* ------------------- GET ALL SECTIONS ------------------- */
exports.getSections = async (req, res) => {
  try {
    const { cursor, limit = 5, search } = req.query;
    const query = {};

    if (search) query.sectionName = { $regex: search, $options: "i" };
    if (cursor) query._id = { $lt: cursor };

    const sections = await LandingPage.find(query)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role")
      .sort({ _id: -1 })
      .limit(parseInt(limit) + 1);

    let nextCursor = null;
    if (sections.length > limit) {
      const nextItem = sections.pop();
      nextCursor = nextItem._id;
    }

    res.status(200).json({
      success: true,
      message: "Sections fetched successfully",
      count: sections.length,
      nextCursor,
      data: sections,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching sections",
      error, 
    });
  }
};

/* ------------------- GET SECTION BY ID ------------------- */
exports.getSectionById = async (req, res) => {
  try {
    const { sectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section ID",
      });
    }

    const section = await LandingPage.findById(sectionId)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    if (!section) {
      await logActivity({
        user: req.user?._id,
        action: "GET_LANDING_SECTION",
        description: `Landing section not found: ${sectionId}`,
        req,
        status: "failed",
      });

      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Section fetched successfully",
      data: section,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching section",
      error, 
    });
  }
};

/* ------------------- TOGGLE SECTION STATUS ------------------- */
exports.toggleSectionStatus = async (req, res) => {
  try {
    const { sectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section ID",
      });
    }

    const section = await LandingPage.findById(sectionId);
    if (!section) {
      await logActivity({
        user: req.user?._id,
        action: "TOGGLE_LANDING_SECTION",
        description: `Landing section not found: ${sectionId}`,
        req,
        status: "failed",
      });

      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    section.isActive = !section.isActive;
    section.updatedBy = req.user?._id;
    await section.save();

    await logActivity({
      user: req.user?._id,
      action: "TOGGLE_LANDING_SECTION",
      description: `Landing section ${section.isActive ? "activated" : "deactivated"}: ${sectionId}`,
      req,
      status: "success",
    });

    return res.status(200).json({
      success: true,
      message: `Section ${section.isActive ? "activated" : "deactivated"} successfully`,
      data: section,
    });

  } catch (error) {
    await logActivity({
      user: req.user?._id,
      action: "TOGGLE_LANDING_SECTION",
      description: "Error while toggling landing section status",
      req,
      status: "failed",
    });

    return res.status(500).json({
      success: false,
      message: "Failed to toggle section status",
      error, 
    });
  }
};

/* ------------------- DELETE SECTION ------------------- */
exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    if (!sectionId) {
      await logActivity({
        user: req.user?._id,
        action: "DELETE_LANDING_SECTION",
        description: "Section ID missing while deleting landing section",
        req,
        status: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Section ID is required",
      });
    }

    const deletedSection = await LandingPage.findByIdAndDelete(sectionId)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    if (!deletedSection) {
      await logActivity({
        user: req.user?._id,
        action: "DELETE_LANDING_SECTION",
        description: `Landing section not found with id: ${sectionId}`,
        req,
        status: "failed",
      });

      return res.status(404).json({
        success: false,
        message: "Landing section not found",
      });
    }

    await logActivity({
      user: req.user._id,
      action: "DELETE_LANDING_SECTION",
      description: `Landing page section deleted: "${deletedSection.sectionName}"`,
      req,
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: "Landing section deleted successfully",
      deletedSection,
    });

  } catch (error) {
    await logActivity({
      user: req.user?._id,
      action: "DELETE_LANDING_SECTION",
      description: "Error occurred while deleting landing section",
      req,
      status: "failed",
    });

    res.status(500).json({
      success: false,
      message: "Failed to delete section",
      error, 
    });
  }
};