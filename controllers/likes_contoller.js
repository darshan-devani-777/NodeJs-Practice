const { db } = require("../models/dbconfig");
const { asyncHandler } = require("../utils/asyncHandler");

const likeOrUnlike = asyncHandler(async (req, res) => {
  const { post_id, comment_id } = req.body;
  const { user_id } = req.user;

  if ((!post_id && !comment_id) || (post_id && comment_id)) {
    return res.status(400).json({
      error: 'Please provide exactly one of post_id or comment_id',
      success: false
    })
  }

  try {
    if (post_id) {
      model = await db.posts.findByPk(post_id, {
        include: [{ model: db.likes, as: 'likes' }],
      });
      modelName = 'post';
    } else {
      model = await db.comments.findByPk(comment_id, {
        include: [{ model: db.likes, as: 'likes' }],
      });
      modelName = 'comment';
    }

    if (!model) {
      return res.status(404).json({
        success: false,
        error: `${modelName.charAt(0).toUpperCase() + modelName.slice(1)} not found`,
      });
    }

    const likeWhereClause = {
      user_id,
      ...(post_id ? { post_id, comment_id: null } : { comment_id, post_id: null }),
    };

    const existingLike = await db.likes.findOne({ where: likeWhereClause });

      if (!existingLike) {
        const createLike = await db.likes.create({ user_id, comment_id: comment_id || null, post_id: post_id || null });
        const updatedModel = await model.reload({
        include: [{ model: db.likes, as: 'likes'}], });
        return res.status(200).json({
          message: `${modelName} liked successfully!`,
          success: true,
          data: {
            like: createLike,
            likes_count: updatedModel.likes.length,
          },
        });
    } else {
      // Soft delete the like
      await existingLike.destroy();
      const updatedModel = await model.reload({
        include: [{ model: db.likes, as: 'likes' }],
      });

      return res.status(200).json({
        success: true,
        message: `${modelName} unliked successfully!`,
        data: {
          like_count: updatedModel.likes.length,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while liking or unliking.",
      success: false,
      data: [],
    });
  }
});

const listLikes = asyncHandler(async (req, res) => {
  const { user_id } = req.body;
  try {
    // const post = await db.posts.findByPk(post_id);
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const likes = await db.likes.findAll({
      where: {
        user_id 
      },
      include: [
        {
          model: db.posts,
          as: "post",
          attributes: ["post_id", "title"],
        },
      ],
    });

    res.status(200).json({
      message: "Likes fetched successfully!",
      success: true,
      data: likes,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while fetching likes,",
      success: false,
      data: [],
    });
  }
});

module.exports = { likeOrUnlike, listLikes };
