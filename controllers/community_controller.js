const { db, sequelize } = require("../models/dbconfig");
const { asyncHandler } = require("../utils/asyncHandler");

const listCommunity = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const sortBy = req.query.sortBy;
  /*
  sortBy:-
   0:- trending posts
   1:- recent posts
   2:- unanswred posts
  */
  const limit = 10;
  const offset = (page - 1) * limit;
  const { user_id } = req.user;
  try {
    let order = []
    if (sortBy) {
      if (sortBy == 0) {
        order.push(
          [
            sequelize.literal(`(
               SELECT COUNT(*)
               FROM likes AS \`like\`
               WHERE \`like\`.likeable_id = community.community_id
               AND \`like\`.likeable_type = 'community'
             )`),
            "DESC",
          ])
      } else if (sortBy == 1) {
        order.push(["createdAt", "DESC"])
      } else if (sortBy == 2) {
        order.push(
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM comments AS comment
              WHERE comment.community_id = community.community_id
              AND comment.parent_id IS NULL)`), "DESC"
          ]
        )
      } else {
        return res.status(400).json({
          message: "Invalid sortBy",
          success: false,
        })
      }
    }

    const communities = await db.community.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: db.tags,
          as: "tags",
          attributes: ["tag_id", "tag_name"],
        },
        {
          model: db.likes,
          as: "likes",
          attributes: [],
          where: {
            user_id: user_id
          },
          required: false
        },
        {
          model: db.bookmarks,
          as: "bookmarks",
          attributes: [],
          where: {
            user_id: user_id
          },
          required: false
        }, {
          model: db.users,
          as: "user",
          attributes: ["first_name", "last_name", "profile_image"],
        }
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
               SELECT COUNT(*)
               FROM likes AS \`like\`
               WHERE \`like\`.likeable_id = community.community_id
               AND \`like\`.likeable_type = 'community'
             )`),
            "likes_count",
          ],
          [
            sequelize.literal(`(
               SELECT COUNT(*)
               FROM comments AS comment
               WHERE comment.community_id = community.community_id
               AND comment.parent_id IS NULL
             )`),
            "comments_count",
          ],
          [
            sequelize.literal(`(
               SELECT COUNT(*)
               FROM likes AS \`like\`
               WHERE \`like\`.likeable_id = community.community_id
               AND \`like\`.likeable_type = 'community'
               AND \`like\`.user_id = ${user_id}
             ) > 0`),
            "is_liked"
          ],
          [
            sequelize.literal(`(
               SELECT COUNT(*)
               FROM bookmarks AS \`bookmark\`
               WHERE \`bookmark\`.bookmarkable_id = community.community_id
               AND \`bookmark\`.user_id = ${user_id}
             ) > 0`),
            "is_bookmarked"
          ]
        ],
      },
      order: order,
    });


    res.status(200).json({
      message: "Communities fetched successfully!",
      success: true,
      data: communities
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while fetching communities.",
      success: false,
      data: [],
    });
  }
});

const getUserCommunity = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const { user_id } = req.user;
  try {
    const communities = await db.community.findAndCountAll({
      where: {
        posted_by: user_id
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
      message: "Communities fetched successfully!",
      success: true,
      data: communities
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while fetching communities.",
      success: false,
      data: [],
    });
  }
});

const getCommunityPostDetail = asyncHandler(async (req, res) => {
  try {

    const { community_id } = req.params;

    const communityPost = await db.community.findByPk(community_id, {
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
      ]
    })

    return res.status(200).json({
      message: "Community post details fetched successfully!",
      success: true,
      data: communityPost
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while fetching post details.",
      success: false,
    });
  }
})

