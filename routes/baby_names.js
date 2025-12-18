const express = require("express");
const { getNameSuggestions, toggleSaveName, listMySavedNames } = require("../controllers/baby_names_controller.js");
const { optionalVerifyToken } = require("../middlewares/optionalVerifyToken.js");
const { verifyToken } = require("../middlewares/verifyToken.js");

const router = express.Router();
router.get("/", optionalVerifyToken, getNameSuggestions);
router.get("/save/:name_id", verifyToken, toggleSaveName);
router.get("/save", verifyToken, listMySavedNames);

module.exports = router;
