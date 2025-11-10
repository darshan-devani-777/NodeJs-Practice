const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ADD TO CART
exports.addToCart = async (req, res) => {
  const { userId, productId, quantity = 1 } = req.body;

  try {
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId,
        productId,
        quantity,
      },
    });

    res.status(200).json({Success:true , message:"Cart Added SuccessFully." , cartItem});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL CART
exports.getAllCartItems = async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      include: {
        product: true,
        user: true, 
      },
    });

    res.status(200).json({
      success: true,
      message: "Cart Retrieved Successfully.",
      items,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SPECIFIC CARTS
exports.getCartItems = async (req, res) => {
  const { userId } = req.params;

  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: parseInt(userId) },
      include: { product: true },
    });

    res.status(200).json({success:true , message:"Cart Retrieved SuccessFully." , items});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// REMOVE CART
exports.removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const item = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      include: { product: true }, 
    });

    if (!item) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Item Removed From Cart.",
      removedItem: item,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to remove item",
      error: err.message,
    });
  }
};

// CLEAR CART
exports.clearCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const parsedUserId = parseInt(userId);

    if (isNaN(parsedUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const itemsToDelete = await prisma.cartItem.findMany({
      where: { userId: parsedUserId },
      include: { product: true }, 
    });

    const deleted = await prisma.cartItem.deleteMany({
      where: { userId: parsedUserId },
    });

    res.status(200).json({
      success: true,
      message: `Cart cleared for user ID ${parsedUserId}`,
      userId: parsedUserId,
      deletedItemCount: deleted.count,
      deletedItems: itemsToDelete,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: err.message,
    });
  }
};


