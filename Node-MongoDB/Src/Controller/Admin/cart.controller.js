const CartServices = require("../../Service/cart.service");
const response = require("../../Helpers/response");
const cartService = new CartServices();

// GET ALL CART
exports.getAllCart = async (req, res) => {
  try {
    let carts = await cartService
      .getAllCart({ isDelete: false });
        // calculate total price for each items 
        carts = carts.map((item )=>{
          let quantity = item.cartItem.quantity;
          let unitPrice = item.cartItem.price;
          item.totalPrice=unitPrice*quantity;
          console.log(item);
          delete item.cartItem;
          // console.log(item);
          return item;
      });
    return response.reply(res , 200 , false , 'Cart Retrieved SuccessFully...' , carts);
  } catch (error) {
    return response.reply(res , 500 , true , 'Internal Server Error...');
  }
};