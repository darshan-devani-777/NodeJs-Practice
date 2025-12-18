const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { db } = require("../models/dbconfig");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");

// FETCH COURSES
const fetchCourses = asyncHandler(async (req, res) => {
  try {
    const user = await db.users.findOne({
      where: { user_id: req.user.user_id },
    });

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sort_column = req.query.sort_column || "created_at";
    const sort_order = ["asc", "desc"].includes(
      req.query.sort_order?.toLowerCase()
    )
      ? req.query.sort_order
      : "asc";

    const search = req.query.search ? `%${req.query.search}%` : "";
    let whereCondition = {};

    if (search !== "") {
      const isNumeric = !isNaN(req.query.search);
      whereCondition = {
        [Op.or]: [
          { title: { [Op.like]: search } },
          { subtitle: { [Op.like]: search } },
          { description: { [Op.like]: search } },
          { additional_info: { [Op.like]: search } },
          ...(isNumeric
            ? [{ price: { [Op.like]: `${parseFloat(req.query.search)}%` } }]
            : []),
        ],
      };
    }

    const { count, rows: courses } = await db.courses.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: db.course_chapters,
          as: "chapters",
          attributes: [
            "chapter_id",
            "title",
            "description",
            "order",
            "video_url",
            "video_name",
          ],
          include: [
            {
              model: db.chapter_topics,
              as: "topics",
              attributes: ["topic_id", "title", "description", "order"],
              include: [
                {
                  model: db.topic_subtopics,
                  as: "subtopics",
                  attributes: ["subtopic_id", "title", "content", "order"],
                },
              ],
            },
          ],
        },
        {
          model: db.coupons,
          as: "coupons",
          required: false,
        },
      ],
      order: [
        [sort_column, sort_order],
        [{ model: db.course_chapters, as: "chapters" }, "order", "ASC"],
        [
          { model: db.course_chapters, as: "chapters" },
          { model: db.chapter_topics, as: "topics" },
          "order",
          "ASC",
        ],
        [
          { model: db.course_chapters, as: "chapters" },
          { model: db.chapter_topics, as: "topics" },
          { model: db.topic_subtopics, as: "subtopics" },
          "order",
          "ASC",
        ],
      ],
      limit,
      offset,
    });

    const formattedCourses = courses.map((course) => ({
      course_id: course.course_id,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      additional_info: course.additional_info,
      thumbnail: course.thumbnail,
      price: course.price,
      coupon: course.coupons || null,
      chapters: course.chapters.map((chapter) => ({
        chapter_id: chapter.chapter_id,
        title: chapter.title,
        description: chapter.description,
        order: chapter.order,
        video_url: chapter.video_url,
        video_name: chapter.video_name,
        topics: chapter.topics.map((topic) => ({
          topic_id: topic.topic_id,
          title: topic.title,
          description: topic.description,
          order: topic.order,
          subtopics: topic.subtopics.map((sub) => ({
            subtopic_id: sub.subtopic_id,
            title: sub.title,
            content: sub.content,
            order: sub.order,
          })),
        })),
      })),
    }));

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      message: "Courses fetched successfully!",
      success: true,
      data: {
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_items: count,
          items_per_page: limit,
          has_next_page: page < totalPages,
          has_prev_page: page > 1,
        },
        courses: formattedCourses,
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({
      success: false,
      message: error.message ?? "Something went wrong while fetching courses.",
      data: null,
    });
  }
});

