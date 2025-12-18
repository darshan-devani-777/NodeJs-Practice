const OrderServices = require('../../Service/order.service');
const orderService = new OrderServices();
const CartServices = require('../../Service/cart.service');
const cartService = new CartServices();
const response = require("../../Helpers/response");

const handleError = (res) => {
    return response.reply(res, 500, true, 'Internal Server Error...');
};

// ADD NEW ORDER
exports.addNewOrder = async (req, res) => {
    try {
      let cartItems = await cartService.getAllCarts({ user: req.user._id, isDelete: false });
      if (!cartItems || cartItems.length === 0) {
        return response.reply(res , 404 , true , 'Cart Not Found...');
      }
  
      let orderItems = cartItems.map(item => ({
        product: item.cartItem._id,
        quantity: item.quantity,
        price: item.cartItem.price
      }));
  
      let totalPrice = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
      let newOrder = await orderService.addToOrder({
        user: req.user._id,
        items: orderItems,
        totalAmount: totalPrice
      });
  
      const updateData = { $set: { isDelete: true } };
      if (updateData) {
        await cartService.updateMany({ user: req.user._id }, updateData);
      } else {
        return response.reply(res , 400 , true , 'Invalid Update Data...');
      }
      return response.reply(res , 200 , false , 'Ordered Placed SuccessFully...' , newOrder);
    } catch (error) {
      return handleError(res, error);
    }
  };
  
// GET ALL ORDER
exports.getAllOrders = async (req, res) => {
    try {
        let orders = await orderService.getAllOrders({ user: req.user._id, isDelete: false });
        if (!orders || orders.length === 0) {
            return response.reply(res , 404 , true , 'Order Not Found...');
        }
        return response.reply(res , 200 , false , 'Order Retrieved SuccessFully...' , orders);
    } catch (error) {
        return handleError(res, error);
    }
};

// GET SPECIFIC ORDER
exports.getOrder = async (req, res) => {
    try {
        let order = await orderService.getOrderById(req.query.orderId);
        if (!order) {
            return response.reply(res , 404 , true , 'Order Not Found...');
        }
        return response.reply(res , 200 , false , 'Order Retrieved SuccessFully...' , order);
    } catch (error) {
        return handleError(res, error);
    }
};

// DELETE ORDER
exports.deleteOrder = async (req, res) => {
    try {
        let order = await orderService.getOrder({ _id: req.query.orderId });
        if (!order) {
            return response.reply(res , 404 , true , 'Order Not Found...');
        }
        order = await orderService.deleteOrder(req.query.orderId, { isDelete: true });
        return response.reply(res , 200 , false , 'Order Deleted SuccessFully...' , order);
    } catch (error) {
        return handleError(res, error);
    }
};
