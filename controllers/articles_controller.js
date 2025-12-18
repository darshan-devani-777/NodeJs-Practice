const { db } = require("../models/dbconfig");
const { Op } = require("sequelize");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const getArticle = asyncHandler(async (req, res) => {
  try {
    const article = await db.articles.findOne({
      where: { article_id: req.params.article_id },
      include: [
        {
          as: "topic",
          model: db.article_topics,
          attributes: ["article_topic_id", "topic", "lowercase_topic"],
          include: {
            as: "tag",
            model: db.article_tags,
            attributes: ["article_tag_id", "name", "type", "lowercase_name"],
          },
        },
        {
          as: "user",
          model: db.users,
          attributes: ["user_id", "first_name", "last_name"],
        },
      ],
    });

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
        success: false,
        data: null,
      });
    }

    res.status(200).json({
      message: "Article fetched successfully!",
      success: true,
      data: article,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while fetching article.",
      success: false,
      data: null,
    });
  }
});

const listArticles = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const topic = req.query.topic?.toLowerCase() || "";
  const tag = req.query.tag?.toLowerCase() || "";
  const type = req.query.type || "";

  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    let whereCondition = {};
    let topicIncludeWhere = {};
    let tagIncludeWhere = {};

    if (type) {
      tagIncludeWhere.type = type; // 'type' belongs to article_tags
    }

    if (topic) {
      topicIncludeWhere.lowercase_topic = topic;
    }

    if (tag) {
      tagIncludeWhere.lowercase_name = tag;
    }

    const articles = await db.articles.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: db.article_topics,
          as: "topic",
          attributes: ["article_topic_id", "topic", "lowercase_topic"],
          required: !!topic || !!tag || !!type, // required if any sub-filter applies
          where: Object.keys(topicIncludeWhere).length
            ? topicIncludeWhere
            : undefined,
          include: [
            {
              model: db.article_tags,
              as: "tag",
              attributes: ["article_tag_id", "name", "type", "lowercase_name"],
              required: !!tag || !!type, // required if filtering on tag or type
              where: Object.keys(tagIncludeWhere).length
                ? tagIncludeWhere
                : undefined,
            },
          ],
        },
        {
          model: db.users,
          as: "user",
          attributes: ["user_id", "first_name", "last_name"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Articles fetched successfully!",
      success: true,
      data: articles,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return res.status(500).json({
      error: error.message ?? "Something went wrong while fetching articles.",
      success: false,
      data: [],
    });
  }
});

const getArticles = asyncHandler(async (req, res) => {
  try {
    let sort_column = req.query.sort_column || "createdAt";
    let sort_order = req.query.sort_order || "desc";
    let condition = {};
    let search = "";

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Validate sort_order
    if (!["asc", "desc"].includes(sort_order.toLowerCase())) {
      sort_order = "desc";
    }

    // Validate sort_column
    const allowedSortColumns = [
      "article_id",
      "title",
      "createdAt",
      "type",
      "topic",
      "tag_name",
      "first_name",
      "last_name",
    ];
    if (!allowedSortColumns.includes(sort_column)) {
      sort_column = "createdAt";
    }

    // Search in title, content, topic, and tag
    search = req.query.search ? `%${req.query.search}%` : "";
    if (search !== "") {
      condition = {
        [Op.or]: [
          { title: { [Op.like]: search } },
          { content: { [Op.like]: search } },
          { "$topic.topic$": { [Op.like]: search } },
          { "$topic.lowercase_topic$": { [Op.like]: search } },
          { "$topic.tag.name$": { [Op.like]: search } },
        ],
      };
    }

    // Sorting (handle nested relations)
    let orderClause;
    switch (sort_column) {
      case "type":
        orderClause = [["topic", "tag", "type", sort_order]];
        break;
      case "tag_name":
        orderClause = [["topic", "tag", "name", sort_order]];
        break;
      case "topic":
        orderClause = [["topic", "topic", sort_order]];
        break;
      case "first_name":
        orderClause = [["user", "first_name", sort_order]];
        break;
      case "last_name":
        orderClause = [["user", "last_name", sort_order]];
        break;
      default:
        orderClause = [[sort_column, sort_order]];
    }

    // Fetch data with associations
    let data = await db.articles.findAndCountAll({
      where: condition,
      include: [
        {
          as: "user",
          model: db.users,
          attributes: ["user_id", "first_name", "last_name"],
        },
        {
          as: "topic",
          model: db.article_topics,
          attributes: ["article_topic_id", "topic", "lowercase_topic"],
          include: {
            as: "tag",
            model: db.article_tags,
            attributes: ["article_tag_id", "name", "type", "lowercase_name"],
          },
        },
      ],
      order: orderClause,
      limit,
      offset,
    });

    if (data && data.rows.length && data.count) {
      data = JSON.parse(JSON.stringify(data));
      const totalPages = Math.ceil(data.count / limit);

      return res.status(200).json({
        message: "Articles fetched successfully!",
        success: true,
        data: {
          pagination: {
            current_page: page,
            total_pages: totalPages,
            total_items: data.count,
            items_per_page: limit,
            has_next_page: page < totalPages,
            has_prev_page: page > 1,
          },
          articles: data.rows,
        },
      });
    } else {
      return res.status(200).json({
        message: "No articles found!",
        success: true,
        data: {
          pagination: {
            current_page: page,
            total_pages: 0,
            total_items: 0,
            items_per_page: limit,
            has_next_page: false,
            has_prev_page: false,
          },
          articles: [],
        },
      });
    }
  } catch (error) {
    console.error("Error fetching articles:", error);
    return res.status(500).json({
      success: false,
      message: error.message ?? "Something went wrong while fetching Articles.",
      data: null,
    });
  }
});

