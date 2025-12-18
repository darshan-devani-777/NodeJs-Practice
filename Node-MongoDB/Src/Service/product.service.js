const Product = require("../Model/product.model");
const mongoose = require("mongoose");

module.exports = class ProductServices {
  // ADD NEW PRODUCT
  addNewProduct = async (body) => {
    return await Product.create(body);
  };

  // GET PRODUCT
  getProduct = async(body) => {
    return await Product.findOne(body);
  }

  // GET ALL PRODUCTS
  getAllProducts = async (query) => {
    try {
      // Pagination
      const pageNo = Number(query.pageNo || 1);
      const perPage = Number(query.perPage || 10);
      const skip = (pageNo - 1) * perPage;

      const matchStage = {
        isDelete: false,
      };

      // Search keyword (title, description, category, price)
      if (query.search && query.search.trim() !== "") {
        const searchRegex = new RegExp(
          query.search.trim().replace(/\s+/g, " "),
          "i"
        );

        matchStage.$or = [
          { title: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { category: { $elemMatch: { $regex: searchRegex } } },
          {
            // Convert price to string for regex search
            $expr: {
              $regexMatch: {
                input: { $toString: "$price" },
                regex: searchRegex,
              },
            },
          },
        ];
      }

      // Category filter
      if (query.category && query.category.trim() !== "") {
        matchStage.category = {
          $elemMatch: { $regex: new RegExp(query.category.trim(), "i") },
        };
      }

      // Product ID filter
      if (query.productId && mongoose.Types.ObjectId.isValid(query.productId)) {
        matchStage._id = new mongoose.Types.ObjectId(query.productId);
      }

      // Final aggregation pipeline
      const pipeline = [
        { $match: matchStage },
        {
          $facet: {
            paginatedResults: [{ $skip: skip }, { $limit: perPage }],
            totalCount: [{ $count: "count" }],
          },
        },
      ];

      const result = await Product.aggregate(pipeline);
      const totalCount = result[0].totalCount[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / perPage);

      return {
        totalCounts: totalCount,
        totalPages,
        currentPage: pageNo,
        result: result[0].paginatedResults,
      };
    } catch (error) {
      console.error("Error in getAllProducts:", error);
      throw error;
    }
  };

  // GET PRODUCT BY ID
  getProductById = async (id) => {
    return await Product.findById(id);
  };

  // UPDATE PRODUCT
  updateProduct = async (id, body) => {
    return await Product.findByIdAndUpdate(id, { $set: body }, { new: true });
  };
};