// Fetch SINGLE COURSE
const fetchSingleCourse = asyncHandler(async (req, res) => {
  const { course_id } = req.params;

  try {
    if (!course_id) {
      return res
        .status(400)
        .json({ success: false, message: "Course id is required" });
    }

    const user = await db.users.findOne({
      where: { user_id: req.user.user_id },
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const course = await db.courses.findOne({
      where: { course_id },
      include: [
        {
          model: db.coupons,
          as: "coupons",
          attributes: ["coupon_id", "coupon_name", "discount"],
        },
        {
          model: db.course_chapters,
          as: "chapters",
          attributes: [
            "chapter_id",
            "title",
            "description",
            "order",
            "video_url",
            "video_name",
          ],
          include: [
            {
              model: db.chapter_topics,
              as: "topics",
              attributes: ["topic_id", "title", "description", "order"],
              include: [
                {
                  model: db.topic_subtopics,
                  as: "subtopics",
                  attributes: ["subtopic_id", "title", "content", "order"],
                },
              ],
            },
          ],
        },
      ],
      order: [
        [{ model: db.course_chapters, as: "chapters" }, "order", "ASC"],
        [
          { model: db.course_chapters, as: "chapters" },
          { model: db.chapter_topics, as: "topics" },
          "order",
          "ASC",
        ],
        [
          { model: db.course_chapters, as: "chapters" },
          { model: db.chapter_topics, as: "topics" },
          { model: db.topic_subtopics, as: "subtopics" },
          "order",
          "ASC",
        ],
      ],
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const formattedCourse = {
      course_id: course.course_id,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      additional_info: course.additional_info,
      thumbnail: course.thumbnail,
      price: course.price,
      coupon: course.coupons || null,
      chapters: course.chapters.map((chapter) => ({
        chapter_id: chapter.chapter_id,
        title: chapter.title,
        description: chapter.description,
        order: chapter.order,
        video_url: chapter.video_url,
        video_name: chapter.video_name,
        topics: chapter.topics.map((topic) => ({
          topic_id: topic.topic_id,
          title: topic.title,
          description: topic.description,
          order: topic.order,
          subtopics: topic.subtopics.map((sub) => ({
            subtopic_id: sub.subtopic_id,
            title: sub.title,
            content: sub.content,
            order: sub.order,
          })),
        })),
      })),
    };

    return res.status(200).json({
      success: true,
      message: "Course fetched successfully!",
      data: formattedCourse,
    });
  } catch (error) {
    console.error("Error fetching single course:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while fetching course.",
    });
  }
});

// CREATE COURSE
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, price, subtitle, additional_info, coupon_id } =
    req.body;

  if (!title || !description || !price) {
    return res
      .status(400)
      .json({ message: "Title, description, and price are required" });
  }

  let thumbnailUrl = "";
  if (req.file) {
    const uploadRes = await uploadOnCloudinary(req.file.path, "image");
    thumbnailUrl = uploadRes?.url || "";
  }

  const newCourse = await db.courses.create({
    title,
    subtitle,
    description,
    additional_info,
    price,
    coupon_id,
    thumbnail: thumbnailUrl,
  });

  res.status(201).json({
    success: true,
    message: "Course created successfully!",
    data: newCourse,
  });
});

// UPDATE COURSE
const updateCourse = asyncHandler(async (req, res) => {
  const { course_id } = req.params;

  try {
    const { user_id } = req.user;
    const user = await db.users.findByPk(user_id);
    if (!user || !user.is_admin) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized: Admin only" });
    }

    const course = await db.courses.findByPk(course_id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const bodyData = req.body || {};

    const updatedData = {
      title: bodyData.title ?? course.title,
      subtitle: bodyData.subtitle ?? course.subtitle,
      description: bodyData.description ?? course.description,
      additional_info: bodyData.additional_info ?? course.additional_info,
      price: bodyData.price ?? course.price,
    };

    if (req.file) {
      const uploadRes = await uploadOnCloudinary(req.file.path, "image");
      if (uploadRes?.url) {
        if (course.thumbnail)
          await deleteFromCloudinary(course.thumbnail, "image");
        updatedData.thumbnail = uploadRes.url;
      }
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }

    const [affectedRows] = await db.courses.update(updatedData, {
      where: { course_id },
    });

    if (affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields were updated. Check input values.",
      });
    }

    const updatedCourse = await db.courses.findByPk(course_id);
    return res.status(200).json({
      success: true,
      message: "Course updated successfully!",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while updating course",
    });
  }
});

