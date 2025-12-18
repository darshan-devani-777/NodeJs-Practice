const { Sequelize, Op } = require("sequelize");
const { db, sequelize } = require("../models/dbconfig");
const { asyncHandler } = require("../utils/asyncHandler");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");

const listPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const sortBy = req.query.sortBy;
  /*
    sortBy:
     0 -> trending posts
     1 -> recent posts
     2 -> unanswered posts
  */
  const limit = 10;
  const offset = (page - 1) * limit;

  // safely read user_id (if user is authenticated)
  const user_id = req.user?.user_id || null;

  try {
    // sorting
    let order = [];
    if (sortBy !== undefined) {
      if (sortBy == 0) {
        // trending (by likes)
        order.push([
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM likes AS \`like\`
            WHERE \`like\`.post_id = posts.post_id
            AND \`like\`.deleted_at IS NULL
          )`),
          "DESC",
        ]);
      } else if (sortBy == 1) {
        // recent
        order.push(["createdAt", "DESC"]);
      } else if (sortBy == 2) {
        // unanswered (least comments first)
        order.push([
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM comments AS comment
            WHERE comment.post_id = posts.post_id
            AND comment.parent_id IS NULL
            AND comment.deleted_at IS NULL
          )`),
          "ASC",
        ]);
      } else {
        return res.status(400).json({
          message: "Invalid sortBy",
          success: false,
        });
      }
    }

    // main query
    const posts = await db.posts.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: db.tags,
          as: "tags",
          attributes: ["tag_id", "tag_name"],
        },
        {
          model: db.users,
          as: "user",
          attributes: ["first_name", "last_name", "profile_image"],
        },
        {
          model: db.likes,
          as: "likes",
          attributes: [],
          where: user_id ? { user_id } : undefined,
          required: false,
        },
        {
          model: db.bookmarks,
          as: "bookmarks",
          attributes: [],
          where: user_id ? { user_id } : undefined,
          required: false,
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM likes AS \`like\`
              WHERE \`like\`.post_id = posts.post_id
              AND \`like\`.deleted_at IS NULL
            )`),
            "likes_count",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM comments AS comment
              WHERE comment.post_id = posts.post_id
              AND comment.parent_id IS NULL
              AND comment.deleted_at IS NULL
            )`),
            "comments_count",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM likes AS \`like\`
              WHERE \`like\`.post_id = posts.post_id
              ${
                user_id
                  ? `AND \`like\`.user_id = ${sequelize.escape(user_id)}`
                  : ""
              }
              AND \`like\`.deleted_at IS NULL
            ) > 0`),
            "is_liked",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM bookmarks AS \`bookmark\`
              WHERE \`bookmark\`.post_id = posts.post_id
              ${
                user_id
                  ? `AND \`bookmark\`.user_id = ${sequelize.escape(user_id)}`
                  : ""
              }
              AND \`bookmark\`.deleted_at IS NULL
            ) > 0`),
            "is_bookmarked",
          ],
        ],
      },
      order: order.length ? order : [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Posts fetched successfully!",
      success: true,
      data: posts,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong while fetching posts.",
      success: false,
      data: [],
    });
  }
});

