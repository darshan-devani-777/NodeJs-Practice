const asyncHandler = require("express-async-handler");
const { db } = require("../models/dbconfig");

// Create Terms of Use
const createTermsOfUse = asyncHandler(async (req, res) => {
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

  const newTerms = await db.terms_of_use.create({
    main_heading,
    sections,
    created_by: userId,
  });

  return res.status(201).json({
    success: true,
    message: "Terms of Use created successfully",
    data: newTerms,
  });
});

// Update Terms of Use
const updateTermsOfUse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { main_heading, sections } = req.body;

  const terms = await db.terms_of_use.findByPk(id);
  if (!terms)
    return res
      .status(404)
      .json({ success: false, message: "Terms of Use not found" });

  await terms.update({ main_heading, sections });

  res.status(200).json({
    success: true,
    message: "Terms of Use updated successfully",
    data: terms,
  });
});

// Delete Terms of Use
const deleteTermsOfUse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.user_id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user",
    });
  }

  const terms = await db.terms_of_use.findByPk(id);
  if (!terms) {
    return res.status(404).json({
      success: false,
      message: "Terms of Use not found",
    });
  }

  await terms.update({ deleted_by: userId });
  await terms.destroy();

  return res.status(200).json({
    success: true,
    message: "Terms of Use deleted successfully",
    data: {
      deleted_by: userId,
      deleted_entry_id: id,
    },
  });
});

// Get All Terms of Use
const getAllTermsOfUse = asyncHandler(async (req, res) => {
  const termsList = await db.terms_of_use.findAll({
    order: [["createdAt", "DESC"]],
  });

  const formattedTerms = termsList.map((terms) => ({
    terms_id: terms.terms_id,
    main_heading: terms.main_heading,
    sections:
      typeof terms.sections === "string"
        ? JSON.parse(terms.sections)
        : terms.sections,
    created_by: terms.created_by,
    created_at: terms.createdAt,
    updated_at: terms.updatedAt,
  }));

  return res.status(200).json({
    success: true,
    message: "Terms of Use fetched successfully",
    total: formattedTerms.length,
    data: formattedTerms,
  });
});

// Get Terms of Use By Id
const getTermsOfUseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const terms = await db.terms_of_use.findOne({
    where: { terms_id: id },
  });

  if (!terms) {
    return res.status(404).json({
      success: false,
      message: "Terms of Use not found",
    });
  }

  const formattedTerms = {
    terms_id: terms.terms_id,
    main_heading: terms.main_heading,
    sections:
      typeof terms.sections === "string"
        ? JSON.parse(terms.sections)
        : terms.sections,
    created_by: terms.created_by,
    created_at: terms.createdAt,
    updated_at: terms.updatedAt,
  };

  return res.status(200).json({
    success: true,
    message: "Terms of Use fetched successfully",
    data: formattedTerms,
  });
});

module.exports = {
  createTermsOfUse,
  updateTermsOfUse,
  deleteTermsOfUse,
  getAllTermsOfUse,
  getTermsOfUseById
};
