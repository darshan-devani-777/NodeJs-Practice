const ProductServieces = require('../../Service/product.service');
const response = require("../../Helpers/response");
const productServiece = new ProductServieces();

const handleError = (res) => {
    return response.reply(res, 500, true, 'Internal Server Error...');
};

// ADD NEW PRODUCT
exports.addNewProduct = async (req, res) => {
    try {
        let product = await productServiece.getProduct({ title: req.body.title, isDelete: false });
        if (product) {
            return response.reply(res , true , 401 , 'Product Already Exist...');
        }
        product = await productServiece.addNewProduct({ ...req.body });
        return response.reply(res , 201 , false , 'Product Added SuccessFully...' , product);
    } catch (error) {
        return handleError(res, error);
    }
};

// GET ALL PRODUCT
exports.getAllProducts = async (req, res) => {
    try {
        let product = await productServiece.getAllProducts(req.query);
        return response.reply(res , 200 , false , 'Product Retrieved SuccessFully...' , product);
    } catch (error) {
        return handleError(res, error);
    }
};

// GET SPECIFIC PRODUCT
exports.getProduct = async (req, res) => {
    try {
        let product = await productServiece.getProductById(req.query.productId);
        if (!product) {
            return response.reply(res , 404 , true , 'Product Not Found...');
        }
        return response.reply(res , 200 , false , 'Product Retrieved SuccessFully...' , product);
    } catch (error) {
        return handleError(res, error);
    }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
    try {
        let product = await productServiece.getProductById(req.query.productId);
        if (!product) {
            return response.reply(res , 404 , true , 'Product Not Found...');
        }
        product = await productServiece.updateProduct(product._id, {...req.body});
        return response.reply(res , false , 200 , 'Product Updated SuccessFully...' , product);
    } catch (error) {
        return handleError(res, error);
    }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
    try {
        let product = await productServiece.getProductById(req.query.productId);
        if (!product) {
            return response.reply(res , 404 , true , 'Product Not Found...');
        }
        product = await productServiece.updateProduct(product._id, {isDelete: true });
        return response.reply(res , 200 , false , 'Product Deleted SuccessFully...' , product);
    } catch (error) {
        return handleError(res, error);
    }
};