const ProductServieces = require('../../Service/product.service');
const response = require("../../Helpers/response");
const productServiece = new ProductServieces();

const handleError = (res) => {
    return response.reply(res, 500, true, 'Internal Server Error...');
};

// GET ALL PRODUCT
exports.getAllProducts = async (req, res) => {
    try {
        let products = await productServiece.getAllProducts(req.query);
        return response.reply(res, 200, false, 'Products Retrieved Successfully', products);
    } catch (error) {
        return handleError(res, error);
    }
};

// GET SPECIFIC PRODUCT
exports.getProduct = async (req, res) => {
    try {
        let product = await productServiece.getProductById(req.query.productId);
        return response.reply(res , 200 , false , 'Product Retrieved SuccessFully...' , product );
    } catch (error) {
        return handleError(res, error);
    }
}