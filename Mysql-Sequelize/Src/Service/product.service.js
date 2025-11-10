const { Product } = require("../Model/product.model");
const { Op } = require("sequelize");

// CREATE product
exports.createProduct = async (data) => {
  return await Product.create({
    name: data.name,
    description: data.description,
    price: data.price,
    user_id: data.user_id,
  });
};

// GET all products
exports.getAllProducts = async (query) => {
  const { search, price, user_id, page = 1, limit = 10 } = query;

  const offset = (page - 1) * limit;
  const where = {};

  // Search by name
  if (search) {
    const isNumeric = !isNaN(search);
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
      ...(isNumeric ? [{ price: Number(search) }] : []),
    ];
  }

  // Filter by exact price
  if (price) {
    where.price = parseFloat(price);
  }

  // Filter by user_id
  if (user_id) {
    where.user_id = user_id;
  }

  const products = await Product.findAndCountAll({
    where,
    offset: parseInt(offset),
    limit: parseInt(limit),
  });

  return {
    totalItems: products.count,
    totalPages: Math.ceil(products.count / limit),
    currentPage: parseInt(page),
    data: products.rows,
  };
};

// GET product by ID
exports.getProductById = async (id) => {
  return await Product.findByPk(id);
};

// UPDATE product
exports.updateProduct = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) return null;
  return await product.update(data);
};

// DELETE product
exports.deleteProduct = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) return false;
  await product.destroy();
  return true;
};