const getGroupPosts = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const { group_id, sortBy, tag_name } = req.query;
  const userId = req.user?.dataValues?.user_id || null;

  try {
    let groupIds = [];
    if (group_id) {
      groupIds = [group_id];
    } else {
      const followedGroups = await db.group_members.findAll({
        where: { user_id: userId },
        attributes: ["group_id"],
      });
      groupIds = followedGroups.map((fg) => fg.group_id);
    }

    let order = [];
    let engagementScore = Sequelize.literal(`(
      SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.post_id AND likes.deleted_at IS NULL
    ) + (
      SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.post_id AND parent_id IS NULL AND comments.deleted_at IS NULL
    )`);

    if (sortBy !== undefined && sortBy !== null) {
      if (sortBy == 0) {
        order.push(["createdAt", "DESC"]);
      } else if (sortBy == 1) {
        order.push([engagementScore, "DESC"]);
      } else {
        return res.status(400).json({
          message: "Invalid sortBy",
          success: false,
        });
      }
    } else {
      // Default sorting by engagement score if no sortBy is specified
      order.push([engagementScore, "DESC"]);
    }

    // Build where conditions
    const whereConditions = {
      group_id: groupIds,
    };

    // Add tag filtering if tag_name is provided
    if (tag_name && tag_name.trim()) {
      whereConditions["$tags.tag_name$"] = {
        [Sequelize.Op.like]: `%${tag_name.trim()}%`,
      };
    }

    const posts = await db.posts.findAndCountAll({
      attributes: [
        "post_id",
        "title",
        "content",
        "image",
        "group_id",
        "createdAt",
        [
          Sequelize.literal(
            `(SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.post_id AND likes.deleted_at IS NULL)`
          ),
          "likes_count",
        ],
        [engagementScore, "engagement_score"],
        [
          Sequelize.literal(`EXISTS (
            SELECT 1 FROM likes 
            WHERE likes.post_id = posts.post_id 
            AND likes.user_id = '${userId}' AND likes.deleted_at IS NULL
          )`),
          "is_liked",
        ],
        [
          Sequelize.literal(`(
            SELECT COUNT(*) FROM comments
            WHERE comments.post_id = posts.post_id AND comments.parent_id IS NULL AND comments.deleted_at IS NULL
          )`),
          "comments_count",
        ],
        [
          Sequelize.literal(`(
             SELECT COUNT(*) FROM bookmarks
             WHERE bookmarks.post_id = posts.post_id AND bookmarks.user_id = '${userId}' AND bookmarks.deleted_at IS NULL
           )`),
          "is_bookmarked",
        ],
        [
          Sequelize.literal(`(
             SELECT COUNT(*) FROM posts p
             WHERE p.post_id = posts.post_id AND p.posted_by = '${userId}' AND p.deleted_at IS NULL
           )`),
          "is_owner",
        ],
        [
          Sequelize.literal(`(
             SELECT COUNT(*) FROM bookmarks
             WHERE bookmarks.post_id = posts.post_id AND bookmarks.user_id = '${userId}' AND bookmarks.deleted_at IS NULL
           )`),
          "is_saved",
        ],
      ],
      where: whereConditions,
      limit,
      offset,
      order,
      distinct: true,
      include: [
        {
          model: db.tags,
          as: "tags",
          attributes: ["tag_id", "tag_name"],
        },
        {
          model: db.users,
          as: "user",
          attributes: ["user_id", "first_name", "last_name", "profile_image"],
        },
      ],
    });

    const totalPages = Math.ceil(posts.count / limit);

    res.status(200).json({
      message: "Posts fetched successfully!",
      success: true,
      data: {
        posts: posts.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: posts.count,
          items_per_page: limit,
          has_next_page: parseInt(page) < totalPages,
          has_prev_page: parseInt(page) > 1,
        },
        filter: {
          tag_name: tag_name || null,
          results_count: posts.rows.length,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while fetching posts.",
      success: false,
      data: {
        posts: [],
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_items: 0,
          items_per_page: 10,
          has_next_page: false,
          has_prev_page: false,
        },
      },
    });
  }
});

const getUserPosts = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.user_id) {
    return res.status(401).json({
      error: "Unauthorized: user is not authenticated",
      success: false,
      data: [],
    });
  }
  const page = req.query.page || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const { user_id } = req.user;
  try {
    const posts = await db.posts.findAndCountAll({
      where: {
        posted_by: user_id,
      },
      limit,
      offset,
      include: [
        {
          model: db.tags,
          as: "tags",
          attributes: ["tag_id", "tag_name"],
        },
      ],
    });

    res.status(200).json({
      message: "Posts fetched successfully!",
      success: true,
      data: posts,
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error.message ?? "Something went wrong while fetching communities.",
      success: false,
      data: [],
    });
  }
});