// DELETE COURSE
const deleteCourse = asyncHandler(async (req, res) => {
  const { course_id } = req.params;

  try {
    const course = await db.courses.findByPk(course_id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
        data: [],
      });
    }

    const deletedCourse = course.toJSON();

    await course.destroy();

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully!",
      data: [deletedCourse],
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while deleting course",
      data: [],
    });
  }
});

// Admin function to get soft-deleted courses
const getDeletedCourses = asyncHandler(async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.is_admin) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
        success: false,
      });
    }

    const deletedCourses = await db.courses.findAll({
      where: {},
      paranoid: false, // Include soft-deleted records
      order: [["deletedAt", "DESC"]],
      include: [
        {
          model: db.coupons,
          as: "coupons",
          attributes: ["coupon_id", "coupon_name", "discount"],
        },
      ],
    });

    return res.status(200).json({
      message: "Deleted courses fetched successfully.",
      success: true,
      data: deletedCourses,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Failed to fetch deleted courses.",
      success: false,
    });
  }
});

// RESTORE COURSE
const restoreCourse = asyncHandler(async (req, res) => {
  const { course_id } = req.params;
  const course = await db.courses.findOne({
    where: { course_id },
    paranoid: false,
  });
  if (!course) return res.status(404).json({ message: "Course not found" });

  await course.restore();
  res
    .status(200)
    .json({ success: true, message: "Course restored successfully!" });
});

// CREATE CHAPTER
const createChapter = asyncHandler(async (req, res) => {
  let { course_id, title, description, order } = req.body;

  if (!course_id || !title || !description || !order) {
    return res.status(400).json({
      success: false,
      message: "All fields (course_id, title, description, order) are required",
    });
  }

  let videoUrl = "";
  let videoName = "";
  if (req.file) {
    const uploadRes = await uploadOnCloudinary(req.file.path, "video");
    if (uploadRes?.url) {
      videoUrl = uploadRes.url;
      videoName = req.file.originalname;
    }
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  }

  const chapter = await db.course_chapters.create({
    course_id,
    title,
    description,
    order,
    video_url: videoUrl,
    video_name: videoName,
  });

  res.status(201).json({
    success: true,
    message: "Chapter created successfully!",
    data: chapter,
  });
});

// UPDATE CHAPTER
const updateChapter = asyncHandler(async (req, res) => {
  const { chapter_id } = req.params;
  let { title, description, order } = req.body || {};

  try {
    const chapter = await db.course_chapters.findByPk(chapter_id);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    if (typeof description === "string") {
      description = description
        .trim()
        .replace(/^"|"$/g, "")
        .replace(/\\"/g, '"')
        .replace(/\\n/g, "\n");
    }

    if (typeof title === "string") title = title.trim();

    const updatedData = {
      title: title ?? chapter.title,
      description: description ?? chapter.description,
      order: order ?? chapter.order,
    };

    if (req.file) {
      const uploadRes = await uploadOnCloudinary(req.file.path, "video");

      if (uploadRes?.url) {
        if (chapter.video_url)
          await deleteFromCloudinary(chapter.video_url, "video");
        updatedData.video_url = uploadRes.url;
        updatedData.video_name = req.file.originalname;
      }

      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }

    const [affected] = await db.course_chapters.update(updatedData, {
      where: { chapter_id },
    });

    if (affected === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields were updated. Check input values.",
      });
    }

    const updatedChapter = await db.course_chapters.findByPk(chapter_id);

    return res.status(200).json({
      success: true,
      message: "Chapter updated successfully!",
      data: updatedChapter,
    });
  } catch (error) {
    console.error("Error updating chapter:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while updating chapter",
    });
  }
});

// DELETE CHAPTER
const deleteChapter = asyncHandler(async (req, res) => {
  try {
    const { chapter_id } = req.params;

    const chapter = await db.course_chapters.findByPk(chapter_id);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
        data: [],
      });
    }

    const deletedChapter = chapter.toJSON();

    await chapter.destroy();

    return res.status(200).json({
      success: true,
      message: "Chapter deleted successfully!",
      data: deletedChapter,
    });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while deleting chapter",
    });
  }
});

