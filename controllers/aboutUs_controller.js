const { db } = require("../models/dbconfig");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
  } = require("../utils/cloudinary");

const createAboutUs = asyncHandler(async (req, res) => {
    const {
      main_heading,
      main_content,
      testimonial_quote,
      testimonial_author,
      sections,
    } = req.body;
  
    const userId = req.user?.user_id;
  
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }
  
    if (!main_heading || !main_content) {
      return res.status(400).json({
        success: false,
        message: "Main heading and main content are required",
      });
    }
  
    let heroImageUrl = null;
  
    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.path, "image");
      heroImageUrl = uploadResult?.url || null;
    }
  
    let parsedSections = sections;
    if (typeof sections === "string") {
      try {
        parsedSections = JSON.parse(sections);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for sections",
        });
      }
    }
  
    const newAbout = await db.about_us.create({
      hero_image: heroImageUrl,
      main_heading,
      main_content,
      testimonial_quote,
      testimonial_author,
      sections: parsedSections,
      created_by: userId,
    });
  
    return res.status(201).json({
      success: true,
      message: "About Us entry created successfully",
      data: newAbout,
    });
});  

const updateAboutUs = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    main_heading,
    main_content,
    testimonial_quote,
    testimonial_author,
    sections,
  } = req.body;

  const about = await db.about_us.findByPk(id);

  if (!about) {
    return res.status(404).json({ success: false, message: "About Us entry not found" });
  }

  let updatedHeroImage = about.hero_image;

  if (req.file) {
    if (about.hero_image) {
      await deleteFromCloudinary(about.hero_image);
    }

    const uploadResult = await uploadOnCloudinary(req.file.path, "image");
    updatedHeroImage = uploadResult?.url || about.hero_image;
  }

  let parsedSections = sections;
  if (typeof sections === "string") {
    try {
      parsedSections = JSON.parse(sections);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format for sections",
      });
    }
  }

  await about.update({
    hero_image: updatedHeroImage,
    main_heading,
    main_content,
    testimonial_quote,
    testimonial_author,
    sections: parsedSections,
  });

  return res.status(200).json({
    success: true,
    message: "About Us entry updated successfully",
    data: about,
  });
});

const deleteAboutUs = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.user_id; 

  const about = await db.about_us.findByPk(id);

  if (!about) {
    return res.status(404).json({
      success: false,
      message: "About Us entry not found",
    });
  }

  if (about.hero_image) {
    await deleteFromCloudinary(about.hero_image);
  }

  await about.update({ deleted_by: userId });

  await about.destroy();

  return res.status(200).json({
    success: true,
    message: "About Us entry deleted successfully",
    data: {
      deleted_by: userId,
      deleted_entry_id: id,
      hero_image_deleted: !!about.hero_image,
    },
  });
});

const getAllAboutUs = asyncHandler(async (req, res) => {
    const allAbout = await db.about_us.findAll({
      include: [
        {
          model: db.users,
          as: "creator",
          attributes: ["user_id", "first_name", "last_name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  
    return res.status(200).json({
      success: true,
      message: "Fetched all About Us entries successfully",
      data: allAbout,
    });
});

const getAboutUsById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const about = await db.about_us.findByPk(id, {
    include: [
      {
        model: db.users,
        as: "creator",
        attributes: ["user_id", "first_name", "last_name", "email"],
      },
    ],
  });

  if (!about) {
    return res.status(404).json({
      success: false,
      message: "About Us entry not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Fetched About Us entry successfully",
    data: about,
  });
});
        
module.exports = {
    createAboutUs,
    updateAboutUs,
    deleteAboutUs,
    getAllAboutUs,
    getAboutUsById
}      