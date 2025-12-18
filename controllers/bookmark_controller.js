const { db } = require("../models/dbconfig");
const { Sequelize } = require("sequelize");
const { asyncHandler } = require("../utils/asyncHandler");

const toggleBookmark = asyncHandler(async (req, res) => {
  const { post_id } = req.body;
  try {
    const { user_id } = req.user;

    const bookmark = await db.bookmarks.findOne({
      where: { post_id, user_id },
    });
    if (bookmark) {
      // Soft delete the bookmark
      await db.bookmarks.destroy({ where: { post_id, user_id } });
      res.status(200).json({
        message: "Bookmark removed successfully!",
        success: true,
        data: [],
      });
    } else {
      const newBookmark = await db.bookmarks.create({ post_id, user_id });
      res.status(201).json({
        message: "Bookmark added successfully!",
        success: true,
        data: newBookmark,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message, success: false, data: [] });
  }
});

const listBookmarks = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const page = parseInt(req.query.pageNo) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const { count, rows: bookmarks } = await db.bookmarks.findAndCountAll({
      where: { user_id },
      include: [
        {
          model: db.posts,
          as: "posts",
          include: [
            {
              model: db.users,
              as: "user",
              attributes: ["user_id", "first_name", "last_name"],
            },
            {
              model: db.tags,
              as: "tags",
            },
            {
              model: db.groups,
              as: "group",
            },
          ],
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
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.post_id AND comments.parent_id IS NULL AND comments.deleted_at IS NULL)`
              ),
              "comments_count",
            ],
            [
              Sequelize.literal(`EXISTS (
            SELECT 1 FROM likes 
            WHERE likes.post_id = posts.post_id 
            AND likes.user_id = '${user_id}' AND likes.deleted_at IS NULL
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
             WHERE bookmarks.post_id = posts.post_id AND bookmarks.user_id = '${user_id}' AND bookmarks.deleted_at IS NULL
           )`),
              "is_bookmarked",
            ],
            [
              Sequelize.literal(`(
             SELECT COUNT(*) FROM posts p
             WHERE p.post_id = posts.post_id AND p.posted_by = '${user_id}' AND p.deleted_at IS NULL
           )`),
              "is_owner",
            ],
            [
              Sequelize.literal(`(
             SELECT COUNT(*) FROM bookmarks
             WHERE bookmarks.post_id = posts.post_id AND bookmarks.user_id = '${user_id}' AND bookmarks.deleted_at IS NULL
           )`),
              "is_saved",
            ],
          ],
        },
      ],
      limit,
      offset,
    });

    const flattenedPosts = bookmarks.map((b) => {
      const post = b.posts?.dataValues;

      return {
        ...post,
        bookmark_id: b.bookmark_id,
      };
    });

    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      message: "Bookmarks fetched successfully!",
      success: true,
      data: {
        posts: flattenedPosts,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_items: count,
          items_per_page: limit,
          has_next_page: page < totalPages,
          has_prev_page: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false, data: [] });
  }
});

module.exports = {
  toggleBookmark,
  listBookmarks,
};
