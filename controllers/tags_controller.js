const { db } = require("../models/dbconfig");
const { Op } = require('sequelize');
const { asyncHandler } = require("../utils/asyncHandler");

const createTAG = asyncHandler(async (req, res) => {
  const { tag_name } = req.body;
  try {
    if (!tag_name) {
      return res.status(400).json({ message: "tag_name is required" });
    }

    const newTAG = await db.tags.create({
      tag_name,
    });
    res.status(201).json({
      message: "TAG created successfully!",
      success: true,
      data: newTAG,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while creating coupon.",
      success: false,
      data: [],
    });
  }
});

const createGroupTAG = asyncHandler(async (req, res) => {
  const { tag_name } = req.body;
  try {
    if (!tag_name) {
      return res.status(400).json({ message: "Tag name is required" });
    }

    const newTAG = await db.group_tags.create({
      tag_name,
    });
    res.status(201).json({
      message: "TAG created successfully!",
      success: true,
      data: newTAG,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while creating coupon.",
      success: false,
      data: [],
    });
  }
});

const deleteTAG = asyncHandler(async (req, res) => {
  const { tag_id } = req.params;
  try {
    if (!tag_id) {
      return res.status(400).json({ error: "TAG id is required" });
    }
    const tag = await db.tags.findByPk(tag_id);
    if (!tag) {
      return res.status(400).json({ error: "TAG not found" });
    }
    let group_tag = await db.groups.findAndCountAll({
      where: {
        tag_id
      }
    })
    if(group_tag.count > 0){
      return res.status(400).json({ error: "There is a group that is connented to this table" });
    }

    let post_tag = await db.posts.findAndCountAll({
      where: {
        tag_id
      }
    })
    if(post_tag.count > 0){
      return res.status(400).json({ error: "There is a post that is connented to this table" });
    }
    // Soft delete the tag
    await tag.destroy();
    res.status(200).json({
      message: "TAG deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while deleting the tag.",
      success: false,
      data: [],
    });
  }
});

const getTAGByID = asyncHandler(async (req, res) => {
  const { tag_id } = req.params;
  try {
    if (!tag_id) {
      return res.status(400).json({ error: "TAG id is required" });
    }
    const tag = await db.tags.findByPk(tag_id);
    if (!tag) {
      return res.status(400).json({ error: "TAG not found" });
    }

    res.status(200).json({
      message: "TAG fetched successfully",
      success: true,
      data: tag
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while deleting coupon.",
      success: false,
      data: [],
    });
  }
});

const updateTAG = asyncHandler(async (req, res) => {
  const { tag_id } = req.params;
  const { tag_name} = req.body;
  try {
    const tag = await db.tags.findByPk(tag_id);
    if (!tag) {
      return res.status(400).json({ error: "TAG not found" });
    }
    
    if (tag_name) tag.tag_name = tag_name;

    await tag.save();
    res.status(200).json({
      message: "TAG updated successfully!",
      success: true,
      data: tag,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while editing article.",
      success: false,
      data: null,
    });
  }
});

const getTAGs = asyncHandler(async (req, res) => {
  try {
    let sort_column_index,
    sort_column,
    sort_order,
    condition = {},
    search = '';

    if (req.query.order) {
      sort_column_index = req.query.order[0]["column"];
      sort_column = req.query.columns[sort_column_index]["data"];
      sort_order = req.query.order[0]["dir"] || 'desc';
    } else {
      sort_column = "tag_id";
      sort_order = "desc";
    }

    search = req.query?.search && req.query.search["value"] 
    ? `%${req.query.search["value"]}%` 
    : '';

    if (search != "") {
        condition = {
            [Op.or]: [
            { tag_name: { [Op.like]: search } },
            ],
        };
    }

    let data = await db.tags.findAndCountAll({
      where: condition,
      order: [[sort_column, sort_order]],
      limit: Number(req?.query?.length) || 10,
      offset: Number(req?.query?.start) || 0,
    });

    if (data && data.rows.length && data.count) {
      data = JSON.parse(JSON.stringify(data));
      return res.status(200).json({
        success: true,
        draw: req?.query?.draw || 10,
        recordsTotal: data.count,
        recordsFiltered: data.count,
        data: data.rows,
      });
    } else {
      return res.status(200).json({
        success: true,
        draw: req?.query?.draw || 10,
        recordsTotal: 0,
        recordsFiltered: 0,
        data: [],
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      draw: req?.query?.draw || 10,
      recordsTotal: 0,
      recordsFiltered: 0,
      data: [],
    });
  }
});

const listTAGs = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  try {
    const tags = await db.tags.findAndCountAll({
      limit,
      offset,
    });
    res.status(200).json({
      message: "TAGs fetched successfully!",
      success: true,
      data: tags,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while fetching articles.",
      success: false,
      data: [],
    });
  }
});

const getAllTAGs = asyncHandler(async (req, res) => {
  try {
    const tags = await db.tags.findAll();
    res.status(200).json({
      message: "All TAGs fetched successfully!",
      success: true,
      data: tags,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while fetching articles.",
      success: false,
      data: [],
    });
  }
});

const getAllGroupTAGs = asyncHandler(async (req, res) => {
  try {
    const tags = await db.group_tags.findAll();
    res.status(200).json({
      message: "All TAGs fetched successfully!",
      success: true,
      data: tags,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message ?? "Something went wrong while fetching articles.",
      success: false,
      data: [],
    });
  }
});

module.exports = {
  createTAG,
  deleteTAG,
  getTAGByID,
  updateTAG,
  getTAGs,
  listTAGs,
  getAllTAGs,
  getAllGroupTAGs,
  createGroupTAG
};
