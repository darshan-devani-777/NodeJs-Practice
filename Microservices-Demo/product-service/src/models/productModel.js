const products = [];

module.exports = {
  getAllProducts: () => products,

  getProductByName: (name) => {
    return products.find(
      (product) => product.name.toLowerCase() === name.toLowerCase()
    );
  },

  createProduct: ({ name, price, ownerId, ownerName }) => {
    const existing = products.find(
      (product) => product.name.toLowerCase() === name.toLowerCase()
    );

    if (existing) {
      return null;
    }

    const newProduct = {
      id: products.length + 1,
      name,
      price,
      ownerId,
      ownerName,
    };

    products.push(newProduct);
    return newProduct;
  },
};
