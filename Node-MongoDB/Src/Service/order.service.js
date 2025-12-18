const Order = require("../Model/order.model");

module.exports = class OrderServices {
    // ADD NEW ORDER
    addToOrder = async(body) => {
        return await Order.create(body);
    };

    // GET ALL ORDER
    getAllOrders = async(body) => {
        return await Order.find(body).populate("user").populate("items");
    };

    // GET SPECIFIC ORDER
    getOrder = async(id) => {
        return await Order.findOne(id).populate("user").populate("items");
    };

    // GET ORDER BY ID
    getOrderById = async(id) => {
        return await Order.findById(id).populate("user").populate("items");
    };

    // DELETE ORDER
    deleteOrder = async(id , body) => {
        return await Order.findByIdAndUpdate(id, { $set: body }, { new: true }).populate("user").populate("items");
    };
};
