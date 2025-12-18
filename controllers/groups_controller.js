const { db, sequelize } = require("../models/dbconfig");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  uploadImageOnCloudinary,
  deleteImageOnCloudinary,
} = require("../utils/cloudinary");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");

const createGroup = asyncHandler(async (req, res) => {
  const { title, description, is_public, tag_id } = req.body;
  const { file } = req;
  const creator_id = req.user.user_id;

  if (!title || !description || !is_public) {
    return res.status(400).json({
      message: "All fields are required.",
      success: false,
    });
  }

  if (!creator_id) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
    });
  }

  try {
    const existingGroup = await db.groups.findOne({
      where: {
        title,
      },
    });

    if (existingGroup) {
      return res.status(400).json({
        message: "Group with this title already exists.",
        success: false,
      });
    }

    let groupImageUrl = "";

    // Handle image upload
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
        groupImageUrl = uploadedImage.url;
      }
    }

    const newGroup = await db.groups.create({
      title,
      description,
      is_public,
      tag_id,
      created_by: creator_id,
      image: groupImageUrl,
    });

    const owner = await db.group_members.create({
      group_id: newGroup.group_id,
      user_id: creator_id,
      created_by: creator_id,
      is_owner: 1,
    });

    return res.status(201).json({
      message: "Group created successfully!",
      success: true,
      data: newGroup,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while creating group.",
      success: false,
    });
  }
});

const addGroupMember = asyncHandler(async (req, res) => {
  const { group_id, user_id } = req.body;
  const creator_id = req.user.user_id;

  if (!group_id) {
    return res.status(400).json({
      message: "Group ID is required.",
      success: false,
    });
  }

  if (!user_id) {
    return res.status(400).json({
      message: "User ID is required.",
      success: false,
    });
  }

  if (!creator_id) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
    });
  }

  try {
    const existingGroup = await db.groups.findOne({ where: { group_id } });
    if (!existingGroup) {
      return res.status(400).json({
        message: "This group does not exist.",
        success: false,
      });
    }

    const group_member = await db.group_members.findOne({
      where: { group_id, user_id },
    });
    if (group_member) {
      return res.status(400).json({
        message: "You are already a member.",
        success: false,
      });
    }

    const newMember = await db.group_members.create({
      group_id,
      user_id,
      created_by: creator_id,
    });

    return res.status(201).json({
      message: "Group joined successfully!",
      success: true,
      data: newMember,
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error.message ?? "Something went wrong while creating adding member.",
      success: false,
    });
  }
});

const removeGroupMember = asyncHandler(async (req, res) => {
  const { group_id, user_id } = req.body;
  const creator_id = req.user.user_id;

  if (!group_id) {
    return res.status(400).json({
      message: "Group ID is required.",
      success: false,
    });
  }

  if (!user_id) {
    return res.status(400).json({
      message: "User ID is required.",
      success: false,
    });
  }

  if (!creator_id) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
    });
  }

  try {
    const existingGroup = await db.groups.findOne({
      where: { group_id },
      include: [
        {
          required: false,
          as: "members",
          model: db.group_members,
        },
        {
          required: false,
          as: "owners",
          model: db.group_members,
          where: {
            is_owner: true,
          },
        },
      ],
    });

    if (!existingGroup) {
      return res.status(400).json({
        message: "This group does not exist.",
        success: false,
      });
    }

    if (existingGroup.members?.length) {
      if (!existingGroup.members.map((x) => x.user_id).includes(user_id)) {
        return res.status(400).json({
          message: "You are not a member of this group.",
          success: false,
        });
      }
    } else {
      return res.status(400).json({
        message: "No members in the group!",
        success: false,
      });
    }

    if (existingGroup.owners.find((x) => x.user_id == user_id)) {
      if (
        existingGroup.members.filter((x) => x.user_id != user_id).length != 0 &&
        existingGroup.owners.filter((x) => x.user_id != user_id).length == 0
      ) {
        return res.status(400).json({
          message: "Group must have at least one owner member!",
          success: false,
        });
      }
    }

    // Soft delete the member
    const removedMember = await db.group_members.destroy({
      where: { group_id, user_id },
    });

    return res.status(201).json({
      message: "Member removed successfully!",
      success: true,
      data: removedMember,
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error.message ?? "Something went wrong while creating adding member.",
      success: false,
    });
  }
});

