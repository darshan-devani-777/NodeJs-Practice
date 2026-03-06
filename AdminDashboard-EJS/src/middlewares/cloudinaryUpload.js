const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const getCloudinaryFolder = (type) => {
  const parentFolder = "admin_dashboard";

  if (type === "blog") return `${parentFolder}/blogs`;
  if (type === "product") return `${parentFolder}/products`;
  if (type === "banner") return `${parentFolder}/banners`;

  throw new Error("Invalid folder type");
};

const storage = (type) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: getCloudinaryFolder(type),
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1920, crop: "limit" }],
    },
  });

const upload = (type) =>
  multer({
    storage: storage(type),
    limits: { fileSize: 5 * 1024 * 1024 },
  });

module.exports = upload;