const getPostDetail = asyncHandler(async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user?.user_id;

    const post = await db.posts.findByPk(post_id, {
      include: [
        {
          model: db.tags,
          as: "tags",
          attributes: ["tag_id", "tag_name"],
        },
        {
          model: db.users,
          as: "user",
          attributes: ["first_name", "last_name", "profile_image", "user_id"],
        },
        {
          model: db.groups,
          as: "group",
          attributes: ["group_id", "title", "description", "is_public"],
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*) 
              FROM likes 
              WHERE likes.post_id = posts.post_id AND likes.deleted_at IS NULL
            )`),
            "likes_count",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) 
              FROM comments 
              WHERE comments.post_id = posts.post_id AND comments.parent_id IS NULL AND comments.deleted_at IS NULL
            )`),
            "comments_count",
          ],
          [
            sequelize.literal(`EXISTS (
              SELECT 1 FROM likes 
              WHERE likes.post_id = posts.post_id 
              AND likes.user_id = '${userId || ""}' AND likes.deleted_at IS NULL
            )`),
            "is_liked",
          ],
          [
            sequelize.literal(`EXISTS (
              SELECT 1 FROM bookmarks 
              WHERE bookmarks.post_id = posts.post_id 
              AND bookmarks.user_id = '${
                userId || ""
              }' AND bookmarks.deleted_at IS NULL
            )`),
            "is_bookmarked",
          ],
        ],
      },
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found.",
        success: false,
      });
    }

    const postJSON = post.toJSON();

    const normalizeBool = (val) => !!(val === true || val === 1 || val === "1");

    postJSON.is_liked = normalizeBool(postJSON.is_liked);
    postJSON.is_bookmarked = normalizeBool(postJSON.is_bookmarked);
    postJSON.is_saved = 0; // since saves table doesn't exist
    postJSON.is_owner = userId === postJSON.user?.user_id ? 1 : 0;
    postJSON.engagement_score =
      Number(postJSON.likes_count || 0) + Number(postJSON.comments_count || 0);

    // reorder keys (after group)
    const {
      likes_count,
      comments_count,
      is_liked,
      is_bookmarked,
      is_saved,
      is_owner,
      engagement_score,
      ...rest
    } = postJSON;

    const reorderedData = {
      ...rest,
      likes_count,
      engagement_score,
      is_liked: Number(is_liked),
      comments_count,
      is_bookmarked: Number(is_bookmarked),
      is_owner: Number(is_owner),
      is_saved: Number(is_saved),
    };

    return res.status(200).json({
      message: "Post details fetched successfully!",
      success: true,
      data: reorderedData,
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error.message ?? "Something went wrong while fetching post details.",
      success: false,
    });
  }
});

const createPost = asyncHandler(async (req, res) => {
  const { title, content, tag_id, group_id } = req.body;
  const { file } = req;

  try {
    const { user_id } = req.user || {};

    if (!user_id) {
      return res.status(403).json({
        message: "User is required",
        success: false,
        data: [],
      });
    }

    if (!group_id) {
      return res.status(400).json({
        message: "Group ID is required",
        success: false,
        data: [],
      });
    }

    if (!title || !content) {
      return res.status(400).json({
        message: "Post title and content are required",
        success: false,
        data: [],
      });
    }

    // Check for duplicate title 
    const existingPost = await db.posts.findOne({
      where: {
        title,
        posted_by: user_id, 
        deleted_at: null,
      },
    });

    if (existingPost) {
      return res.status(400).json({
        message: "A post with the same title already exists.",
        success: false,
        data: [],
      });
    }

    if (file?.size > 200 * 1024 * 1024) {
      return res.status(400).json({
        message: "File size must be less than 200MB",
        success: false,
        data: [],
      });
    }

    let postMediaUrl = "";
    let mediaType = "image";

    // Handle upload if file exists (disk storage)
    if (file && file.path) {
      const mediaPath = file.path;

      // Determine if it's an image or a video
      if (file.mimetype.startsWith("video/")) {
        mediaType = "video";
      } else if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          message: "Only image or video files are allowed",
          success: false,
        });
      }

      // Upload to Cloudinary
      const uploadedFile = await uploadOnCloudinary(mediaPath, mediaType);

      if (uploadedFile?.url) {
        postMediaUrl = uploadedFile.url;
      }

      // Delete local temp file after upload
      if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);
    }

    // Save post in DB
    const newPost = await db.posts.create({
      posted_by: user_id,
      title,
      content,
      tag_id,
      group_id,
      image: postMediaUrl,
      media_type: mediaType, // optional — ensure column exists
    });

    const postWithTags = await db.posts.findOne({
      where: { post_id: newPost.post_id },
      include: [
        {
          model: db.tags,
          as: "tags",
          attributes: ["tag_id", "tag_name"],
        },
      ],
    });

    res.status(201).json({
      message: "Post created successfully!",
      success: true,
      data: postWithTags,
    });
  } catch (error) {
    console.error("❌ createPost error:", error);
    return res.status(500).json({
      error: error.message || "Something went wrong while creating the post.",
      success: false,
      data: [],
    });
  }
});

