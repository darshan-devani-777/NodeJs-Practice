const { v4: uuidv4 } = require("uuid");
const { db } = require("../models/dbconfig");
const { asyncHandler } = require("../utils/asyncHandler");

// CREATE topic
const createArticleTopic = asyncHandler(async (req, res) => {
  try {
    const { topic, article_tag_id } = req.body;

    if (!topic || !article_tag_id) {
      return res.status(400).json({
        message: "Topic name and tag ID are required.",
        success: false,
      });
    }

    const lowercase_topic = topic.toLowerCase().replace(/\s/g, "-");
    const existingTopic = await db.article_topics.findOne({
      where: {
        lowercase_topic: lowercase_topic,
        article_tag_id: article_tag_id,
      },
    });

    if (existingTopic) {
      return res.status(409).json({
        message: "Topic already exists.",
        success: false,
      });
    }

    const tagExists = await db.article_tags.findByPk(article_tag_id);
    if (!tagExists) {
      return res.status(404).json({
        message: "Related tag not found.",
        success: false,
      });
    }

    const newTopic = await db.article_topics.create({
      article_topic_id: uuidv4(),
      topic,
      article_tag_id,
      lowercase_topic,
    });

    res.status(201).json({
      message: "Topic created successfully.",
      success: true,
      data: newTopic,
    });
  } catch (error) {
    console.error("Error creating article topic:", error);
    res.status(500).json({
      message: error.message ?? "An error occurred while creating the topic.",
      success: false,
    });
  }
});

// UPDATE topic
const updateArticleTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { topic, article_tag_id } = req.body;

  if (!topic || !article_tag_id) {
    return res.status(400).json({
      message: "Topic name and tag ID are required.",
      success: false,
    });
  }

  const existing = await db.article_topics.findByPk(id);
  if (!existing) {
    return res.status(404).json({
      message: "Topic not found.",
      success: false,
    });
  }

  const lowercase_topic = topic
    ? topic.toLowerCase().replace(/\s/g, "-")
    : null;

  if (lowercase_topic && existing.lowercase_topic !== lowercase_topic) {
    const existingTopic = await db.article_topics.findOne({
      where: {
        topic: lowercase_topic,
      },
    });
    if (existingTopic) {
      return res.status(409).json({
        message: "Topic already exists.",
        success: false,
      });
    }
  }

  const tagExists = await db.article_tags.findByPk(article_tag_id);
  if (!tagExists) {
    return res.status(404).json({
      message: "Related tag not found.",
      success: false,
    });
  }

  existing.topic = topic;
  existing.lowercase_topic = lowercase_topic || existing.lowercase_topic;
  existing.article_tag_id = article_tag_id;
  await existing.save();

  res.status(200).json({
    message: "Topic updated successfully.",
    success: true,
    data: existing,
  });
});

// DELETE topic
const deleteArticleTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const topic = await db.article_topics.findByPk(id);
  if (!topic) {
    return res.status(404).json({
      message: "Topic not found.",
      success: false,
    });
  }

      // Soft delete the topic
    await topic.destroy();
  res.status(200).json({
    message: "Topic deleted successfully.",
    success: true,
  });
});

const getArticleTopicsByTag = asyncHandler(async (req, res) => {
  const { tagId } = req.params;
  if (!tagId) {
    return res.status(400).json({
      message: "Tag ID is required.",
      success: false,
    });
  }
  const topics = await db.article_topics.findAll({
    where: {
      article_tag_id: tagId,
    },
    attributes: ["article_topic_id", "topic"],
    include: [
      {
        model: db.article_tags,
        as: "tag",
        attributes: [
          "article_tag_id",
          "type",
          "description",
          "image",
          "name",
          "lowercase_name",
        ],
      },
    ],
  });

  res.status(200).json({
    message: "Topics fetched successfully.",
    success: true,
    data: topics,
  });
});

const getArticleTopics = async (req, res) => {
  try {
    const { article_tag_id } = req.query;

    let whereClause = {};
    if (article_tag_id) {
      whereClause.article_tag_id = article_tag_id;
    }

    const topics = await db.article_topics.findAll({
      where: whereClause,
      include: [
        {
          model: db.article_tags,
          as: "tag",
        },
      ],
      order: [["topic", "ASC"]],
    });

    res.json({
      success: true,
      data: topics,
    });
  } catch (error) {
    console.error("Error fetching article topics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createArticleTopic,
  updateArticleTopic,
  deleteArticleTopic,
  getArticleTopics,
  getArticleTopicsByTag,
};
