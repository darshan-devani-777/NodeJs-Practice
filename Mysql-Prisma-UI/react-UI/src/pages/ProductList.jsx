import { useEffect, useState } from "react";
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  addToCartItem,
} from "../services/api";

export default function ProductList() {
  // Products state
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  // Add product form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    description: "",
    price: "",
    userId: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // AddToCart
  const userId = 8;
  const handleAddToCart = async (product) => {
    try {
      await addToCartItem(userId, product.id, 1);
      alert("Item added to cart!");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  // Edit product state
  const [editingProductId, setEditingProductId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    userId: "",
    name: "",
    description: "",
    price: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // Delete product state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Fetch products on mount
  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("Failed to fetch products"));
  }, []);

  // Handle input changes for Add form
  function handleAddInputChange(e) {
    const { name, value } = e.target;
    setAddFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Handle input changes for Edit form (inline edit in table)
  function handleEditInputChange(e) {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? value : value,
    }));
  }

  // Show Add Product form
  function handleShowAddForm() {
    setShowAddForm(true);
    setAddError("");
    setAddFormData({ name: "", description: "", price: "", userId: "" });
  }

  // Cancel Add Product
  function handleAddCancel() {
    setShowAddForm(false);
    setAddError("");
  }

  // Submit Add Product
  async function handleAddProduct() {
    setAddLoading(true);
    setAddError("");

    try {
      const newProductData = {
        name: addFormData.name,
        description: addFormData.description,
        price: parseFloat(addFormData.price),
        userId: parseInt(addFormData.userId, 10),
      };

      const createdProduct = await addProduct(newProductData);
      setProducts((prev) => [...prev, createdProduct]);
      setShowAddForm(false);
      setAddFormData({ name: "", description: "", price: "", userId: "" });
    } catch (error) {
      setAddError(error.message);
    } finally {
      setAddLoading(false);
    }
  }

  // Edit product click - open inline edit inputs in table row
  function handleEditClick(product) {
    setEditingProductId(product.id);
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
    });
    setUpdateError("");
  }

  // Cancel edit inline
  function handleEditCancel() {
    setEditingProductId(null);
    setEditFormData({ name: "", description: "", price: "" });
    setUpdateError("");
  }

  // Save edited product inline
  async function handleSaveEdit(productId) {
    setUpdateLoading(true);
    setUpdateError("");

    try {
      const updatedData = {
        name: editFormData.name.trim(),
        description: editFormData.description.trim(),
        price: parseFloat(editFormData.price),
      };
      if (
        !updatedData.name ||
        !updatedData.description ||
        isNaN(updatedData.price)
      ) {
        setUpdateError("Please enter valid name, description, and price.");
        setUpdateLoading(false);
        return;
      }

      const updatedProduct = await updateProduct(productId, updatedData);

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? updatedProduct : p))
      );

      setEditingProductId(null);
      setEditFormData({ name: "", description: "", price: "" });
    } catch (error) {
      setUpdateError(error.message);
    } finally {
      setUpdateLoading(false);
    }
  }

  // Delete product
  async function handleDelete(productId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    setDeleteLoading(true);
    setDeleteError("");

    try {
      await deleteProduct(productId);

      setProducts((prev) => prev.filter((p) => p.id !== productId));

      if (editingProductId === productId) {
        setEditingProductId(null);
        setEditFormData({ name: "", description: "", price: "" });
      }
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  if (error) {
    return <div className="text-red-600 p-6">{error}</div>;
  }

  // Search-bar
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearchChange(e) {
    setSearchQuery(e.target.value);
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.price.toString().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 max-w-7xl mx-auto my-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold underline">All Products</h1>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between">
        <div className="mb-6 min-w-sm text-sm">
          <input
            type="text"
            placeholder="Search products by name, description and price..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Add Product Button */}
        {!showAddForm && (
          <button
            onClick={handleShowAddForm}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition cursor-pointer mb-6"
          >
            Add Product
          </button>
        )}
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="mb-6 p-6 border rounded bg-gray-50 max-w-md">
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Name:</label>
            <input
              type="text"
              name="name"
              value={addFormData.name}
              onChange={handleAddInputChange}
              className="border p-2 rounded w-full"
              disabled={addLoading}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Description:</label>
            <input
              type="text"
              name="description"
              value={addFormData.description}
              onChange={handleAddInputChange}
              className="border p-2 rounded w-full"
              disabled={addLoading}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Price:</label>
            <input
              type="number"
              name="price"
              value={addFormData.price}
              onChange={handleAddInputChange}
              className="border p-2 rounded w-full"
              disabled={addLoading}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">User ID:</label>
            <input
              type="number"
              name="userId"
              value={addFormData.userId}
              onChange={handleAddInputChange}
              className="border p-2 rounded w-full"
              disabled={addLoading}
            />
          </div>

          {addError && (
            <p className="text-red-600 mb-4 font-semibold">{addError}</p>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleAddProduct}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 transition cursor-pointer"
              disabled={addLoading}
            >
              {addLoading ? "Adding..." : "Add Product"}
            </button>

            <button
              onClick={handleAddCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition cursor-pointer"
              disabled={addLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Product Table */}
      <div className="overflow-x-auto border rounded">
        <div className="overflow-x-auto border rounded">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Product Id
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  User Id
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Name
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Description
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Price
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center p-4 text-gray-500 font-semibold text-2xl"
                  >
                    No products found.
                  </td>
                </tr>
              )}

              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  {editingProductId === product.id ? (
                    <>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {product.id}
                      </td>

                      {/* Editable userId */}
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <input
                          type="text"
                          name="userId"
                          value={editFormData.userId}
                          onChange={handleEditInputChange}
                          className="border rounded p-1 w-full max-w-xs text-center"
                          disabled={updateLoading}
                        />
                      </td>

                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditInputChange}
                          className="border rounded p-1 w-full max-w-xs text-center"
                          disabled={updateLoading}
                        />
                      </td>

                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <input
                          type="text"
                          name="description"
                          value={editFormData.description}
                          onChange={handleEditInputChange}
                          className="border rounded p-1 w-full max-w-xs text-center"
                          disabled={updateLoading}
                        />
                      </td>

                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <input
                          type="number"
                          name="price"
                          step="0.01"
                          value={editFormData.price}
                          onChange={handleEditInputChange}
                          className="border rounded p-1 w-full max-w-xs text-center"
                          disabled={updateLoading}
                        />
                      </td>

                      <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                        <button
                          onClick={() => handleSaveEdit(product.id)}
                          disabled={updateLoading}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-800 transition cursor-pointer"
                        >
                          {updateLoading ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleEditCancel}
                          disabled={updateLoading}
                          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-800 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        {updateError && (
                          <p className="text-red-600 mt-1">{updateError}</p>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {product.id}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {product.userId}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {product.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {product.description}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-700 transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteLoading}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800 transition cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-800 transition cursor-pointer"
                        >
                          Add to Cart
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteError && (
        <p className="text-red-600 mt-4 font-semibold">{deleteError}</p>
      )}
    </div>
  );
}