const createArticle = asyncHandler(async (req, res) => {
  const { title, content, article_topic_id } = req.body;
  const { file } = req;

  try {
    const { user_id } = req.user;

    // Validation
    if (!user_id) {
      return res.status(403).json({
        message: "User is required",
        success: false,
        data: [],
      });
    }

    if (!title || !content || !article_topic_id) {
      return res.status(400).json({
        message: "Title, content, and article_topic_id are required.",
        success: false,
        data: [],
      });
    }

    // Check duplicate article title by same user
    const existingArticle = await db.articles.findOne({
      where: { title, posted_by: user_id, deleted_at: null },
    });

    if (existingArticle) {
      return res.status(400).json({
        message: "An article with this title already exists.",
        success: false,
        data: [],
      });
    }

    // Validate topic
    const topic = await db.article_topics.findByPk(article_topic_id);
    if (!topic) {
      return res.status(404).json({
        message: "Invalid article_topic_id",
        success: false,
        data: [],
      });
    }

    let articleImageUrl = "";

    // Handle image upload properly (diskStorage)
    if (file && file.path) {
      if (file.size > 20 * 1024 * 1024) {
        return res.status(400).json({
          message: "File size exceeded! Max 20MB allowed.",
          success: false,
        });
      }

      const uploadedImage = await uploadOnCloudinary(file.path, "image");

      if (uploadedImage?.url) {
        articleImageUrl = uploadedImage.url;
      }

      // Delete temp file after upload
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    // Create new article
    const newArticle = await db.articles.create({
      posted_by: user_id,
      title,
      content,
      image: articleImageUrl,
      article_topic_id,
    });

    // Fetch article with associations
    const articleWithAssociations = await db.articles.findByPk(
      newArticle.article_id,
      {
        include: [
          {
            as: "topic",
            model: db.article_topics,
            attributes: ["article_topic_id", "topic", "lowercase_topic"],
            include: {
              as: "tag",
              model: db.article_tags,
              attributes: ["article_tag_id", "name", "type"],
            },
          },
          {
            as: "user",
            model: db.users,
            attributes: ["user_id", "first_name", "last_name"],
          },
        ],
      }
    );

    res.status(201).json({
      message: "Article created successfully!",
      success: true,
      data: articleWithAssociations,
    });
  } catch (error) {
    console.error("❌ createArticle error:", error);
    return res.status(500).json({
      message: error.message || "Something went wrong while creating article.",
      success: false,
      data: [],
    });
  }
});

const updateArticle = asyncHandler(async (req, res) => {
  const { article_id } = req.params;
  const { title, content, article_topic_id } = req.body;
  const { file } = req;

  try {
    const { user_id } = req.user;

    // Validate user
    const user = await db.users.findByPk(user_id);
    if (!user) {
      return res.status(400).json({
        error: "User not found",
        success: false,
        data: [],
      });
    }

    if (!article_id) {
      return res.status(400).json({
        error: "Please provide Article ID to edit",
        success: false,
        data: [],
      });
    }

    // Validate article existence
    const article = await db.articles.findByPk(article_id);
    if (!article) {
      return res.status(404).json({
        error: "Article not found",
        success: false,
        data: [],
      });
    }

    // Authorization check
    if (article.posted_by !== user.user_id) {
      return res.status(401).json({
        error: "Unauthorized! Cannot update this article.",
        success: false,
        data: [],
      });
    }

    // Validate topic if provided
    if (article_topic_id) {
      const topic = await db.article_topics.findByPk(article_topic_id);
      if (!topic) {
        return res.status(404).json({
          message: "Invalid article_topic_id",
          success: false,
          data: [],
        });
      }
      article.article_topic_id = article_topic_id;
    }

    // Duplicate title check
    if (title && title !== article.title) {
      const existingArticle = await db.articles.findOne({
        where: {
          title,
          posted_by: user_id,
          deleted_at: null,
        },
      });

      if (existingArticle) {
        return res.status(400).json({
          message: "You already have an article with this title.",
          success: false,
          data: [],
        });
      }

      article.title = title;
    }

    if (content) article.content = content;

    // Handle image upload properly
    if (file && file.path) {
      if (file.size > 20 * 1024 * 1024) {
        return res.status(400).json({
          message: "File size exceeded! Max 20MB allowed.",
          success: false,
        });
      }

      const uploadedImage = await uploadOnCloudinary(file.path, "image");

      if (uploadedImage?.url) {
        // delete old image if exists
        if (article.image) {
          await deleteFromCloudinary(article.image);
        }
        article.image = uploadedImage.url;
      }

      // Clean up temp file
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    // Save changes
    await article.save();

    // Fetch with associations
    const updatedArticle = await db.articles.findByPk(article_id, {
      include: [
        {
          as: "topic",
          model: db.article_topics,
          attributes: ["article_topic_id", "topic", "lowercase_topic"],
          include: {
            as: "tag",
            model: db.article_tags,
            attributes: ["article_tag_id", "name", "type"],
          },
        },
        {
          as: "user",
          model: db.users,
          attributes: ["user_id", "first_name", "last_name"],
        },
      ],
    });

    res.status(200).json({
      message: "Article updated successfully!",
      success: true,
      data: updatedArticle,
    });
  } catch (error) {
    console.error("❌ updateArticle error:", error);
    return res.status(500).json({
      error: error.message ?? "Something went wrong while updating article.",
      success: false,
      data: [],
    });
  }
});

const deleteArticle = asyncHandler(async (req, res) => {
  const { article_id } = req.params;

  try {
    const { user_id } = req.user;

    // Validate article ID
    if (!article_id) {
      return res.status(400).json({
        error: "Article ID is required",
        success: false,
        data: [],
      });
    }

    // Fetch article
    const article = await db.articles.findByPk(article_id);

    if (!article) {
      return res.status(404).json({
        error: "Article not found",
        success: false,
        data: [],
      });
    }

    // Authorization check
    if (article.posted_by !== user_id) {
      return res.status(403).json({
        error: "Unauthorized! You cannot delete this article.",
        success: false,
        data: [],
      });
    }

    // Delete related data (optional but recommended)
    await db.article_likes?.destroy({ where: { article_id } });
    await db.article_comments?.destroy({ where: { article_id } });
    await db.article_bookmarks?.destroy({ where: { article_id } });

    // Delete image from Cloudinary if it exists
    if (article.image) {
      try {
        await deleteImageOnCloudinary(article.image);
      } catch (err) {
        console.warn("⚠️ Failed to delete Cloudinary image:", err.message);
      }
    }

    // Soft delete (if paranoid: true in model)
    await article.destroy();

    res.status(200).json({
      message: "Article deleted successfully!",
      success: true,
      data: {
        article_id: article_id,
        deleted_by: user_id,
      },
    });
  } catch (error) {
    console.error("❌ deleteArticle error:", error);
    return res.status(500).json({
      error: error.message || "Something went wrong while deleting the article.",
      success: false,
      data: [],
    });
  }
});

// Admin function to get soft-deleted articles
const getDeletedArticles = asyncHandler(async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.is_admin) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
        success: false,
      });
    }

    const deletedArticles = await db.articles.findAll({
      where: {},
      paranoid: false, // Include soft-deleted records
      order: [["deletedAt", "DESC"]],
      include: [
        {
          model: db.article_topics,
          as: "topic",
          attributes: ["article_topic_id", "topic"],
          include: [
            {
              model: db.article_tags,
              as: "tag",
              attributes: ["article_tag_id", "name", "type"],
            },
          ],
        },
        {
          model: db.users,
          as: "user",
          attributes: ["user_id", "first_name", "last_name", "email"],
        },
      ],
    });

    return res.status(200).json({
      message: "Deleted articles fetched successfully.",
      success: true,
      data: deletedArticles,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Failed to fetch deleted articles.",
      success: false,
    });
  }
});

// Admin function to restore soft-deleted article
const restoreArticle = asyncHandler(async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.is_admin) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
        success: false,
      });
    }

    const { article_id } = req.params;

    if (!article_id) {
      return res.status(400).json({
        message: "Article ID is required.",
        success: false,
      });
    }

    const deletedArticle = await db.articles.findOne({
      where: { article_id },
      paranoid: false, // Include soft-deleted records
    });

    if (!deletedArticle) {
      return res.status(404).json({
        message: "Deleted article not found.",
        success: false,
      });
    }

    if (!deletedArticle.deletedAt) {
      return res.status(400).json({
        message: "Article is not deleted.",
        success: false,
      });
    }

    // Restore the article
    await deletedArticle.restore();

    return res.status(200).json({
      message: "Article restored successfully.",
      success: true,
      data: {
        article_id: deletedArticle.article_id,
        title: deletedArticle.title,
        restored_at: new Date(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Failed to restore article.",
      success: false,
    });
  }
});

module.exports = {
  getArticle,
  listArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticles,
  getDeletedArticles,
  restoreArticle,
};
