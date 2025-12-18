const asyncHandler = require("express-async-handler");
const { db } = require("../models/dbconfig");

const createPrivacyPolicy = asyncHandler(async (req, res) => {
  const userId = req.user?.user_id;
  let { main_heading, sections } = req.body;

  if (!main_heading || !sections) {
    return res.status(400).json({
      success: false,
      message: "Main heading and sections are required",
    });
  }

  try {
    if (typeof sections === "string") {
      sections = JSON.parse(sections);
    }
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format for sections",
    });
  }

  const newPolicy = await db.privacy_policy.create({
    main_heading,
    sections,
    created_by: userId,
  });

  return res.status(201).json({
    success: true,
    message: "Privacy Policy created successfully",
    data: newPolicy,
  });
});

const updatePrivacyPolicy = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { main_heading, sections } = req.body;

  const policy = await db.privacy_policy.findByPk(id);
  if (!policy)
    return res
      .status(404)
      .json({ success: false, message: "Policy not found" });

  await policy.update({ main_heading, sections });

  res.status(200).json({
    success: true,
    message: "Privacy Policy updated successfully",
    data: policy,
  });
});

const deletePrivacyPolicy = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.user_id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user",
    });
  }

  const policy = await db.privacy_policy.findByPk(id);
  if (!policy) {
    return res.status(404).json({
      success: false,
      message: "Privacy Policy not found",
    });
  }

  await policy.update({ deleted_by: userId });

  await policy.destroy();

  return res.status(200).json({
    success: true,
    message: "Privacy Policy deleted successfully",
    data: {
      deleted_by: userId,
      deleted_entry_id: id,
    },
  });
});

const getAllPrivacyPolicies = asyncHandler(async (req, res) => {
  const policies = await db.privacy_policy.findAll({
    order: [["createdAt", "DESC"]],
  });

  const formattedPolicies = policies.map((policy) => ({
    policy_id: policy.policy_id,
    main_heading: policy.main_heading,
    sections:
      typeof policy.sections === "string"
        ? JSON.parse(policy.sections)
        : policy.sections,
    created_by: policy.created_by,
    created_at: policy.createdAt,
    updated_at: policy.updatedAt,
  }));

  return res.status(200).json({
    success: true,
    message: "Privacy policies fetched successfully",
    total: formattedPolicies.length,
    data: formattedPolicies,
  });
});

const getPrivacyPolicyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const policy = await db.privacy_policy.findOne({
    where: { policy_id: id },
  });

  if (!policy) {
    return res.status(404).json({
      success: false,
      message: "Privacy policy not found",
    });
  }

  const formattedPolicy = {
    policy_id: policy.policy_id,
    main_heading: policy.main_heading,
    sections:
      typeof policy.sections === "string"
        ? JSON.parse(policy.sections)
        : policy.sections,
    created_by: policy.created_by,
    created_at: policy.createdAt,
    updated_at: policy.updatedAt,
  };

  return res.status(200).json({
    success: true,
    message: "Privacy policy fetched successfully",
    data: formattedPolicy,
  });
});

module.exports = {
  createPrivacyPolicy,
  updatePrivacyPolicy,
  deletePrivacyPolicy,
  getAllPrivacyPolicies,
  getPrivacyPolicyById
};
