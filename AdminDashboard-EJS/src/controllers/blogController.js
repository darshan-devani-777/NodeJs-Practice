const Blog = require("../models/Blog");
const mongoose = require("mongoose");
const logActivity = require("../utils/activityLogger");
const getValidationError = require("../utils/getValidationError");

/* ------------------- CREATE BLOG ------------------- */
exports.createBlog = async (req, res) => {
  try {
    let { title, content, tags } = req.body;

    title = title.trim();

    const existing = await Blog.findOne({ title });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Blog with title "${title}" already exists`,
      });
    }

    if (tags && Array.isArray(tags)) {
      tags = tags.map((t) => t.trim()).filter((t) => t.length > 0);
    } else {
      tags = [];
    }

    const blog = await Blog.create({
      title,
      content,
      tags,
      author: req.user._id,
    });

    await logActivity({
      user: req.user._id,
      action: "CREATE_BLOG",
      description: `Blog created with title "${title}"`,
      req,
      status: "success",
    });

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("❌ createBlog error:", error.message);
    const message = getValidationError(error);

    await logActivity({
      user: req.user?._id || null,
      action: "CREATE_BLOG",
      description: "Blog creation failed",
      req,
      status: "failed",
    });

    res.status(400).json({ success: false, message });
  }
};

/* ------------------- GET ALL BLOGS ------------------- */
exports.getAllBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const cursor = req.query.cursor;
    const search = req.query.search || "";
    const order = req.query.sort === "asc" ? 1 : -1;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id =
        order === 1
          ? { $gt: new mongoose.Types.ObjectId(cursor) }
          : { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const blogs = await Blog.find(query)
      .populate("author", "name email role")
      .sort({ _id: order })
      .limit(limit + 1);

    const hasNextPage = blogs.length > limit;
    if (hasNextPage) blogs.pop();
    const nextCursor = blogs.length ? blogs[blogs.length - 1]._id : null;

    res.status(200).json({
      success: true,
      message: "Blog retrieved successfully",
      pageInfo: { hasNextPage, nextCursor, limit },
      data: blogs,
    });
  } catch (error) {
    console.error("❌ getAllBlogs error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- GET SINGLE BLOG ------------------- */
exports.getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId).populate("author", "name email role");

    if (!blog)
      return res.status(404).json({ success: false, message: "Blog not found" });

    res.status(200).json({ success: true, message: "Blog retrieved successfully", data: blog });
  } catch (error) {
    console.error("❌ getBlogById error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- GET BLOG STATS ------------------- */
exports.getBlogStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Blog.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          published: [
            { $match: { isPublished: true } },
            { $count: "count" }
          ],
          draft: [
            { $match: { isPublished: false } },
            { $count: "count" }
          ],
          today: [
            { $match: { createdAt: { $gte: today } } },
            { $count: "count" }
          ]
        }
      }
    ]);

    const s = stats[0];

    res.json({
      success: true,
      message: "Blog stats retrieved successfully",
      stats: {
        total: s.total[0]?.count || 0,
        published: s.published[0]?.count || 0,
        draft: s.draft[0]?.count || 0,
        today: s.today[0]?.count || 0
      }
    });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};

/* ------------------- UPDATE BLOG ------------------- */
exports.updateBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    let { title, content, tags, isPublished } = req.body;

    const blog = await Blog.findById(blogId);

    if (!blog)
      return res.status(404).json({ success: false, message: "Blog not found" });

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden access" });
    }

    if (title) blog.title = title;
    if (content) blog.content = content;

    if (tags && Array.isArray(tags)) {
      blog.tags = tags.map((t) => t.trim()).filter((t) => t.length > 0);
    }

    if (typeof isPublished === "boolean") blog.isPublished = isPublished;

    await blog.save();

    await logActivity({
      user: req.user._id,
      action: "UPDATE_BLOG",
      description: `Blog updated with id "${blogId}"`,
      req,
      status: "success",
    });

    res.status(200).json({ success: true, message: "Blog updated successfully", data: blog });
  } catch (error) {
    console.error("❌ updateBlog error:", error.message);

    const message = error.name === "ValidationError" ?
      getValidationError(error) :
      "Server error";

    await logActivity({
      user: req.user?._id || null,
      action: "UPDATE_BLOG",
      description: "Blog update failed",
      req,
      status: "failed",
    });

    res.status(message === "Server error" ? 500 : 400).json({ success: false, message });
  }
};

/* ------------------- DELETE BLOG ------------------- */
exports.deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (
      blog.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const deletedBlogData = {
      id: blog._id,
      title: blog.title,
      author: blog.author,
      isPublished: blog.isPublished,
    };

    await Blog.findByIdAndDelete(blogId);

    await logActivity({
      user: req.user._id,
      action: "DELETE_BLOG",
      description: `Blog deleted: "${blog.title}" (ID: ${blogId})`,
      req,
      status: "success",
    });

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
      data: deletedBlogData,
    });
  } catch (error) {
    console.error("❌ deleteBlog error:", error);

    await logActivity({
      user: req.user?._id || null,
      action: "DELETE_BLOG",
      description: "Blog deletion failed",
      req,
      status: "failed",
    });

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ------------------- BULK PUBLISH/UNPUBLISH BLOGS ------------------- */
exports.bulkTogglePublishBlogs = async (req, res) => {
  try {
    const { blogIds, isPublished } = req.body;

    if (!blogIds || !blogIds.length || typeof isPublished !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    await Blog.updateMany(
      { _id: { $in: blogIds } },
      { isPublished }
    );

    await logActivity({
      user: req.user._id,
      action: "BULK_TOGGLE_PUBLISH_BLOGS",
      description: `Bulk ${isPublished ? "published" : "unpublished"
        } blogs with ids ${blogIds}`,
      req,
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: `Blogs ${isPublished ? "published" : "unpublished"} successfully`,
    });
  } catch (error) {
    console.error("❌ bulkTogglePublishBlogs error:", error.message);

    await logActivity({
      user: req.user?._id || null,
      action: "BULK_TOGGLE_PUBLISH_BLOGS",
      description: "Bulk publish/unpublish blogs failed",
      req,
      status: "failed",
    });

    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------- UPLOAD BLOG IMAGE ------------------- */
exports.uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        uploaded: false,
        error: { message: "No image uploaded" }
      });
    }

    return res.status(200).json({
      uploaded: true,
      url: req.file.path,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      uploaded: false,
      error: { message: "Image upload failed" }
    });
  }
};


