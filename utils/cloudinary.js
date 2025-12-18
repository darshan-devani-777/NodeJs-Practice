const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload (image or video)
const uploadOnCloudinary = async (localFilePath, type = "image") => {
  try {
    if (!localFilePath) return null;
    const folderPath = type === "video" ? "prega_center/videos" : "prega_center/images";

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: type,
      folder: folderPath,
    });

    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return {
      url: response.secure_url,
      public_id: response.public_id,
      type,
    };
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error);
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};

// Delete from Cloudinary
const deleteFromCloudinary = async (url, type = "image") => {
  try {
    if (!url) return null;

    const segments = url.split("/");
    const publicIdWithExt = segments[segments.length - 1];
    const folder = type === "video" ? "prega_center/videos" : "prega_center/images";
    const publicId = `${folder}/${publicIdWithExt.split(".")[0]}`;

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: type,
    });
    return response;
  } catch (error) {
    console.error("❌ Failed to delete from Cloudinary:", error);
    return null;
  }
};

module.exports = {
  uploadOnCloudinary,
  deleteFromCloudinary,
};
