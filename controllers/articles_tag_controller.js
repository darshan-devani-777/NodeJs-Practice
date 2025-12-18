const { v4: uuidv4 } = require("uuid");
const { db } = require("../models/dbconfig");
const { asyncHandler } = require("../utils/asyncHandler");
const { uploadImageOnCloudinary } = require("../utils/cloudinary");
const fs = require("fs");
const path = require("path");

const createArticleTag = asyncHandler(async (req, res) => {
  const { type, name, description } = req.body;

  const lowercase_name = name ? name.toLowerCase().replace(/\s/g, "-") : null;
  const { file } = req;

  if (!description) {
    return res.status(400).json({
      message: "Tag description is required.",
      success: false,
    });
  }

  if (!type) {
    return res.status(400).json({
      message: "Tag type is required.",
      success: false,
    });
  }

  if (!file || !file.buffer) {
    return res.status(400).json({
      message: "Image file is required.",
      success: false,
    });
  }

  if (!name || !lowercase_name) {
    return res.status(400).json({
      message: "Tag name and lowercase name are required.",
      success: false,
    });
  }

  const existingTag = await db.article_tags.findOne({
    where: {
      lowercase_name: lowercase_name,
    },
  });

  if (existingTag) {
    return res.status(409).json({
      message: "Tag already exists.",
      success: false,
    });
  }

  let imageUrl = null;
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
    if (uploadedImage?.url) {
      imageUrl = uploadedImage.url;
    }
  }

  const newTag = await db.article_tags.create({
    article_tag_id: uuidv4(),
    type,
    name,
    lowercase_name,
    description,
    image: imageUrl,
  });

  res.status(201).json({
    message: "Tag created successfully.",
    success: true,
    data: newTag,
  });
});

const updateArticleTag = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, name, description } = req.body;
  const { file } = req;

  if (!id) {
    return res.status(400).json({
      message: "Tag id is required.",
      success: false,
    });
  }

  const lowercase_name = name ? name.toLowerCase().replace(/\s/g, "-") : null;

  const existingTag = await db.article_tags.findOne({
    where: {
      article_tag_id: id,
    },
  });

  if (!existingTag) {
    return res.status(404).json({
      message: "Tag not found.",
      success: false,
    });
  }

  const tagByName = await db.article_tags.findOne({
    where: {
      lowercase_name: lowercase_name,
    },
  });

  if (
    tagByName &&
    lowercase_name &&
    tagByName.lowercase_name !== existingTag.lowercase_name
  ) {
    return res.status(409).json({
      message: "Tag name already exists.",
      success: false,
    });
  }
  let imageUrl = existingTag.image;
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
    if (uploadedImage?.url) {
      imageUrl = uploadedImage.url;
    }
  }

  existingTag.description = description || existingTag.description;
  existingTag.image = imageUrl || existingTag.image;
  existingTag.type = type || existingTag.type;
  existingTag.name = name || existingTag.name;
  existingTag.lowercase_name = lowercase_name || existingTag.lowercase_name;

  const tag = await existingTag.save();

  res.status(200).json({
    message: "Tag updated successfully.",
    success: true,
    data: tag,
  });
});

const deleteArticleTag = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tag = await db.article_tags.findByPk(id);
  if (!tag) {
    return res.status(404).json({
      message: "Tag not found.",
      success: false,
    });
  }

      // Soft delete the tag
    await tag.destroy();
  res.status(200).json({
    message: "Tag deleted successfully.",
    success: true,
  });
});

const getArticleTags = asyncHandler(async (req, res) => {
  const { type } = req.query;

  const whereClause = type ? { type } : {};

  const tags = await db.article_tags.findAll({
    where: whereClause,
    attributes: [
      "article_tag_id",
      "type",
      "name",
      "lowercase_name",
      "image",
      "description",
    ],
    include: [
      {
        model: db.article_topics,
        as: "topics",
        attributes: ["article_topic_id", "topic", "lowercase_topic"],
      },
    ],
  });
  res.status(200).json({
    message: "Tags fetched successfully.",
    success: true,
    data: tags,
  });
});

module.exports = {
  createArticleTag,
  updateArticleTag,
  deleteArticleTag,
  getArticleTags,
};