const getGroups = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const {
      page = 1,
      limit = 10,
      search = "",
      sort_by = "createdAt",
      sort_order = "DESC",
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const whereConditions = {};
    if (search && String(search).trim()) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const orderConditions = [];
    if (sort_by === "members_count") {
      orderConditions.push([
        sequelize.literal(`(
          SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = groups.group_id AND gm.deleted_at IS NULL
        )`),
        sort_order,
      ]);
    } else if (sort_by === "posts_count") {
      orderConditions.push([
        sequelize.literal(`(
          SELECT COUNT(*) FROM posts p WHERE p.group_id = groups.group_id AND p.deleted_at IS NULL
        )`),
        sort_order,
      ]);
    } else {
      orderConditions.push([sort_by, sort_order]);
    }

    const { count, rows: groups } = await db.groups.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: db.group_tags,
          as: "group_tags",
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = groups.group_id AND gm.deleted_at IS NULL
            )`),
            "members_count",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM posts p WHERE p.group_id = groups.group_id
            )`),
            "posts_count",
          ],
          [
            sequelize.literal(`(
                SELECT COUNT(*) > 0 FROM group_members gm
                WHERE gm.group_id = groups.group_id AND gm.user_id = '${userId}' AND gm.deleted_at IS NULL
              )`),
            "is_member",
          ],
          [
            sequelize.literal(`(
                SELECT COUNT(*) > 0 FROM group_members gm
                WHERE gm.group_id = groups.group_id AND gm.user_id = '${userId}' AND gm.is_owner = 1 AND gm.deleted_at IS NULL
              )`),
            "is_owner",
          ],
        ],
      },
      order: orderConditions,
      limit: limitNumber,
      offset: offset,
      distinct: true,
    });

    const normalized = groups.map((g) => {
      const o = g.toJSON();
      o.is_member = !!(
        o.is_member === true ||
        o.is_member === 1 ||
        o.is_member === "1"
      );
      o.is_owner = !!(
        o.is_owner === true ||
        o.is_owner === 1 ||
        o.is_owner === "1"
      );
      return o;
    });

    const totalPages = Math.ceil(count / limitNumber);
    return res.status(201).json({
      message: "Group fetched successfully!",
      success: true,
      data: {
        groups: normalized,
        pagination: {
          current_page: pageNumber,
          total_pages: totalPages,
          total_items: count,
          items_per_page: limitNumber,
          has_next_page: pageNumber < totalPages,
          has_prev_page: pageNumber > 1,
        },
        search: {
          query: search,
          results_count: normalized.length,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while getting group info.",
      success: false,
    });
  }
});

const updateGroupOwners = asyncHandler(async (req, res) => {
  try {
    const { group_member_ids, group_id } = req.body;

    if (!group_id) {
      return res.status(400).json({
        success: false,
        message: "Group id is required.",
      });
    } else if (!Array.isArray(group_member_ids)) {
      return res.status(400).json({
        success: false,
        message: "New owner ids must be an array.",
      });
    } else if (!group_member_ids || group_member_ids?.length == 0) {
      return res.status(400).json({
        success: false,
        message: "New owner ids are required.",
      });
    }

    const group = await db.groups.findByPk(group_id, {
      include: [
        {
          required: false,
          as: "owners",
          model: db.group_members,
          where: {
            is_owner: true,
          },
        },
      ],
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found.",
      });
    }

    if (group.created_by != req.user.user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    if (group.owners && group.owners.length) {
      const oldOwners = await db.group_members.update(
        {
          is_owner: false,
        },
        {
          where: {
            group_member_id: group.owners.map((x) => x.group_member_id),
          },
        }
      );
    }

    const newOwners = await db.group_members.update(
      {
        is_owner: true,
      },
      {
        where: {
          group_member_id: group_member_ids,
        },
      }
    );

    return res.json({
      success: true,
      data: newOwners,
      message: "Owner assigned successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error.message ?? "Something went wrong while updating group owners.",
      success: false,
    });
  }
});

