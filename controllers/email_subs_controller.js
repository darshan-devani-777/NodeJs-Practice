const { db } = require("../models/dbconfig");
const { asyncHandler } = require("../utils/asyncHandler");

const listEmailTopics = asyncHandler(async (req, res) => {
  try {
    const topics = await db.email_topics.findAll({
      attributes: ["topic_id", "topic_type"],
      where: {},
      include: [
        {
          model: db.email_sub_topics,
          attributes: ["sub_topic_id", "sub_topic_type", "sub_topic_info"],
          as: "email_sub_topics",
        },
      ],
    });
    res.status(200).json({
      message: "Email subcription topics are fetched successfully!",
      success: true,
      data: topics,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while fetching email topics.",
      success: false,
      data: [],
    });
  }
});

module.exports = { listEmailTopics };
