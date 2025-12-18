const { db, sequelize } = require("../models/dbconfig");
const { asyncHandler } = require("../utils/asyncHandler");

const createComment = asyncHandler(async (req, res) => {
  const { comment, parent_id } = req.body;
  const { post_id } = req.params;
  const { file } = req;
  try {
    const { user_id } = req.user;
    // const communityPost = await db.community.findByPk(community_id);
    // if (!communityPost) {
    //   return res.status(400).json({ error: "Community post not found" });
    // }
    const post = await db.posts.findByPk(post_id);
    if (!post) {
      return res.status(400).json({ error: "Post not found" });
    }
    if (parent_id) {
      const existingComment = await db.comments.findByPk(parent_id);
      if (!existingComment) {
        return res.status(400).json({ error: "Parent comment not found" });
      }
    }
    if (file?.size > 65536) {
      return res.status(400).json({
        error: "Image size should be less than 65kb",
        success: false,
        data: [],
      });
    }
    const newComment = await db.comments.create({
      posted_by: user_id,
      // community_id,
      post_id,
      comment,
      parent_id: parent_id || null,
    });

    if (file) {
      const base64Image = file.buffer.toString("base64");
      newComment.image = base64Image;
      await newComment.save();
    }

    res.status(200).json({
      message: "Comment added successfully!",
      success: true,
      data: newComment,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while creating comment.",
      success: false,
      data: [],
    });
  }
});

const editComment = asyncHandler(async (req, res) => {
  const { comment_id } = req.params;
  const { comment } = req.body;
  try {
    const { user_id } = req.user;
    const user = await db.users.findByPk(user_id);
    if (!user) {
      res.status(400).json({ error: "User not found" });
    } else if (!comment_id) {
      res.status(400).json({ error: "Please provide comment id to edit" });
    }

    const findComment = await db.comments.findByPk(comment_id);

    if (!findComment) {
      return res.status(400).json({ error: "Comment not found" });
    } else if (findComment.posted_by !== user.user_id) {
      return res
        .status(401)
        .json({ error: "Unauthorised! Can not update comment" });
    }

    if (comment) findComment.comment = comment;
    await findComment.save();

    res.status(200).json({
      message: "Comment updated successfully!",
      success: true,
      data: findComment,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while editing comment.",
      success: false,
      data: [],
    });
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const { comment_id } = req.params;

  try {
    const comment = await db.comments.findByPk(comment_id);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    await deleteChildComments(comment_id);

    // Soft delete the comment
    await db.comments.destroy({
      where: { comment_id },
    });

    res.status(200).json({
      success: true,
      message: "Comment and its replies deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while deleting comment.",
      success: false,
      data: [],
    });
  }
});

const deleteChildComments = async (parent_id) => {
  const childComments = await db.comments.findAll({
    where: { parent_id },
  });
  for (const childComment of childComments) {
    await deleteChildComments(childComment.comment_id);
    // Soft delete child comment
    await db.comments.destroy({
      where: { comment_id: childComment.comment_id },
    });
  }
};

const listComment = asyncHandler(async (req, res) => {
  const { post_id } = req.params;
  const {
    page = 1,
    limit = 10,
    sort_by = "createdAt",
    sort_order = "DESC",
  } = req.query;

  // Check if user is authenticated
  if (!req.user || !req.user.user_id) {
    return res.status(401).json({
      message: "Unauthorized - User not authenticated",
      success: false,
    });
  }

  const userId = req.user.user_id;

  try {
    const post = await db.posts.findByPk(post_id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    let order = [];
    if (sort_by === "likes_count") {
      order.push([
        sequelize.literal(`(
          SELECT COUNT(*) FROM likes WHERE likes.comment_id = comments.comment_id AND likes.deleted_at IS NULL
        )`),
        sort_order,
      ]);
    } else if (sort_by === "replies_count") {
      order.push([
        sequelize.literal(`(
          SELECT COUNT(*) FROM comments c WHERE c.parent_id = comments.comment_id AND c.deleted_at IS NULL
        )`),
        sort_order,
      ]);
    } else {
      order.push([sort_by, sort_order]);
    }

    const comments = await db.comments.findAndCountAll({
      where: { post_id, parent_id: null },
      limit: limitNumber,
      offset,
      order,
      attributes: [
        "comment_id",
        "comment",
        "post_id",
        "parent_id",
        "posted_by",
        "createdAt",
        [
          sequelize.literal(`(
            SELECT COUNT(*) FROM likes WHERE likes.comment_id = comments.comment_id AND likes.deleted_at IS NULL
          )`),
          "likes_count",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*) FROM comments c WHERE c.parent_id = comments.comment_id AND c.deleted_at IS NULL
          )`),
          "replies_count",
        ],
        [
          sequelize.literal(`EXISTS (
            SELECT 1 FROM likes WHERE likes.comment_id = comments.comment_id AND likes.user_id = '${userId}' AND likes.deleted_at IS NULL
          )`),
          "is_liked",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*) FROM comments c WHERE c.comment_id = comments.comment_id AND c.posted_by = '${userId}' AND c.deleted_at IS NULL
          )`),
          "is_owner",
        ],
      ],
      include: [
        {
          model: db.users,
          as: "user",
          attributes: ["user_id", "first_name", "last_name", "profile_image"],
        },
        {
          model: db.comments,
          as: "replies",
          attributes: [
            "comment_id",
            "comment",
            "post_id",
            "parent_id",
            "posted_by",
            "createdAt",
            [
              sequelize.literal(`(
                SELECT COUNT(*) FROM likes WHERE likes.comment_id = replies.comment_id AND likes.deleted_at IS NULL
              )`),
              "likes_count",
            ],
            [
              sequelize.literal(`EXISTS (
                SELECT 1 FROM likes WHERE likes.comment_id = replies.comment_id AND likes.user_id = '${
                  userId || ""
                }' AND likes.deleted_at IS NULL
              )`),
              "is_liked",
            ],
            [
              sequelize.literal(`(
                SELECT COUNT(*) FROM comments c WHERE c.comment_id = replies.comment_id AND c.posted_by = '${
                  userId || ""
                }' AND c.deleted_at IS NULL
              )`),
              "is_owner",
            ],
          ],
          include: [
            {
              model: db.users,
              as: "user",
              attributes: [
                "user_id",
                "first_name",
                "last_name",
                "profile_image",
              ],
            },
          ],
        },
      ],
    });

    // Normalize boolean values for main comments and replies
    const normalizedComments = comments.rows.map((commentInstance) => {
      const comment = commentInstance.toJSON();

      // Normalize main comment
      comment.is_liked = !!(
        comment.is_liked === true ||
        comment.is_liked === 1 ||
        comment.is_liked === "1"
      );
      comment.is_owner = !!(
        comment.is_owner === true ||
        comment.is_owner === 1 ||
        comment.is_owner === "1"
      );

      // Normalize replies
      if (comment.replies && comment.replies.length > 0) {
        comment.replies = comment.replies.map((reply) => {
          reply.is_liked = !!(
            reply.is_liked === true ||
            reply.is_liked === 1 ||
            reply.is_liked === "1"
          );
          reply.is_owner = !!(
            reply.is_owner === true ||
            reply.is_owner === 1 ||
            reply.is_owner === "1"
          );
          return reply;
        });
      }

      return comment;
    });

    const totalPages = Math.ceil(comments.count / limitNumber);

    res.status(200).json({
      message: "Comments fetched successfully!",
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
      data: [],
    });
  }
});