const reportGroup = asyncHandler(async (req, res) => {
  try {
    const { group_id, reason, additional_info } = req.body;
    const reported_by = req.user?.user_id;

    if (!reported_by) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!group_id || !reason) {
      return res.status(400).json({
        success: false,
        message: "Group ID and reason are required.",
      });
    }

    const group = await db.groups.findByPk(group_id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found.",
      });
    }

    const report = await db.reports.create({
      group_id,
      reported_by,
      reason,
      additional_info,
    });

    return res.status(201).json({
      success: true,
      message: "Group reported successfully.",
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message ?? "Something went wrong while reporting group.",
    });
  }
});

const getGroupDetails = asyncHandler(async (req, res) => {
  const { group_id } = req.params;

  // Check if user is authenticated
  if (!req.user || !req.user.user_id) {
    return res.status(401).json({
      message: "Unauthorized - User not authenticated",
      success: false,
    });
  }

  const user_id = req.user.user_id;

  const group = await db.groups.findOne({
    where: { group_id },
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COUNT(*) FROM group_members WHERE group_members.group_id = groups.group_id AND group_members.deleted_at IS NULL
          )`),
          "member_count",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*) FROM posts WHERE posts.group_id = groups.group_id AND posts.deleted_at IS NULL
          )`),
          "post_count",
        ],
        [
          sequelize.literal(`EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.group_id = groups.group_id 
            AND group_members.user_id = '${user_id}' AND group_members.deleted_at IS NULL
          )`),
          "is_member",
        ],
        [
          sequelize.literal(`EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.user_id = '${user_id}'
            AND group_members.group_id = groups.group_id 
            AND group_members.is_owner = true AND group_members.deleted_at IS NULL
          )`),
          "is_owner",
        ],
      ],
    },
    include: [
      {
        model: db.group_tags,
        as: "group_tags",
      },
      {
        model: db.group_members,
        as: "members",
        include: [
          {
            model: db.users,
            as: "member",
            attributes: ["user_id", "first_name", "last_name", "profile_image"],
          },
        ],
        attributes: ["group_member_id", "is_owner", "group_id"],
        limit: 5,
        offset: 0,
      },
      {
        model: db.group_members,
        as: "owners",
        where: {
          is_owner: true,
        },
        attributes: ["group_member_id", "is_owner", "group_id"],
        include: [
          {
            model: db.users,
            as: "member",
            attributes: ["user_id", "first_name", "last_name", "profile_image"],
          },
        ],
      },
    ],
  });

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found.",
    });
  }

  const groupJSON = group.toJSON();

  // Normalize boolean values
  groupJSON.is_member = !!(
    groupJSON.is_member === true ||
    groupJSON.is_member === 1 ||
    groupJSON.is_member === "1"
  );
  groupJSON.is_owner = !!(
    groupJSON.is_owner === true ||
    groupJSON.is_owner === 1 ||
    groupJSON.is_owner === "1"
  );

  return res.json({
    success: true,
    data: groupJSON,
  });
});

