const { asyncHandler } = require("../utils/asyncHandler");
const { db } = require("../models/dbconfig");
const { Sequelize } = require("sequelize");

const getNameSuggestions = asyncHandler(async (req, res) => {
  let { initial, origin, gender, limit = 20, page = 1 } = req.query;
  const userId = req.user?.user_id || null;

  const origins = ["hindu", "indian", "muslim", "british", "english"];
  limit = parseInt(limit);
  page = parseInt(page);

  if (
    !initial ||
    !(origin ? origins.includes(origin) : true) ||
    !gender ||
    isNaN(limit) ||
    isNaN(page) ||
    limit <= 0 ||
    page <= 0
  ) {
    return res.status(400).json({ message: "Invalid request parameters" });
  }

  try {
    const namesResult = await db.baby_names.findAndCountAll({
      where: {
        name: {
          [Sequelize.Op.startsWith]: initial,
        },
        ...(origin && {
          origin:
            origin === "indian"
              ? { [Sequelize.Op.in]: ["hindu", "muslim"] }
              : origin,
        }),
        gender,
      },
      limit,
      offset: (page - 1) * limit,
    });

    const babyNames = namesResult.rows;

    let savedNameIds = new Set();

    if (userId) {
      const savedNames = await db.saved_names.findAll({
        where: {
          user_id: userId,
          name_id: {
            [Sequelize.Op.in]: babyNames.map((name) => name.name_id),
          },
        },
        attributes: ["name_id"],
      });

      savedNameIds = new Set(savedNames.map((s) => s.name_id));
    }

    const namesWithSavedFlag = babyNames.map((name) => ({
      ...name.toJSON(),
      is_saved: savedNameIds.has(name.name_id),
    }));

    res.status(200).json({
      message: "Names fetched successfully!",
      success: true,
      data: {
        names: namesWithSavedFlag,
        count: namesResult.count,
        limit,
        page,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

const toggleSaveName = asyncHandler(async (req, res) => {
  const { name_id } = req.params;
  const userId = req.user?.user_id;

  if (!name_id || !userId) {
    return res.status(400).json({ message: "Invalid request parameters" });
  }

  try {
    const savedName = await db.saved_names.findOne({
      where: {
        user_id: userId,
        name_id,
      },
    });

    if (savedName) {
      // Soft delete the saved name
    await db.saved_names.destroy({ where: { user_id: userId, name_id } });
      res
        .status(200)
        .json({ message: "Name unsaved successfully!", success: true });
    } else {
      await db.saved_names.create({ user_id: userId, name_id });
      res
        .status(201)
        .json({ message: "Name saved successfully!", success: true });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
});

const listMySavedNames = asyncHandler(async (req, res) => {
  const userId = req.user?.user_id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }

  try {
    const savedNames = await db.saved_names.findAndCountAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: db.baby_names,
          as: "baby_name",
          attributes: ["name_id", "name", "meaning", "gender", "origin"],
        },
      ],
    });

    res.status(200).json({
      message: "Saved names fetched successfully!",
      success: true,
      data: savedNames,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
});

module.exports = { getNameSuggestions, toggleSaveName, listMySavedNames };
