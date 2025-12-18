const BASE_URL = "http://localhost:3000/api";

// CREATE PRODUCT
export async function addProduct(productData) {
  const res = await fetch("http://localhost:3000/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to add product");
  }
  return res.json();
}

// FETCH PRODUCTS
export const fetchProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`);
  const data = await res.json();
  return data.data || data; 
};

// CREATE USER
export async function addUser(userData) {
  const response = await fetch("http://localhost:3000/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Failed to add user");
  }
  return response.json(); 
}

// FETCH USERS
export const fetchUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`);
  const data = await res.json();
  return data.data || [];
};

// ADD TO CART
export const addToCartItem = async (userId, productId, quantity = 1) => {
  const res = await fetch("http://localhost:3000/api/carts/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, productId, quantity }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to add item to cart");
  }
  return data;
};

// FETCH CARTITEMS
export const fetchAllCartItems = async () => {
  const res = await fetch("http://localhost:3000/api/carts/all");
  const data = await res.json();
  return data.items || [];
};

// FETCH ORDERS
export const fetchAllOrders = async () => {
  const res = await fetch("http://localhost:3000/api/orders/all");
  const data = await res.json();
  return data.data || [];
};

// UPDATE USER
export async function updateUser(userId, data) {
  const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update user");
  }
  return response.json(); 
};

// DELETE USER
export async function deleteUser(userId) {
  const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete user");
  }
  return true;
}

// UPDATE PRODUCT
export async function updateProduct(productId, data) {
  const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update product");
  }
  return response.json();
};

// DELEET PRODUCT
export async function deleteProduct(productId) {
  const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete product");
  }
  return productId; 
};

// DELETE CART
export async function deleteCartItem(userId, productId) {
  const response = await fetch("http://localhost:3000/api/carts/remove", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, productId }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete cart item");
  }

  return true;
}

// DELETE ORDER
export async function deleteOrder(orderId) {
  const response = await fetch(`http://localhost:3000/api/orders/delete-order/${orderId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete order");
  }
  return response.json();
}