const updateGroup = asyncHandler(async (req, res) => {
  const { group_id } = req.params;
  const { title, description, is_public, tag_id } = req.body;
  const { file } = req;
  const creator_id = req.user.user_id;

  if (!group_id) {
    return res.status(400).json({
      message: "Group ID is required.",
      success: false,
    });
  }

  if (!creator_id) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
    });
  }

  try {
    const group = await db.groups.findByPk(group_id);

    if (!group) {
      return res.status(404).json({
        message: "Group not found.",
        success: false,
      });
    }

    // Check if user is the creator or an owner
    const isOwner = await db.group_members.findOne({
      where: {
        group_id,
        user_id: creator_id,
        is_owner: true,
      },
    });

    if (!isOwner && group.created_by !== creator_id) {
      return res.status(403).json({
        message: "You don't have permission to update this group.",
        success: false,
      });
    }

    // Handle image upload
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
        // Delete old image if exists
        if (group.image) {
          await deleteImageOnCloudinary(group.image);
        }
        group.image = uploadedImage.url;
      }
    }

    // Update other fields
    if (title) group.title = title;
    if (description) group.description = description;
    if (is_public !== undefined) group.is_public = is_public;
    if (tag_id) group.tag_id = tag_id;

    await group.save();

    const updatedGroup = await db.groups.findByPk(group_id, {
      include: [
        {
          model: db.group_tags,
          as: "group_tags",
        },
        {
          model: db.group_members,
          as: "members",
        },
        {
          model: db.group_members,
          as: "owners",
          where: {
            is_owner: true,
          },
        },
      ],
    });

    return res.status(200).json({
      message: "Group updated successfully!",
      success: true,
      data: updatedGroup,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while updating group.",
      success: false,
    });
  }
});