const updatePost = asyncHandler(async (req, res) => {
  const { post_id } = req.params;
  const { title, content, tag_id } = req.body;
  const { file } = req;

  try {
    const { user_id } = req.user;
    const user = await db.users.findByPk(user_id);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const post = await db.posts.findByPk(post_id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.posted_by !== user.user_id) {
      return res
        .status(401)
        .json({ error: "Unauthorized! Cannot update post" });
    }

    // Update basic fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (tag_id) post.tag_id = tag_id;

    // Handle media upload (image or video)
    if (file && file.path) {
      const filePath = file.path;

      // Determine media type
      let mediaType = "image";
      if (file.mimetype.startsWith("video/")) {
        mediaType = "video";
      } else if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          message: "Only image or video files are allowed",
          success: false,
        });
      }

      if (file.size > 200 * 1024 * 1024) {
        return res.status(400).json({
          message: "File size exceeded (max 200MB)",
          success: false,
        });
      }

      // Upload new media to Cloudinary
      const uploadedMedia = await uploadOnCloudinary(filePath, mediaType);

      // Delete old media if exists
      if (post.image) {
        await deleteFromCloudinary(post.image, mediaType);
      }

      if (uploadedMedia && uploadedMedia.url) {
        post.image = uploadedMedia.url;
      }

      // Clean up temp file
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // Save updates
    await post.save();

    // Fetch updated post with tags
    const updatedPost = await db.posts.findOne({
      where: { post_id: post.post_id },
      include: [
        {
          model: db.tags,
          as: "tags",
          attributes: ["tag_id", "tag_name"],
        },
      ],
    });

    res.status(200).json({
      message: "Post updated successfully!",
      success: true,
      data: updatedPost,
    });
  } catch (error) {
    console.error("❌ updatePost error:", error);
    return res.status(500).json({
      error: error.message ?? "Something went wrong while updating post.",
      success: false,
      data: [],
    });
  }
});

