const PrivacyPolicy = require("../models/PrivacyPolicy");
const logActivity = require("../utils/activityLogger");
const getValidationError = require("../utils/getValidationError");

/* ------------------- GET PRIVACY POLICY ------------------- */
exports.getPolicy = async (req, res) => {
  try {
    const policy = await PrivacyPolicy.findOne().populate("author", "name email role");

    if (!policy) {
      return res.status(404).json({ success: false, message: "Privacy Policy not found" });
    }

    res.status(200).json({ success: true, message: "Privacy Policy retrieved", data: policy });
  } catch (error) {
    console.error("❌ getPolicy error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- CREATE OR UPDATE PRIVACY POLICY ------------------- */
exports.upsertPolicy = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ success: false, message: "Request body is required" });
    }

    const { sections, isActive } = req.body;

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ success: false, message: "At least one section is required" });
    }

    for (const sec of sections) {
      if (!sec.title || !sec.content) {
        return res.status(400).json({ success: false, message: "Each section must have a title and content" });
      }
      sec.title = sec.title.trim();
      sec.content = sec.content.trim();
    }

    let policy = await PrivacyPolicy.findOne();
    let actionType = "";

    if (policy) {
      policy.sections = sections;
      if (typeof isActive === "boolean") policy.isActive = isActive;

      try {
        await policy.save();
      } catch (error) {
        const message = getValidationError(error);
        return res.status(400).json({ success: false, message });
      }

      actionType = "UPDATE_PRIVACY_POLICY";
      res.json({ success: true, message: "Privacy Policy updated successfully", data: policy });

    } else {
      try {
        policy = await PrivacyPolicy.create({
          sections,
          isActive: isActive ?? true,
          author: req.user._id,
        });
      } catch (error) {
        const message = getValidationError(error);
        return res.status(400).json({ success: false, message });
      }

      actionType = "CREATE_PRIVACY_POLICY";
      res.status(201).json({ success: true, message: "Privacy Policy created successfully", data: policy });
    }

    if (actionType) {
      await logActivity({
        user: req.user._id,
        action: actionType,
        description: actionType === "CREATE_PRIVACY_POLICY" ? "Privacy Policy created" : "Privacy Policy updated",
        req,
        status: "success",
      });
    }

  } catch (error) {
    console.error("❌ upsertPolicy error:", error.message);

    await logActivity({
      user: req.user?._id || null,
      action: "UPSERT_PRIVACY_POLICY",
      description: "Operation failed",
      req,
      status: "failed",
    });

    res.status(500).json({ success: false, message: "Server error" });
  }
};