const getGroupMembers = asyncHandler(async (req, res) => {
  const { group_id } = req.params;
  const {
    page = 1,
    limit = 10,
    search = "",
    sort_by = "added_at",
    sort_order = "DESC",
  } = req.query;
  const user_id = req.user.user_id;

  if (!group_id) {
    return res.status(400).json({
      message: "Group ID is required.",
      success: false,
    });
  }

  if (!user_id) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
    });
  }

  try {
    // Check if group exists
    const group = await db.groups.findByPk(group_id);
    if (!group) {
      return res.status(404).json({
        message: "Group not found.",
        success: false,
      });
    }

    // Check if user is a member of the group
    const userMembership = await db.group_members.findOne({
      where: {
        group_id,
        user_id,
      },
    });

    if (!userMembership && !group.is_public) {
      return res.status(200).json({
        message: "You don't have access to this group.",
        success: false,
        error_code: "NOT_MEMBER",
      });
    }

    // Calculate pagination
    const offset = (page - 1) * limit;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Build search conditions
    const searchConditions = {};
    if (search && search.trim()) {
      searchConditions[Op.or] = [
        {
          "$member.first_name$": {
            [Op.like]: `%${search}%`,
          },
        },
        {
          "$member.last_name$": {
            [Op.like]: `%${search}%`,
          },
        },
        {
          "$member.email$": {
            [Op.like]: `%${search}%`,
          },
        },
      ];
    }

    // Build sort conditions
    const sortConditions = [];
    if (sort_by === "name") {
      sortConditions.push([
        { model: db.users, as: "member" },
        "first_name",
        sort_order,
      ]);
      sortConditions.push([
        { model: db.users, as: "member" },
        "last_name",
        sort_order,
      ]);
    } else if (sort_by === "is_owner") {
      sortConditions.push(["is_owner", sort_order]);
    } else {
      sortConditions.push([sort_by, sort_order]);
    }

    // Fetch group members with pagination and search
    const { count, rows: members } = await db.group_members.findAndCountAll({
      where: {
        group_id,
        ...searchConditions,
      },
      include: [
        {
          model: db.users,
          as: "member",
          attributes: [
            "user_id",
            "first_name",
            "last_name",
            "email",
            "profile_image",
            "bio",
          ],
        },
      ],
      attributes: ["group_member_id", "is_owner", "group_id", "added_at"],
      order: sortConditions,
      limit: limitNumber,
      offset: offset,
      distinct: true,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    return res.json({
      success: true,
      data: {
        members,
        pagination: {
          current_page: pageNumber,
          total_pages: totalPages,
          total_items: count,
          items_per_page: limitNumber,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
        },
        search: {
          query: search,
          results_count: members.length,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error.message ?? "Something went wrong while fetching group members.",
      success: false,
    });
  }
});

const getGroupPosts = asyncHandler(async (req, res) => {
  const { group_id } = req.params;
  const {
    page = 1,
    limit = 10,
    sort_by = "createdAt",
    sort_order = "DESC",
    search = "",
  } = req.query;
  const user_id = req.user.user_id;

  if (!group_id) {
    return res.status(400).json({
      message: "Group ID is required.",
      success: false,
    });
  }

  if (!user_id) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
    });
  }

  try {
    // Check if group exists
    const group = await db.groups.findByPk(group_id);
    if (!group) {
      return res.status(404).json({
        message: "Group not found.",
        success: false,
      });
    }

    // Check if user is a member of the group
    const userMembership = await db.group_members.findOne({
      where: {
        group_id,
        user_id,
      },
    });

    if (!userMembership && !group.is_public) {
      return res.status(200).json({
        message: "You don't have access to this group.",
        success: false,
        error_code: "NOT_MEMBER",
      });
    }

    // Calculate pagination
    const offset = (page - 1) * limit;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Build sort conditions
    let orderConditions = [];
    if (sort_by === "likes") {
      orderConditions.push([
        sequelize.literal(`(
          SELECT COUNT(*) 
          FROM likes 
          WHERE likes.post_id = posts.post_id
        )`),
        sort_order,
      ]);
    } else if (sort_by === "comments") {
      orderConditions.push([
        sequelize.literal(`(
          SELECT COUNT(*) 
          FROM comments 
          WHERE comments.post_id = posts.post_id AND comments.parent_id IS NULL
        )`),
        sort_order,
      ]);
    } else if (sort_by === "createdAt") {
      orderConditions.push(["createdAt", sort_order]);
    } else {
      orderConditions.push([sort_by, sort_order]);
    }

    // Build where conditions for search
    const whereConditions = {
      group_id,
    };

    // Add search condition if search parameter is provided
    if (search && String(search).trim()) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
      ];
    }

    // Fetch group posts with pagination
    const { count, rows: posts } = await db.posts.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: db.users,
          as: "user",
          attributes: ["user_id", "first_name", "last_name", "profile_image"],
        },
        {
          model: db.tags,
          as: "tags",
          attributes: ["tag_id", "tag_name"],
        },
        {
          model: db.likes,
          as: "likes",
          attributes: ["like_id", "user_id"],
        },
        {
          model: db.comments,
          as: "comments",
          attributes: [
            "comment_id",
            "post_id",
            "comment",
            "createdAt",
            "posted_by",
          ],
          limit: 3, // Limit comments to 3 per post
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*) 
              FROM likes 
              WHERE likes.post_id = posts.post_id
            )`),
            "likes_count",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) 
              FROM comments 
              WHERE comments.post_id = posts.post_id AND comments.parent_id IS NULL
            )`),
            "comments_count",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) > 0 
              FROM likes 
              WHERE likes.post_id = posts.post_id AND likes.user_id = '${user_id}'
            )`),
            "is_liked",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) > 0 
              FROM posts p2
              WHERE p2.post_id = posts.post_id AND p2.posted_by = '${user_id}'
            )`),
            "is_owner",
          ],
        ],
      },
      order: orderConditions,
      limit: limitNumber,
      offset: offset,
      distinct: true,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    return res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current_page: pageNumber,
          total_pages: totalPages,
          total_items: count,
          items_per_page: limitNumber,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
        },
        search: {
          query: search,
          results_count: posts.length,
        },
        group_info: {
          group_id: group.group_id,
          title: group.title,
          description: group.description,
          is_public: group.is_public,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error.message ?? "Something went wrong while fetching group posts.",
      success: false,
    });
  }
});