// Admin function to get soft-deleted comments
const getDeletedComments = asyncHandler(async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.is_admin) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
        success: false,
      });
    }

    const deletedComments = await db.comments.findAll({
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
          model: db.posts,
          as: "post",
          attributes: ["post_id", "title"],
        },
      ],
    });

    return res.status(200).json({
      message: "Deleted comments fetched successfully.",
      success: true,
      data: deletedComments,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Failed to fetch deleted comments.",
      success: false,
    });
  }
});

// Admin function to restore soft-deleted comment
const restoreComment = asyncHandler(async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.is_admin) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
        success: false,
      });
    }

    const { comment_id } = req.params;

    if (!comment_id) {
      return res.status(400).json({
        message: "Comment ID is required.",
        success: false,
      });
    }

    const deletedComment = await db.comments.findOne({
      where: { comment_id },
      paranoid: false, // Include soft-deleted records
    });

    if (!deletedComment) {
      return res.status(404).json({
        message: "Deleted comment not found.",
        success: false,
      });
    }

    if (!deletedComment.deletedAt) {
      return res.status(400).json({
        message: "Comment is not deleted.",
        success: false,
      });
    }

    // Restore the comment
    await deletedComment.restore();

    return res.status(200).json({
      message: "Comment restored successfully.",
      success: true,
      data: {
        comment_id: deletedComment.comment_id,
        comment: deletedComment.comment,
        restored_at: new Date(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Failed to restore comment.",
      success: false,
    });
  }
});

const reportComment = asyncHandler(async (req, res) => {
  const { comment_id } = req.params;
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

  const comment = await db.comments.findByPk(comment_id);
  if (!comment) {
    return res
      .status(404)
      .json({ message: "Comment not found", success: false });
  }

  const reason = `${subject}: ${bio}`;

  await db.reports.create({
    comment_id,
    reported_by: user_id,
    reason,
  });

  return res.status(201).json({ message: "Comment reported", success: true });
});
const getCommentDetails = asyncHandler(async(req,res)=>{
  const {comment_id} = req.params;
  const comment = await db.comments.findByPk(comment_id,{
    include:[
      {
        model:db.posts,
        as:"post",
        attributes:["post_id","title","content"],
        include:[
          {
            model:db.users,
            as:"user",
            attributes:["user_id","first_name","last_name","profile_image"],
          }
        ]
      },
      {
        model:db.users,
        as:"user",
        attributes:["user_id","first_name","last_name","profile_image"],
      }
    ]
  });
  if(!comment){
    return res.status(404).json({message:"Comment not found",success:false});
  }
  return res.status(200).json({message:"Comment details fetched successfully",success:true,data:comment});
  
})

module.exports = {
  createComment,
  editComment,
  deleteComment,
  listComment,
  getDeletedComments,
  restoreComment,
  reportComment,
  getCommentDetails,
};
