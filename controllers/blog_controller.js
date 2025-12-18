const { asyncHandler } = require("../utils/asyncHandler");
const { db } = require("../models/dbconfig");
const fs = require("fs");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { Op } = require("sequelize");

const createBlog = asyncHandler(async (req, res) => {
  const { title, content, type, description } = req.body;
  const { file } = req;

  try {
    const { user_id } = req.user || {};

    if (!user_id) {
      return res.status(403).json({
        message: "User is required",
        success: false,
      });
    }

    if (!title || !type || !description) {
      return res.status(400).json({
        message: "Title, type, and description are required",
        success: false,
      });
    }

    const validTypes = ["baby", "pregnancy", "parenthood", "family"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid type. Allowed values: baby, pregnancy, parenthood, family.",
        success: false,
      });
    }

    // Duplicate title check
    const existingBlog = await db.blog.findOne({
      where: { title },
      paranoid: false,
    });
    if (existingBlog) {
      return res.status(400).json({
        message: "A blog with the same title already exists.",
        success: false,
      });
    }

    // Handle image upload
    let blogImageUrl = "";
    if (file && file.path) {
      if (file.size > 20 * 1024 * 1024) {
        return res.status(400).json({
          message: "File size must be less than 20MB",
          success: false,
        });
      }

      const uploadedImage = await uploadOnCloudinary(file.path, "image");
      if (uploadedImage?.url) {
        blogImageUrl = uploadedImage.url;
      }

      // Remove temp file
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    // Create blog
    const newBlog = await db.blog.create({
      posted_by: user_id,
      title,
      content,
      description,
      image: blogImageUrl,
      type,
      is_published: true,
    });

    res.status(201).json({
      message: "Blog created successfully",
      success: true,
      data: [newBlog],
    });
  } catch (error) {
    console.error("❌ createBlog error:", error);
    res.status(500).json({
      message: error.message || "Something went wrong while creating the blog.",
      success: false,
    });
  }
});

const getBlogById = asyncHandler(async (req, res) => {
  try {
    const { blog_id } = req.params;
    const blog = await db.blog.findOne({
      where: {
        blog_id: blog_id,
      },
      include: [
        {
          as: "user",
          model: db.users,
          attributes: ["user_id", "first_name", "last_name"],
        },
      ],
    });
    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
        success: false,
        data: [],
      });
    }
    // Check if user is admin - if admin, can access unpublished blogs
    const isAdmin = req.user && req.user.is_admin === true;

    if (!blog.is_published && !isAdmin) {
      return res.status(404).json({
        message: "Blog is not published",
        success: false,
        data: [],
      });
    }

    return res.status(200).json({
      message: "Blog fetched successfully",
      success: true,
      data: [
        {
          ...blog.toJSON(),
        },
      ],
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while fetching Blogs.",
      success: false,
      data: null,
    });
  }
});