const getMyCreatedGroups = asyncHandler(async (req, res) => {
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
      created_by: userId,
    };

    if (search && String(search).trim()) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const orderConditions = [];
    if (sort_by === "members_count") {
      orderConditions.push([
        sequelize.literal(`(
          SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = groups.group_id AND gm.deleted_at IS NULL
        )`),
        sort_order,
      ]);
    } else if (sort_by === "posts_count") {
      orderConditions.push([
        sequelize.literal(`(
          SELECT COUNT(*) FROM posts p WHERE p.group_id = groups.group_id
        )`),
        sort_order,
      ]);
    } else {
      orderConditions.push([sort_by, sort_order]);
    }

    const { count, rows: groups } = await db.groups.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: db.group_tags,
          as: "group_tags",
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = groups.group_id AND gm.deleted_at IS NULL
            )`),
            "members_count",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM posts p WHERE p.group_id = groups.group_id
            )`),
            "posts_count",
          ],
          [
            sequelize.literal(`(
                SELECT COUNT(*) > 0 FROM group_members gm
                WHERE gm.group_id = groups.group_id AND gm.user_id = '${userId}' AND gm.deleted_at IS NULL
              )`),
            "is_member",
          ],
          [
            sequelize.literal(`(
                SELECT COUNT(*) > 0 FROM group_members gm
                WHERE gm.group_id = groups.group_id AND gm.user_id = '${userId}' AND gm.is_owner = 1 AND gm.deleted_at IS NULL
              )`),
            "is_owner",
          ],
        ],
      },
      order: orderConditions,
      limit: limitNumber,
      offset: offset,
      distinct: true,
    });

    const totalPages = Math.ceil(count / limitNumber);
    return res.json({
      success: true,
      data: {
        groups,
        pagination: {
          current_page: pageNumber,
          total_pages: totalPages,
          total_items: count,
          items_per_page: limitNumber,
          has_next_page: pageNumber < totalPages,
          has_prev_page: pageNumber > 1,
        },
        search: {
          query: search,
          results_count: groups.length,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error.message ??
        "Something went wrong while fetching your created groups.",
      success: false,
    });
  }
});

