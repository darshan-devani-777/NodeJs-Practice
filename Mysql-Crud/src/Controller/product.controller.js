const productModel = require('../Model/product.model');

exports.showAddProductForm = (req, res) => {
  const userId = parseInt(req.query.userId);
  const message = req.query.message;

  res.render('addProduct', {
    error: null,
    message: message || null,  
    userId: userId
  });
};

exports.addProduct = async (req, res) => {
  const { name, price, description } = req.body;
  const userId = parseInt(req.body.userId); 

  if (!name || !price || !userId) {
    return res.render('addProduct', {
      error: 'All fields are required!',
      userId,
      message: null
    });
  }

  try {
    await productModel.createProduct(name, price, description, userId);
    res.redirect(`/getProducts?userId=${userId}&message=Product Added Successfully!`);
  } catch (error) {
    console.error(error);
    res.render('addProduct', {
      error: 'Error adding product.',
      userId,
      message: null
    });
  }
};
