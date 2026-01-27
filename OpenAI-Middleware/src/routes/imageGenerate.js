const express = require("express");
const router = express.Router();
const imageController = require("../controllers/imageController");

// POST /api/imageGenerate
router.post("/imageGenerate", imageController.generateImage);

// POST /api/imageToText
router.post("/imageToText", imageController.imageToText);

module.exports = router;