const getAllBlogs = asyncHandler(async (req, res) => {
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
    const allowedSortColumns = ["title", "createdAt", "type", "blog_id"];
    if (!allowedSortColumns.includes(sort_column)) {
      sort_column = "createdAt";
    }

    // Simple search (title + description + content)
    search = req.query.search ? `%${req.query.search}%` : "";

    // Admin check
    const isAdmin = req.user && req.user.is_admin === true;

    // Search condition (multi-field)
    if (search !== "") {
      const searchCondition = {
        [Op.or]: [
          { title: { [Op.like]: search } },
          { description: { [Op.like]: search } },
          { content: { [Op.like]: search } },
        ],
      };

      if (isAdmin) {
        condition = { [Op.and]: [searchCondition] };
      } else {
        condition = {
          [Op.and]: [{ is_published: true }, searchCondition],
        };
      }
    } else {
      condition = isAdmin ? {} : { is_published: true };
    }

    // Filter by type
    if (
      req.query.type &&
      ["baby", "pregnancy", "parenthood", "family"].includes(req.query.type)
    ) {
      if (condition[Op.and]) {
        condition[Op.and].push({ type: req.query.type });
      } else {
        condition = { ...condition, type: req.query.type };
      }
    }

    // Sorting
    let orderClause;
    switch (sort_column) {
      case "title":
        orderClause = [["title", sort_order]];
        break;
      case "createdAt":
      case "created_at":
        orderClause = [["createdAt", sort_order]];
        break;
      case "type":
        orderClause = [["type", sort_order]];
        break;
      default:
        orderClause = [["createdAt", "desc"]];
        break;
    }

    // Fetch data
    let data = await db.blog.findAndCountAll({
      where: condition,
      include: [
        {
          as: "user",
          model: db.users,
          attributes: ["user_id", "first_name", "last_name"],
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
        message: "Blogs fetched successfully!",
        success: true,
        data: {
          pagination: {
            current_page: page,
            total_pages: totalPages,
            total_items: data.count,
            items_per_page: limit,
            has_next_page: parseInt(page) < totalPages,
            has_prev_page: parseInt(page) > 1,
          },
          blogs: data.rows,
        },
      });
    } else {
      return res.status(200).json({
        message: "No blogs found!",
        success: true,
        data: {
          blogs: [],
          pagination: {
            current_page: page,
            total_pages: 0,
            total_items: 0,
            items_per_page: limit,
            has_next_page: false,
            has_prev_page: false,
          },
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message ?? "Something went wrong while fetching Blogs.",
      data: null,
    });
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  const { blog_id } = req.params;
  const { title, content, type, description, is_published } = req.body;
  const { file } = req;

  try {
    const { user_id } = req.user;
    const user = await db.users.findByPk(user_id);

    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    if (!blog_id) {
      return res.status(400).json({
        message: "Please provide blog id to update",
        success: false,
      });
    }

    const blog = await db.blog.findByPk(blog_id);
    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
        success: false,
      });
    }

    const isAdmin = user.is_admin === true;
    if (blog.posted_by !== user.user_id && !isAdmin) {
      return res.status(403).json({
        message: "Unauthorized! Cannot update this blog",
        success: false,
      });
    }

    // Update fields
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (description) blog.description = description;

    // Validate & update type
    if (type) {
      const validTypes = ["baby", "pregnancy", "parenthood", "family"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          message: "Invalid type. Allowed: baby, pregnancy, parenthood, family",
          success: false,
        });
      }
      blog.type = type;
    }

    // Only admin can toggle publish state
    if (isAdmin && is_published !== undefined) {
      const val =
        typeof is_published === "string"
          ? ["true", "1", "on"].includes(is_published.toLowerCase())
          : Boolean(is_published);
      blog.is_published = val;
    }

    // Handle file upload (Cloudinary)
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        return res.status(400).json({
          message: "File size must be less than 20MB",
          success: false,
        });
      }

      const tempDir = path.join(__dirname, "../public/temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      // Use file.path if diskStorage, otherwise write buffer to disk
      const tempFilename = `${uuidv4()}-${file.originalname}`;
      const tempPath = path.join(tempDir, tempFilename);

      if (file.buffer) {
        fs.writeFileSync(tempPath, file.buffer);
      }

      const uploadPath = file.path || tempPath;

      const uploadedImage = await uploadOnCloudinary(uploadPath);
      if (uploadedImage?.url) {
        if (blog.image) {
          await deleteFromCloudinary(blog.image);
        }
        blog.image = uploadedImage.url;
      }

      // Cleanup local temp file
      if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
    }

    await blog.save();

    const updatedBlog = await db.blog.findByPk(blog_id, {
      include: [
        {
          as: "user",
          model: db.users,
          attributes: ["user_id", "first_name", "last_name"],
        },
      ],
    });

    return res.status(200).json({
      message: "Blog updated successfully",
      success: true,
      data: [updatedBlog],
    });
  } catch (error) {
    console.error("❌ updateBlog error:", error);
    return res.status(500).json({
      message: error.message || "Something went wrong while updating the blog.",
      success: false,
    });
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { blog_id } = req.params;
  try {
    const { user_id } = req.user;
    const user = await db.users.findByPk(user_id);
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    if (!blog_id) {
      return res.status(400).json({
        message: "Please provide blog id to delete",
      });
    }
    const blog = await db.blog.findByPk(blog_id);
    if (!blog) {
      return res.status(400).json({
        message: "Blog not found",
      });
    }
    // Check if user is admin or the blog author
    const isAdmin = user.is_admin === true;
    if (blog.posted_by !== user.user_id && !isAdmin) {
      return res.status(403).json({
        error: "Unauthorised! Can not delete blog",
        success: false,
        data: [],
      });
    }
    if (blog.image) {
      await deleteFromCloudinary(blog.image);
    }
    await blog.destroy();

    res.status(200).json({
      message: "Blog deleted successfully",
      success: true,
      data: [],
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while deleting blog",
      success: false,
      data: [],
    });
  }
});

module.exports = {
  createBlog,
  getBlogById,
  getAllBlogs,
  updateBlog,
  deleteBlog,
};
