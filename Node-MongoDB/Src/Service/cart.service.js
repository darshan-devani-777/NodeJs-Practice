const Cart = require("../Model/cart.model");

module.exports = class CartServices {
  // ADD TO CART
  addToCart = async (body) => {
    return await Cart.create(body);
  };

  // GET ALL CART
  async getAllCart(query) {
    try {
      let find = [
        { $match: { isDelete: false } },
        {
          $lookup: {
            from: "products",
            localField: "cartItem",
            foreignField: "_id", 
            as: "cartItemDetails", 
          },
        },
        {
          $unwind: {
            path: "$cartItemDetails"
          }, 
        },
      ];
      let result = await Cart.aggregate(find);
      return result;
    } catch (error) {
      return error.message;
    }
  };

  // GET SPECIFIC CART
  getCart = async (body) => {
    return await Cart.findOne(body).populate("cartItem");
  };

  // GET CART BY ID
  getCartById = async (id) => {
    return await Cart.findById(id).populate("cartItem");
  };

  // UPDATE CART
  updateCart = async (id, body) => {
    return await Cart.findByIdAndUpdate(id, { $set: body }, { new: true });
  };

  // GET SPECIFIC CART
  getAllCarts = async (body) => {
    return await Cart.find(body).populate("cartItem");
  };

  // UPDATE MANY
  async updateMany(filter, update) {
    try {
      return await Cart.updateMany(filter, update); // Cart is your Mongoose model
    } catch (error) {
      console.log("Error in updating many:", error);
      throw error;
    }
  }
};
