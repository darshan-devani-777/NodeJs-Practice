const asyncHandler = require("express-async-handler");
const { db } = require("../models/dbconfig");

const submitContactForm = asyncHandler(async (req, res) => {
  const { full_name, email, bio } = req.body;
  const userId = req.user?.user_id || null;

  if (!full_name || !email) {
    return res.status(400).json({
      success: false,
      message: "Full name and email are required",
    });
  }

  const newForm = await db.contact_form.create({
    full_name,
    email,
    bio,
    created_by: userId,
  });

  res.status(201).json({
    success: true,
    message: "Contact form submitted successfully",
    data: newForm,
  });
});

const updateContactForm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { full_name, email, bio } = req.body;

  const form = await db.contact_form.findByPk(id);

  if (!form) {
    return res.status(404).json({
      success: false,
      message: "Contact form not found",
    });
  }

  await form.update({
    full_name: full_name || form.full_name,
    email: email || form.email,
    bio: bio || form.bio,
  });

  res.status(200).json({
    success: true,
    message: "Contact form updated successfully",
    data: form,
  });
});

const getAllContactForms = asyncHandler(async (req, res) => {
  const forms = await db.contact_form.findAll({
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json({
    success: true,
    message: "Contact forms fetched successfully",
    total: forms.length,
    data: forms,
  });
});

const createOrUpdateContactInfo = asyncHandler(async (req, res) => {
  const { email, phone, location } = req.body;
  const userId = req.user?.user_id || null;

  if (!email || !phone || !location) {
    return res.status(400).json({
      success: false,
      message: "Email, phone, and location are required",
    });
  }

  let info = await db.contact_info.findOne();

  if (info) {
    await info.update({ email, phone, location });
    return res.status(200).json({
      success: true,
      message: "Contact info updated successfully",
      data: info,
    });
  } else {
    info = await db.contact_info.create({
      email,
      phone,
      location,
      created_by: userId,
    });
    return res.status(201).json({
      success: true,
      message: "Contact info created successfully",
      data: info,
    });
  }
});

const deleteContactInfo = asyncHandler(async (req, res) => {
  const userId = req.user?.user_id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user",
    });
  }

  const info = await db.contact_info.findOne();

  if (!info) {
    return res.status(404).json({
      success: false,
      message: "Contact info not found",
    });
  }

  await info.update({ deleted_by: userId });

  await info.destroy();

  res.status(200).json({
    success: true,
    message: "Contact info deleted successfully",
    data: {
      deleted_by: userId,
      deleted_at: new Date(),
      info_id: info.info_id,
    },
  });
});

const getContactInfo = asyncHandler(async (req, res) => {
  const info = await db.contact_info.findOne();

  if (!info) {
    return res.status(404).json({
      success: false,
      message: "No contact info found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Contact info fetched successfully",
    data: info,
  });
});

module.exports = {
  submitContactForm,
  updateContactForm,
  getAllContactForms,
  createOrUpdateContactInfo,
  deleteContactInfo,
  getContactInfo,
};