const deletePost = asyncHandler(async (req, res) => {
  const { post_id } = req.params;

  try {
    const { user_id } = req.user;

    // Find the post
    const post = await db.posts.findByPk(post_id, {
      include: [
        {
          model: db.tags,
          as: "tags",
          attributes: ["tag_id", "tag_name"],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Authorization check
    if (post.posted_by !== user_id) {
      return res.status(401).json({
        message: "Unauthorized to delete this post",
        success: false,
      });
    }

    // Prepare deleted data (for response)
    const deletedPostData = {
      post_id: post.post_id,
      title: post.title,
      content: post.content,
      image: post.image,
      tag: post.tags || null,
      createdAt: post.createdAt,
    };

    // Delete media from Cloudinary if exists
    if (post.image) {
      const type = post.image.includes("/videos/") ? "video" : "image";
      await deleteFromCloudinary(post.image, type);
    }

    // Delete related records
    await db.bookmarks.destroy({ where: { post_id } });
    await db.comments.destroy({ where: { post_id } });
    await db.likes.destroy({ where: { post_id } });

    // Soft delete or hard delete
    if (db.posts.options.paranoid) {
      await post.destroy(); // soft delete
    } else {
      await post.destroy({ force: true }); // permanent delete
    }

    // Return deleted post details
    res.status(200).json({
      message: "Post deleted successfully!",
      success: true,
      deleted_post: deletedPostData,
    });
  } catch (error) {
    console.error("❌ deletePost error:", error);
    return res.status(500).json({
      error: error.message ?? "Something went wrong while deleting post.",
      success: false,
      data: [],
    });
  }
});

const reportPost = asyncHandler(async (req, res) => {
  const { post_id } = req.params;
  const { subject, bio } = req.body;

  if (!req.user?.user_id) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }

  const user_id = req.user.user_id;

  if (!subject || !bio) {
    return res
      .status(400)
      .json({ message: "Subject and message are required", success: false });
  }

  const post = await db.posts.findByPk(post_id);
  if (!post) {
    return res.status(404).json({ message: "Post not found", success: false });
  }

  const reason = `${subject}: ${bio}`;

  await db.reports.create({
    post_id,
    reported_by: user_id,
    reason,
  });

  return res.status(201).json({ message: "Post reported", success: true });
});

const getMyCreatedPosts = asyncHandler(async (req, res) => {
  const userId = req.user?.user_id;
  const {
    page = 1,
    limit = 10,
    search = "",
    sort_by = "createdAt",
    sort_order = "DESC",
  } = req.query;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }

  try {
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const whereConditions = {
      posted_by: userId,
    };

    if (search && String(search).trim()) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }

    let order = [];
    if (sort_by === "likes_count") {
      order.push([
        sequelize.literal(`(
          SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.post_id
        )`),
        sort_order,
      ]);
    } else if (sort_by === "comments_count") {
      order.push([
        sequelize.literal(`(
          SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.post_id AND comments.parent_id IS NULL
        )`),
        sort_order,
      ]);
    } else {
      order.push([sort_by, sort_order]);
    }

    const posts = await db.posts.findAndCountAll({
      where: whereConditions,
      limit: limitNumber,
      offset,
      order,
      attributes: [
        "post_id",
        "title",
        "content",
        "image",
        "group_id",
        "createdAt",
        [
          sequelize.literal(`(
            SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.post_id
          )`),
          "likes_count",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.post_id AND comments.parent_id IS NULL
          )`),
          "comments_count",
        ],
        [
          sequelize.literal(`EXISTS (
            SELECT 1 FROM likes WHERE likes.post_id = posts.post_id AND likes.user_id = '${userId}'
          )`),
          "is_liked",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*) FROM bookmarks WHERE bookmarks.post_id = posts.post_id AND bookmarks.user_id = '${userId}'
          )`),
          "is_bookmarked",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*) FROM posts p WHERE p.post_id = posts.post_id AND p.posted_by = '${userId}'
          )`),
          "is_owner",
        ],
      ],
      include: [
        {
          model: db.tags,
          as: "tags",
          attributes: ["tag_id", "tag_name"],
        },
        {
          model: db.groups,
          as: "group",
          attributes: ["group_id", "title", "description"],
        },
      ],
    });

    const normalizedPosts = posts.rows.map((postInstance) => {
      const p = postInstance.toJSON();
      p.is_liked = !!(
        p.is_liked === true ||
        p.is_liked === 1 ||
        p.is_liked === "1"
      );
      p.is_bookmarked = !!(
        p.is_bookmarked === true ||
        p.is_bookmarked === 1 ||
        p.is_bookmarked === "1"
      );
      p.is_owner = !!(
        p.is_owner === true ||
        p.is_owner === 1 ||
        p.is_owner === "1"
      );
      return p;
    });

    const totalPages = Math.ceil(posts.count / limitNumber);

    return res.json({
      success: true,
      data: {
        posts: normalizedPosts,
        pagination: {
          current_page: pageNumber,
          total_pages: totalPages,
          total_items: posts.count,
          items_per_page: limitNumber,
          has_next_page: pageNumber < totalPages,
          has_prev_page: pageNumber > 1,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while fetching posts.",
      success: false,
    });
  }
});

const getMyComments = asyncHandler(async (req, res) => {
  const userId = req.user?.user_id;
  const {
    page = 1,
    limit = 10,
    search = "",
    sort_by = "createdAt",
    sort_order = "DESC",
  } = req.query;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }

  try {
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const whereConditions = {
      posted_by: userId,
      parent_id: null, // Only top-level comments, not replies
    };

    if (search && String(search).trim()) {
      whereConditions[Op.or] = [{ comment: { [Op.like]: `%${search}%` } }];
    }

    let order = [];
    if (sort_by === "likes_count") {
      order.push([
        sequelize.literal(`(
          SELECT COUNT(*) FROM likes WHERE likes.comment_id = comments.comment_id
        )`),
        sort_order,
      ]);
    } else if (sort_by === "replies_count") {
      order.push([
        sequelize.literal(`(
          SELECT COUNT(*) FROM comments c WHERE c.parent_id = comments.comment_id
        )`),
        sort_order,
      ]);
    } else {
      order.push([sort_by, sort_order]);
    }

    const comments = await db.comments.findAndCountAll({
      where: whereConditions,
      limit: limitNumber,
      offset,
      order,
      attributes: [
        "comment_id",
        "comment",
        "post_id",
        "parent_id",
        "createdAt",
        [
          sequelize.literal(`(
            SELECT COUNT(*) FROM likes WHERE likes.comment_id = comments.comment_id
          )`),
          "likes_count",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*) FROM comments c WHERE c.parent_id = comments.comment_id
          )`),
          "replies_count",
        ],
        [
          sequelize.literal(`EXISTS (
            SELECT 1 FROM likes WHERE likes.comment_id = comments.comment_id AND likes.user_id = '${userId}'
          )`),
          "is_liked",
        ],
      ],
      include: [
        {
          model: db.posts,
          as: "post",
          attributes: ["post_id", "title", "content"],
          include: [
            {
              model: db.groups,
              as: "group",
              attributes: ["group_id", "title"],
            },
          ],
        },
      ],
    });

    const normalizedComments = comments.rows.map((commentInstance) => {
      const c = commentInstance.toJSON();
      c.is_liked = !!(
        c.is_liked === true ||
        c.is_liked === 1 ||
        c.is_liked === "1"
      );
      return c;
    });

    const totalPages = Math.ceil(comments.count / limitNumber);

    return res.json({
      success: true,
      data: {
        comments: normalizedComments,
        pagination: {
          current_page: pageNumber,
          total_pages: totalPages,
          total_items: comments.count,
          items_per_page: limitNumber,
          has_next_page: pageNumber < totalPages,
          has_prev_page: pageNumber > 1,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while fetching comments.",
      success: false,
    });
  }
});

