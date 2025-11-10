const CartServices = require('../../Service/cart.service');
const response = require("../../Helpers/response");
const cartService = new CartServices();

const handleError = (res) => {
    return response.reply(res, 500, true, 'Internal Server Error...');
};

// ADD TO CART
exports.addToCart = async (req, res) => {
    try {
        let cart = await cartService.getCart({
            user: req.user._id,
            cartItem: req.body.cartItem,
            isDelete: false
        });
        if(cart){
            return response.reply(res , 400 , true , 'Cart Already Exist...');
        }
        cart = await cartService.addToCart({
            user: req.user._id,
            ...req.body
        });
        cart.save();
        return response.reply(res , 201 , false , 'Cart Added SuccessFully...' , cart);
        
    } catch (error) {
        return handleError(res, error);
    }
};

// GET ALL CART
exports.getAllCarts = async (req, res) => {
    try {
        let carts = await cartService.getAllCart({
            user: req.user._id,
            isDelete: false
        });

        // Calculate the total price for each cart item
        carts = carts.map((item) => {
            let quantity = item.quantity || 1; 
            let unitPrice = item.cartItemDetails && item.cartItemDetails.price; 

            if (unitPrice && quantity) {
                item.totalPrice = unitPrice * quantity;
            } else {
                item.totalPrice = 0;
            }
            delete item.cartItemDetails;
            return item;
        });
        return response.reply(res, 200, false, 'Cart Retrieved Successfully...', carts);
    } catch (error) {
        return handleError(res, error);
    }
};

// GET SPECIFIC CART
exports.getCart = async (req, res) => {
    try {
        let cart = await cartService.getCartById({
            _id: req.query.cartId,
            isDelete: false
        });
        if(!cart){
            return response.reply(res , 404 , true , 'Cart Not Found...');
        }
        return response.reply(res , 200 , false , 'Cart Retrieved SuccessFully...' , cart);
    } catch (error) {
        return handleError(res, error);
    }
};

// UPDATE CART
exports.updateCart = async (req, res) => {
    try {
        let cart = await cartService.getCart({_id: req.query.cartId});
        if (!cart) {
            return response.reply(res , 404 , true , 'Cart Not Found...');
        }
        cart = await cartService.updateCart(cart._id,  {...req.body});
        return response.reply(res , 200 , false , 'Cart Item Updated SuccessFully...' , cart);
    } catch (error) {
        return handleError(res, error);
    }
};

// DELETE CART
exports.deleteCart = async (req, res) => {
    try {
        let cart = await cartService.getCart({_id: req.query.cartId});
        if(!cart){
            return response.reply(res , 404 , true , 'Cart Not Found...');
        }
        cart = await cartService.updateCart(cart._id ,{isDelete : true});
        return response.reply(res , 200 , false , 'Cart Deleted SuccessFully...' , cart); 
    } catch (error) {
        return handleError(res, error);
    }
};