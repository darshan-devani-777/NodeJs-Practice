const express = require("express");
const router = express.Router();
const { upload } = require("../middlewares/multer");
const { verifyToken, verifyTokenAdmin } = require("../middlewares/verifyToken");
const coursesController = require("../controllers/courses_controller");

router.post("/create", verifyToken, upload.single("thumbnail"), coursesController.createCourse);
router.put("/update/:course_id", verifyToken, upload.single("thumbnail"), coursesController.updateCourse);
router.delete("/delete/:course_id", verifyToken, coursesController.deleteCourse);
router.post("/restore/:course_id", verifyToken, coursesController.restoreCourse);
router.get("/fetch", verifyToken, coursesController.fetchCourses);
router.get("/fetch/:course_id", verifyToken, coursesController.fetchSingleCourse);
router.post("/chapter/create", verifyToken, upload.single("video"), coursesController.createChapter);
router.put("/chapter/update/:chapter_id", verifyToken, upload.single("video"), coursesController.updateChapter);
router.delete("/chapter/delete/:chapter_id", verifyToken, coursesController.deleteChapter);
router.post("/chapter/topics/create", verifyToken, coursesController.createChapterTopics);
router.put("/chapter/topics/update/:topic_id", verifyToken, coursesController.updateChapterTopic);
router.delete("/chapter/topics/delete/:topic_id", verifyToken, coursesController.deleteChapterTopic);

router.route("/admin/list").get(verifyTokenAdmin, (req, res, next) => {
    res.render("courses", {
      currentPage: "courses",
      currentSubPage: "",
    });
  });  
    
module.exports = router;