const createCommunityPost = asyncHandler(async (req, res) => {
  const { title, content, tag_ids } = req.body;
  const { file } = req
  try {
    const { user_id } = req.user;
    if (!user_id) {
      return res.status(403).json({ message: "User is required", success: false, data: [] });
    }
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Community post title and content are required", success: false, data: [] });
    }
    if (file?.size > 65536) {
      return res.status(400).json({ message: "Image size should be less than 65kb", success: false, data: [] });
    }
    const newCommunity = await db.community.create({
      posted_by: user_id,
      title,
      content,
    });
    if (file) {
      const base64Image = file.buffer.toString("base64");
      newCommunity.image = base64Image;
      await newCommunity.save();
    }
    if (tag_ids && tag_ids.length > 0) {
      const tagPromises = tag_ids.map(async (tag) => {
        const [tagInstance, created] = await db.tags.findOrCreate({
          where: { tag_name: tag },
          defaults: { tag_name: tag },
        });
        return tagInstance;
      });

      const tagInstances = await Promise.all(tagPromises);
      await newCommunity.setTags(tagInstances);
    }

    const communityWithTags = await db.community.findOne({
      where: { community_id: newCommunity.community_id },
      include: [
        {
          model: db.tags,
          as: "tags",
          attributes: ["tag_id", "tag_name"],
        },
      ],
    });
    res.status(201).json({
      message: "Community post created successfully!",
      success: true,
      data: communityWithTags,
    });
  } catch (error) {
    console.log("🚀 ~ createCommunityPost ~ error:", error)
    return res.status(500).json({
      error: error.message ?? "Something went wrong while creating community post.",
      success: false,
      data: [],
    });
  }
});

const updateCommunityPost = asyncHandler(async (req, res) => {
  const { community_id } = req.params;
  const { title, content, tag_ids } = req.body;
  try {
    const { user_id } = req.user;
    const user = await db.users.findByPk(user_id);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    } else if (!community_id) {
      return res.status(400).json({ error: "Please provide community post id to edit" });
    }

    const communityPost = await db.community.findByPk(community_id);

    if (!communityPost) {
      return res.status(400).json({ error: "Community post not found" });
    } else if (communityPost.posted_by !== user.user_id) {
      return res.status(401).json({ error: "Unauthorised! Can not update community post" });
    }

    if (tag_ids && tag_ids.length === 0) {
      return res.status(400).json({ error: "Tag names are required" });
    }
    if (title) communityPost.title = title;
    if (content) communityPost.content = content;
    await communityPost.save();

    if (!!tag_ids?.length > 0) {
      const existingTags = await db.tags.findAll({
        where: { tag_name: tag_ids },
      });

      const existingTagNames = existingTags.map((tag) => tag.tag_name);

      const newTagNames = tag_ids.filter((tagName) => !existingTagNames.includes(tagName));

      let newTagInstances = [];
      if (newTagNames.length > 0) {
        newTagInstances = await db.tags.bulkCreate(
          newTagNames.map((tagName) => ({ tag_name: tagName })),
          { returning: true }
        );
      }
      const allTagInstances = [...existingTags, ...newTagInstances];

      const currentTags = await communityPost.getTags({ attributes: ["tag_id", "tag_name"] });
      const currentTagNames = currentTags.map((tag) => tag.tag_name);

      const tagsToRemove = currentTags.filter((tag) => !tag_ids.includes(tag.tag_name));
      const tagsToAdd = allTagInstances.filter((tag) => !currentTagNames.includes(tag.tag_name));

      if (tagsToRemove.length > 0) {
        await communityPost.removeTags(tagsToRemove);
      }
      if (tagsToAdd.length > 0) {
        await communityPost.addTags(tagsToAdd);
      }
    }

    const updatedCommunityPost = await db.community.findOne({
      where: { community_id: communityPost.community_id },
      include: [
        {
          model: db.tags,
          as: "tags",
          attributes: ["tag_id", "tag_name"],
        },
      ],
    });

    res.status(200).json({
      message: "Community post updated successfully!",
      success: true,
      data: updatedCommunityPost,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while updating community post.",
      success: false,
      data: [],
    });
  }
});

const deleteCommunityPost = asyncHandler(async (req, res) => {
  const { community_id } = req.params;
  try {
    const { user_id } = req.user;
    const communityPost = await db.community.findByPk(community_id);
    if (!communityPost) {
      return res.status(400).json({ error: "Community post not found" });
    } else if (communityPost.posted_by !== user_id) {
      return res.status(403).json({ error: "Unauthorised! Can not delete community post" });
    }
    await communityPost.setTags([]);
    // Soft delete the community post
    await communityPost.destroy();

    res.status(200).json({
      message: "Community post deleted successfully!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while deleting community post.",
      success: false,
      data: [],
    });
  }
});

module.exports = {
  listCommunity,
  createCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
  getUserCommunity,
  getCommunityPostDetail,
};