const getMyJoinedGroups = asyncHandler(async (req, res) => {
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

    const includeMembersFilter = {
      model: db.group_members,
      as: "members",
      where: { user_id: userId },
      required: true,
      attributes: [],
    };

    const whereConditions = {};
    if (search && String(search).trim()) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const orderConditions = [];
    if (sort_by === "members_count") {
      orderConditions.push([
        sequelize.literal(`(
          SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = groups.group_id AND gm.deleted_at IS NULL
        )`),
        sort_order,
      ]);
    } else if (sort_by === "posts_count") {
      orderConditions.push([
        sequelize.literal(`(
          SELECT COUNT(*) FROM posts p WHERE p.group_id = groups.group_id
        )`),
        sort_order,
      ]);
    } else {
      orderConditions.push([sort_by, sort_order]);
    }

    const { count, rows: groups } = await db.groups.findAndCountAll({
      where: whereConditions,
      include: [
        includeMembersFilter,
        { model: db.group_tags, as: "group_tags" },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = groups.group_id AND gm.deleted_at IS NULL
            )`),
            "members_count",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM posts p WHERE p.group_id = groups.group_id
            )`),
            "posts_count",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) > 0 FROM group_members gm
              WHERE gm.group_id = groups.group_id AND gm.user_id = '${userId}' AND gm.deleted_at IS NULL
            )`),
            "is_member",
          ],
          [
            sequelize.literal(`(
                SELECT COUNT(*) > 0 FROM group_members gm
                WHERE gm.group_id = groups.group_id AND gm.user_id = '${userId}' AND gm.is_owner = 1 AND gm.deleted_at IS NULL
              )`),
            "is_owner",
          ],
        ],
      },
      order: orderConditions,
      limit: limitNumber,
      offset: offset,
      distinct: true,
    });

    const totalPages = Math.ceil(count / limitNumber);
    return res.json({
      success: true,
      data: {
        groups,
        pagination: {
          current_page: pageNumber,
          total_pages: totalPages,
          total_items: count,
          items_per_page: limitNumber,
          has_next_page: pageNumber < totalPages,
          has_prev_page: pageNumber > 1,
        },
        search: {
          query: search,
          results_count: groups.length,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error.message ??
        "Something went wrong while fetching your joined groups.",
      success: false,
    });
  }
});

const getMyGroups = asyncHandler(async (req, res) => {
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
      [Op.or]: [
        { created_by: userId },
        sequelize.literal(`EXISTS (
          SELECT 1 FROM group_members gm
          WHERE gm.group_id = groups.group_id AND gm.user_id = '${userId}' AND gm.deleted_at IS NULL
        )`),
      ],
    };

    if (search && String(search).trim()) {
      whereConditions[Op.and] = whereConditions[Op.and] || [];
      whereConditions[Op.and].push({
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      });
    }

    const orderConditions = [];
    if (sort_by === "members_count") {
      orderConditions.push([
        sequelize.literal(`(
          SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = groups.group_id AND gm.deleted_at IS NULL
        )`),
        sort_order,
      ]);
    } else if (sort_by === "posts_count") {
      orderConditions.push([
        sequelize.literal(`(
          SELECT COUNT(*) FROM posts p WHERE p.group_id = groups.group_id
        )`),
        sort_order,
      ]);
    } else if (sort_by === "relation") {
      orderConditions.push([
        sequelize.literal(
          `CASE WHEN groups.created_by = '${userId}' THEN 0 ELSE 1 END`
        ),
        sort_order,
      ]);
    } else {
      orderConditions.push([sort_by, sort_order]);
    }

    const { count, rows: groups } = await db.groups.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: db.group_tags,
          as: "group_tags",
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = groups.group_id AND gm.deleted_at IS NULL
            )`),
            "members_count",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM posts p WHERE p.group_id = groups.group_id
            )`),
            "posts_count",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) > 0 FROM group_members gm
              WHERE gm.group_id = groups.group_id AND gm.user_id = '${userId}' AND gm.deleted_at IS NULL
            )`),
            "is_member",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) > 0 FROM group_members gm
              WHERE gm.group_id = groups.group_id AND gm.user_id = '${userId}' AND gm.is_owner = 1 AND gm.deleted_at IS NULL
            )`),
            "is_owner",
          ],
          [
            sequelize.literal(
              `CASE WHEN groups.created_by = '${userId}' THEN 'created' ELSE 'joined' END`
            ),
            "relation",
          ],
        ],
      },
      order: orderConditions,
      limit: limitNumber,
      offset: offset,
      distinct: true,
    });

    const totalPages = Math.ceil(count / limitNumber);
    return res.json({
      success: true,
      data: {
        groups,
        pagination: {
          current_page: pageNumber,
          total_pages: totalPages,
          total_items: count,
          items_per_page: limitNumber,
          has_next_page: pageNumber < totalPages,
          has_prev_page: pageNumber > 1,
        },
        search: {
          query: search,
          results_count: groups.length,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error.message ?? "Something went wrong while fetching your groups.",
      success: false,
    });
  }
});

const deleteGroup = asyncHandler(async (req, res) => {
  const { group_id } = req.params;
  const user_id = req.user?.user_id;

  if (!group_id) {
    return res.status(400).json({
      message: "Group ID is required.",
      success: false,
    });
  }

  if (!user_id) {
    return res.status(401).json({
      message: "Unauthorized - User not authenticated",
      success: false,
    });
  }

  try {
    // Check if group exists
    const group = await db.groups.findByPk(group_id);
    if (!group) {
      return res.status(404).json({
        message: "Group not found.",
        success: false,
      });
    }

    // Check if user is an owner of the group
    const userMembership = await db.group_members.findOne({
      where: {
        group_id,
        user_id,
        is_owner: true,
      },
    });

    if (!userMembership) {
      return res.status(403).json({
        message: "Access denied. Only group owners can delete the group.",
        success: false,
      });
    }

    // Delete group image from cloudinary if exists
    if (group.image) {
      try {
        await deleteImageOnCloudinary(group.image);
      } catch (imageError) {
        console.error("Error deleting group image:", imageError);
        // Continue with group deletion even if image deletion fails
      }
    }

    // Delete all related data (soft delete)
    // Delete group members
    await db.group_members.destroy({
      where: { group_id },
    });

    // Delete group posts
    await db.posts.destroy({
      where: { group_id },
    });

    // Delete the group itself
    await db.groups.destroy({
      where: { group_id },
    });

    return res.json({
      message: "Group deleted successfully!",
      success: true,
      data: {
        group_id,
        title: group.title,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while deleting the group.",
      success: false,
    });
  }
});

const exitGroup = asyncHandler(async (req, res) => {
  const { group_id } = req.params;
  const user_id = req.user?.user_id;

  if (!group_id) {
    return res.status(400).json({
      message: "Group ID is required.",
      success: false,
    });
  }

  if (!user_id) {
    return res.status(401).json({
      message: "Unauthorized - User not authenticated",
      success: false,
    });
  }

  try {
    // Check if group exists
    const group = await db.groups.findByPk(group_id);
    if (!group) {
      return res.status(404).json({
        message: "Group not found.",
        success: false,
      });
    }

    // Check if user is a member of the group
    const userMembership = await db.group_members.findOne({
      where: {
        group_id,
        user_id,
      },
    });

    if (!userMembership) {
      return res.status(400).json({
        message: "You are not a member of this group.",
        success: false,
      });
    }

    // Check if user is an owner - owners cannot exit the group
    if (userMembership.is_owner) {
      return res.status(403).json({
        message:
          "Group owners cannot exit the group. Please transfer ownership or delete the group instead.",
        success: false,
      });
    }

    // Check if user is the creator - creators cannot exit if they are the only owner
    if (group.created_by === user_id) {
      const ownerCount = await db.group_members.count({
        where: {
          group_id,
          is_owner: true,
        },
      });

      if (ownerCount === 1) {
        return res.status(403).json({
          message:
            "As the group creator and only owner, you cannot exit the group. Please transfer ownership or delete the group instead.",
          success: false,
        });
      }
    }

    // Soft delete user from the group
    await db.group_members.destroy({
      where: {
        group_id,
        user_id,
      },
    });

    return res.json({
      message: "Successfully exited the group!",
      success: true,
      data: {
        group_id,
        group_title: group.title,
        user_id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while exiting the group.",
      success: false,
    });
  }
});

// Admin function to get soft-deleted groups
const getDeletedGroups = asyncHandler(async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.is_admin) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
        success: false,
      });
    }

    const deletedGroups = await db.groups.findAll({
      where: {},
      paranoid: false, // Include soft-deleted records
      order: [["deletedAt", "DESC"]],
      include: [
        {
          model: db.group_tags,
          as: "group_tags",
          attributes: ["tag_id", "tag_name"],
        },
      ],
    });

    return res.status(200).json({
      message: "Deleted groups fetched successfully.",
      success: true,
      data: deletedGroups,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Failed to fetch deleted groups.",
      success: false,
    });
  }
});

// Admin function to restore soft-deleted group
const restoreGroup = asyncHandler(async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.is_admin) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
        success: false,
      });
    }

    const { group_id } = req.params;

    if (!group_id) {
      return res.status(400).json({
        message: "Group ID is required.",
        success: false,
      });
    }

    const deletedGroup = await db.groups.findOne({
      where: { group_id },
      paranoid: false, // Include soft-deleted records
    });

    if (!deletedGroup) {
      return res.status(404).json({
        message: "Deleted group not found.",
        success: false,
      });
    }

    if (!deletedGroup.deletedAt) {
      return res.status(400).json({
        message: "Group is not deleted.",
        success: false,
      });
    }

    // Restore the group
    await deletedGroup.restore();

    return res.status(200).json({
      message: "Group restored successfully.",
      success: true,
      data: {
        group_id: deletedGroup.group_id,
        title: deletedGroup.title,
        restored_at: new Date(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ?? "Failed to restore group.",
      success: false,
    });
  }
});

module.exports = {
  createGroup,
  getGroups,
  updateGroupOwners,
  addGroupMember,
  removeGroupMember,
  reportGroup,
  getGroupDetails,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  getGroupPosts,
  getMyCreatedGroups,
  getMyJoinedGroups,
  getMyGroups,
  exitGroup,
  getDeletedGroups,
  restoreGroup,
};