// Admin function to get soft-deleted posts
const getDeletedPosts = asyncHandler(async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.is_admin) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
        success: false,
      });
    }

    const deletedPosts = await db.posts.findAll({
      where: {},
      paranoid: false, // Include soft-deleted records
      order: [["deletedAt", "DESC"]],
      include: [
        {
          model: db.users,
          as: "user",
          attributes: ["user_id", "first_name", "last_name", "email"],
        },
        {
          model: db.groups,
          as: "group",
          attributes: ["group_id", "title"],
        },
        {
          model: db.tags,
          as: "tags",
          attributes: ["tag_id", "tag_name"],
        },
      ],
    });

    return res.status(200).json({
      message: "Deleted posts fetched successfully.",
      success: true,
      data: deletedPosts,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Failed to fetch deleted posts.",
      success: false,
    });
  }
});

// Admin function to restore soft-deleted post
const restorePost = asyncHandler(async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.is_admin) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
        success: false,
      });
    }

    const { post_id } = req.params;

    if (!post_id) {
      return res.status(400).json({
        message: "Post ID is required.",
        success: false,
      });
    }

    const deletedPost = await db.posts.findOne({
      where: { post_id },
      paranoid: false, // Include soft-deleted records
    });

    if (!deletedPost) {
      return res.status(404).json({
        message: "Deleted post not found.",
        success: false,
      });
    }

    if (!deletedPost.deletedAt) {
      return res.status(400).json({
        message: "Post is not deleted.",
        success: false,
      });
    }

    // Restore the post
    await deletedPost.restore();

    return res.status(200).json({
      message: "Post restored successfully.",
      success: true,
      data: {
        post_id: deletedPost.post_id,
        title: deletedPost.title,
        restored_at: new Date(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Failed to restore post.",
      success: false,
    });
  }
});

module.exports = {
  listPosts,
  getUserPosts,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  getGroupPosts,
  reportPost,
  getMyCreatedPosts,
  getMyComments,
  getDeletedPosts,
  restorePost,
};