// CREATE CHAPTER TOPICS
const createChapterTopics = async (req, res) => {
  try {
    let { chapter_id, topics } = req.body;

    if (typeof topics === "string") {
      try {
        topics = JSON.parse(topics);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format in topics field",
        });
      }
    }

    if (!chapter_id || !Array.isArray(topics)) {
      return res.status(400).json({
        success: false,
        message: "chapter_id and topics (array) are required",
      });
    }

    const chapter = await db.course_chapters.findByPk(chapter_id);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    const createdTopics = [];

    for (const topicData of topics) {
      const { title, description, order, subtopics } = topicData;

      const topic = await db.chapter_topics.create({
        chapter_id,
        title,
        description,
        order,
      });

      if (subtopics && Array.isArray(subtopics)) {
        for (const sub of subtopics) {
          await db.topic_subtopics.create({
            topic_id: topic.topic_id,
            title: sub.title,
            content: sub.content,
            order: sub.order,
          });
        }
      }

      const topicWithSubtopics = await db.chapter_topics.findOne({
        where: { topic_id: topic.topic_id },
        include: [{ model: db.topic_subtopics, as: "subtopics" }],
      });

      createdTopics.push(topicWithSubtopics);
    }

    return res.status(201).json({
      success: true,
      message: "Topics created successfully",
      data: createdTopics,
    });
  } catch (err) {
    console.error("Error creating topics:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// UPDATE CHAPTER TOPICS
const updateChapterTopic = async (req, res) => {
  try {
    const { topic_id } = req.params;
    let { title, description, order, subtopics } = req.body;

    if (!topic_id) {
      return res.status(400).json({
        success: false,
        message: "topic_id is required",
      });
    }

    if (typeof subtopics === "string") {
      try {
        subtopics = JSON.parse(subtopics);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for subtopics",
        });
      }
    }

    const topic = await db.chapter_topics.findByPk(topic_id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    await topic.update({ title, description, order });

    if (Array.isArray(subtopics)) {
      for (const sub of subtopics) {
        if (sub.subtopic_id) {
          const existing = await db.topic_subtopics.findByPk(sub.subtopic_id);
          if (existing) {
            await existing.update({
              title: sub.title,
              content: sub.content,
              order: sub.order,
            });
          }
        } else {
          await db.topic_subtopics.create({
            topic_id,
            title: sub.title,
            content: sub.content,
            order: sub.order,
          });
        }
      }
    }

    const updatedTopic = await db.chapter_topics.findOne({
      where: { topic_id },
      include: [{ model: db.topic_subtopics, as: "subtopics" }],
    });

    return res.status(200).json({
      success: true,
      message: "Topic updated successfully",
      data: updatedTopic,
    });
  } catch (err) {
    console.error("Error updating topic:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// DELETE CHAPTER TOPICS
const deleteChapterTopic = async (req, res) => {
  try {
    const { topic_id } = req.params;

    if (!topic_id) {
      return res.status(400).json({
        success: false,
        message: "topic_id is required",
      });
    }

    const topic = await db.chapter_topics.findByPk(topic_id, {
      include: [{ model: db.topic_subtopics, as: "subtopics" }],
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    const deletedData = {
      topic_id: topic.topic_id,
      title: topic.title,
      description: topic.description,
      order: topic.order,
      subtopics: topic.subtopics.map((sub) => ({
        subtopic_id: sub.subtopic_id,
        title: sub.title,
        content: sub.content,
        order: sub.order,
      })),
    };

    await db.topic_subtopics.destroy({ where: { topic_id } });

    await topic.destroy();

    return res.status(200).json({
      success: true,
      message: "Topic and its subtopics deleted successfully",
      deleted: deletedData,
    });
  } catch (err) {
    console.error("Error deleting topic:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  fetchSingleCourse,
  getDeletedCourses,
  restoreCourse,
  createChapter,
  updateChapter,
  deleteChapter,
  createChapterTopics,
  updateChapterTopic,
  deleteChapterTopic,
};
