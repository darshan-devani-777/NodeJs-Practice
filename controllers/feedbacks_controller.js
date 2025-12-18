const { db } = require("../models/dbconfig");
const { Op } = require("sequelize");
const { asyncHandler } = require("../utils/asyncHandler");
const { uploadImageOnCloudinary, deleteImageOnCloudinary } = require("../utils/cloudinary");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const createFeedback = asyncHandler(async (req, res) => {
  const { name, description, feedback_text } = req.body;
  const { file } = req;
  try {
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    } else if (!description) {
      return res.status(400).json({ message: "description is required" });
    } else if (!feedback_text) {
      return res.status(400).json({ message: "feedback text is required" });
    }

    if (file && file.buffer.length > 20 * 1024 * 1024) {
      return res
        .status(500)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
          message: "File size exceeded!",
          success: false,
          data: { ...safeUserData, accessToken },
        });
    }

    let imageUrl = "";
    let imageName = "";
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        return res.status(400).json({
          message: "File size exceeded!",
          success: false,
        });
      }

      const tempFilename = `${uuidv4()}-${file.originalname}`;
      const tempPath = path.join(__dirname, "../public/temp", tempFilename);

      fs.writeFileSync(tempPath, file.buffer);

      const uploadedImage = await uploadImageOnCloudinary(tempPath);

      if (uploadedImage && uploadedImage.url) {
        imageUrl = uploadedImage.url;
        imageName = file.originalname;
      }
    }

    const newFeedback = await db.feedbacks.create({
      name,
      description,
      feedback_text,
      image_name: imageName,
      image: imageUrl || "",
    });
    res.status(201).json({
      message: "Feedback created successfully!",
      success: true,
      data: newFeedback,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while creating coupon.",
      success: false,
      data: [],
    });
  }
});

const deleteFeedback = asyncHandler(async (req, res) => {
  const { feedback_id } = req.params;
  try {
    if (!feedback_id) {
      return res.status(400).json({ error: "Feedback id is required" });
    }
    const feedback = await db.feedbacks.findByPk(feedback_id);
    if (!feedback) {
      return res.status(400).json({ error: "Feedback not found" });
    }

    // Soft delete the feedback
    await feedback.destroy();
    res.status(200).json({
      message: "Feedback deleted successfully",
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

const getFeedbackByID = asyncHandler(async (req, res) => {
  const { feedback_id } = req.params;
  try {
    if (!feedback_id) {
      return res.status(400).json({ error: "Feedback id is required" });
    }
    const feedback = await db.feedbacks.findByPk(feedback_id);
    if (!feedback) {
      return res.status(400).json({ error: "Feedback not found" });
    }

    res.status(200).json({
      message: "Feedback fetched successfully",
      success: true,
      data: feedback,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while deleting coupon.",
      success: false,
      data: [],
    });
  }
});

const updateFeedback = asyncHandler(async (req, res) => {
  const { feedback_id } = req.params;
  const { name, description, feedback_text } = req.body;
  const { file } = req;

  try {
    const feedback = await db.feedbacks.findByPk(feedback_id);
    if (!feedback) {
      return res.status(400).json({ error: "Feedback not found" });
    }

    if (file && file.buffer.length > 20 * 1024 * 1024) {
      return res
        .status(500)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
          message: "File size exceeded!",
          success: false,
          data: { ...safeUserData, accessToken },
        });
    }

    let imageUrl = "";
    let imageName = "";
    if (file) {
      const tempFilename = `${uuidv4()}-${file.originalname}`;
      const tempPath = path.join(__dirname, "../public/temp", tempFilename);

      fs.writeFileSync(tempPath, file.buffer);

      const uploadedImage = await uploadImageOnCloudinary(tempPath);
      await deleteImageOnCloudinary(feedback.image);

      if (uploadedImage && uploadedImage.url) {
        imageUrl = uploadedImage.url;
        imageName = file.originalname;
      }
    }

    if (name) feedback.name = name;
    if (description) feedback.description = description;
    if (feedback_text) feedback.feedback_text = feedback_text;
    if (file) feedback.image_name = imageName;
    if (file) feedback.image = imageUrl || "";

    await feedback.save();
    res.status(200).json({
      message: "Feedback updated successfully!",
      success: true,
      data: feedback,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while editing article.",
      success: false,
      data: null,
    });
  }
});

const getAFeedbacks = asyncHandler(async (req, res) => {
  try {
    let sort_column_index,
      sort_column,
      sort_order,
      condition = {},
      search = "";

    if (req.query.order) {
      sort_column_index = req.query.order[0]["column"];
      sort_column = req.query.columns[sort_column_index]["data"];
      sort_order = req.query.order[0]["dir"] || "desc";
    } else {
      sort_column = "feedback_id";
      sort_order = "desc";
    }

    search = req.query?.search["value"]
      ? `%${req.query?.search["value"]}%`
      : "";
    if (search != "") {
      condition = {
        [Op.or]: [
          { name: { [Op.like]: search } },
          { description: { [Op.like]: search } },
          { feedback_text: { [Op.like]: search } },
        ],
      };
    }

    let data = await db.feedbacks.findAndCountAll({
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

const listFeedbacks = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  try {
    const feedbacks = await db.feedbacks.findAndCountAll({
      limit,
      offset,
    });
    res.status(200).json({
      message: "Feedbacks fetched successfully!",
      success: true,
      data: feedbacks,
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
  createFeedback,
  deleteFeedback,
  getFeedbackByID,
  updateFeedback,
  getAFeedbacks,
  listFeedbacks,
};
