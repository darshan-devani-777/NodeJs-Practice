require("dotenv").config();
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || null;

const HF_IMAGE_GEN_MODEL =
  "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0";

const HF_IMAGE_TO_TEXT_MODEL =
  "https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224";

/* =============== LOGGER =============== */

const log = {
  info: (msg, meta) => console.log(`ℹ️  [INFO] ${msg}`, meta || ""),
  success: (msg, meta) => console.log(`✅ [SUCCESS] ${msg}`, meta || ""),
  warn: (msg, meta) => console.warn(`⚠️  [WARN] ${msg}`, meta || ""),
  error: (msg, meta) => console.error(`❌ [ERROR] ${msg}`, meta || ""),
};

const imageController = {
  /* ================= IMAGE GENERATION ================= */

  async generateImage(req, res) {
    const startTime = Date.now();
    log.info("===== IMAGE GENERATION START =====");

    try {
      log.info("Image generation request received");

      const { prompt } = req.body;

      if (!prompt || prompt.trim() === "") {
        log.warn("Prompt missing");
        return res.status(400).json({
          success: false,
          error: "Prompt is required",
        });
      }

      log.info("Prompt received", {
        length: prompt.length,
        preview: prompt.slice(0, 80) + "...",
      });

      const response = await fetch(HF_IMAGE_GEN_MODEL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      });

      if (!response.ok) {
        const errText = await response.text();
        log.error("HF Image generation failed", {
          status: response.status,
          raw: errText.slice(0, 120),
        });
        return res.status(500).json({
          success: false,
          error: "Hugging Face API error",
        });
      }

      const buffer = await response.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString("base64");

      log.success("Image generated successfully", {
        base64Length: base64Image.length,
        timeMs: Date.now() - startTime,
      });

      log.info("===== IMAGE GENERATION END =====");

      res.json({
        success: true,
        url: `data:image/png;base64,${base64Image}`,
      });
    } catch (error) {
      log.error("Image generation crashed", { message: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /* ================= IMAGE TO TEXT ================= */

  imageToText: [
    upload.single("image"),
    async (req, res) => {
      const startTime = Date.now();
      log.info("===== IMAGE TO TEXT START =====");

      try {
        log.info("Image-to-text request received");

        if (!req.file) {
          log.warn("No image uploaded");
          return res.status(400).json({ text: "Image file is required" });
        }

        log.info("Image received", {
          size: req.file.size,
          type: req.file.mimetype,
        });

        const response = await fetch(HF_IMAGE_TO_TEXT_MODEL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/octet-stream",
          },
          body: req.file.buffer,
        });

        const result = await response.json();

        if (!Array.isArray(result)) {
          log.error("Invalid HF image-to-text response", { result });
          return res.status(500).json({ text: "Invalid response from HF model" });
        }

        const labels = result.map((r) => r.label);
        const finalText = `This image likely contains: ${labels.join(", ")}.`;

        log.success("Image analyzed successfully", {
          labelsCount: labels.length,
          timeMs: Date.now() - startTime,
        });

        log.info("Final Generated Text", {
          text: finalText,
        });

        log.info("===== IMAGE TO TEXT END =====");

        res.status(200).json({
          success: true,
          text: finalText,
        });
      } catch (error) {
        log.error("Image-to-text crashed", { message: error.message });
        res.status(500).json({ text: "Failed to process image" });
      }
    },
  ],
};

module.exports = imageController;
