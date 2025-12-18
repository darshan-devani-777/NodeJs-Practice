const multer = require("multer");

// Reusable storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.uploadType || "users"; 
    cb(null, `uploads/${type}`);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png"];
  cb(null, allowed.includes(file.mimetype));
};

// Create upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter,
});

module.exports = upload;
