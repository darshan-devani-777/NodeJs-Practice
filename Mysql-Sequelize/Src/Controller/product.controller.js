const productService = require('../Service/product.service');

// ADD PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, user_id } = req.body;

    // Validate input
    if (!name || !description || price == null || !user_id) {
      return res.status(400).json({ error: 'Name, description, price, and user_id are required' });
    }
    const product = await productService.createProduct({
      name,
      description,
      price,
      user_id
    });

    if (!product) {
      return res.status(500).json({ error: 'Error creating product' });
    }
    res.status(201).json({
      message: 'Product Created Successfully...',
      product: product
    });
  } catch (err) {
    console.error('Error in createProduct:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};


// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);
    if (!products || products.length === 0) {
      return res.status(404).json({ error: 'No products found' });
    }
    res.status(200).json({
      message: 'Products Fetched Successfully...',
      products: products
    });
  } catch (err) {
    console.error('Error in getProducts:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

// GET SPECIFIC PRODUCT
exports.getProduct = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({
      message: 'Product Fetched Successfully...',
      product: product
    });
  } catch (err) {
    console.error('Error in getProduct:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const updated = await productService.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found or update failed' });
    }
    res.json({
      message: 'Product Updated Successfully',
      updatedProduct: updated
    });
  } catch (err) {
    console.error('Error in updateProduct:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await productService.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({
      message: 'Product deleted successfully',
      deletedProduct: deleted
    });
  } catch (err) {
    console.error('Error in deleteProduct:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};
