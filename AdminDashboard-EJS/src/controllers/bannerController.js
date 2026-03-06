const Banner = require("../models/Banner");
const logActivity = require("../utils/activityLogger");
const mongoose = require("mongoose");

// CREATE BANNERS
exports.createBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Banner image is required",
        errors: { bannerImage: "Banner image is required" }
      });
    }

    const { title, description, link } = req.body;
    const bannerData = {
      title: title?.trim() || "",
      description: description?.trim() || "",
      link: link?.trim() || "",
      image: req.file.path,
      createdBy: req.user._id,
    };

    const banner = await Banner.create(bannerData);
    const populatedBanner = await Banner.findById(banner._id)
      .populate("createdBy", "name email role");

    await logActivity({
      user: req.user._id,
      action: "CREATE_BANNER",
      description: `Banner created: "${banner.title}"`,
      req,
      status: "success",
    });

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: populatedBanner,
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const fieldErrors = {};
      
      Object.keys(error.errors).forEach(field => {
        const fieldName = {
          'title': 'bannerTitle',
          'description': 'bannerDescription', 
          'link': 'bannerLink',
          'image': 'bannerImage'
        }[field] || field;
        
        fieldErrors[fieldName] = error.errors[field].message;
      });

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: fieldErrors  
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Banner with this title already exists",
        errors: { bannerTitle: "Banner with this title already exists" }
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET ALL BANNERS 
exports.getAllBanners = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const cursor = req.query.cursor;
    const search = req.query.search || "";
    const order = req.query.sort === "asc" ? 1 : -1;

    const query = {};

    if (req.user.role !== "admin") {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { link: { $regex: search, $options: "i" } },
      ];
    }

    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id =
        order === 1
          ? { $gt: new mongoose.Types.ObjectId(cursor) }
          : { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const banners = await Banner.find(query)
      .populate("createdBy", "name email role")
      .sort({ _id: order })
      .limit(limit + 1); 

    const hasNextPage = banners.length > limit;
    if (hasNextPage) banners.pop(); 
    const nextCursor = banners.length ? banners[banners.length - 1]._id : null;

    res.status(200).json({
      success: true,
      message: "Banners retrieved successfully",
      pageInfo: { hasNextPage, nextCursor, limit },
      data: banners,
    });
  } catch (error) {
    console.error("❌ getAllBanners error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET BANNER BY ID
exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.bannerId)
      .populate("createdBy", "name email role");

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Banner fetched successfully",
      data: banner,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching banner by id",
      error: error.message,
    });
  }
};

// UPDATE BANNER
exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.bannerId);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    banner.title = req.body.title || banner.title;
    banner.description = req.body.description || banner.description;
    banner.link = req.body.link || banner.link;

    if (req.file) {
      banner.image = req.file.path;
    }

    await banner.save();

    await logActivity({
      user: req.user._id,
      action: "UPDATE_BANNER",
      description: `Banner updated: "${banner.title}"`,
      req,
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

// TOGGLE BANNER STATUS
exports.toggleBannerStatus = async (req, res) => {
  try {
    const { bannerId } = req.params;
    const { isActive } = req.body;

    const banner = await Banner.findById(bannerId);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    banner.isActive = isActive;
    await banner.save();

    await logActivity({
      user: req.user._id,
      action: "TOGGLE_BANNER_STATUS",
      description: `Banner "${banner.title}" set to ${isActive ? "Active" : "Inactive"}`,
      req,
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: `Banner ${isActive ? "activated successfully" : "deactivated successfully"}`,
      data: banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Status update failed",
      error: error.message,
    });
  }
};

// DELETE BANNER
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.bannerId)
      .populate("createdBy", "name email role");

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    await logActivity({
      user: req.user._id,
      action: "DELETE_BANNER",
      description: `Banner deleted: "${banner.title}"`,
      req,
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
      deletedBanner: banner
    });

  } catch (error) {

    await logActivity({
      user: req.user?._id || null,
      action: "DELETE_BANNER",
      description: "Banner deletion failed",
      req,
      status: "failed",
    });

    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};