import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem("token");
let currentUserId = null;
let currentUserRole = null;

if (token) {
  try {
    const decoded = jwtDecode(token);
    currentUserId = decoded.id || decoded._id || decoded.userId;
    currentUserRole = decoded.role || "user";
  } catch (err) {
    console.error("Invalid token");
  }
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { productValidationSchema } from "../validation/validation";

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceSort, setPriceSort] = useState("asc");
  const [editing, setEditing] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState("");
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedReviewText, setEditedReviewText] = useState("");
  const [editedReviewRating, setEditedReviewRating] = useState(0);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    categories: [],
    quantity: "",
    image: null,
  });
  const [quantities, setQuantities] = useState({});
  const [errors, setErrors] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchedCategories = Array.from(
      new Set(allProducts.flatMap((product) => product.categories))
    );
    setCategories(fetchedCategories);
  }, [allProducts]);

  // Submit Review
  const handleSubmitReview = async () => {
    if (!newReview || newRating === 0) {
      alert("Please add both rating and review.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to submit a review.");
      return;
    }

    try {
      setSubmittingReview(true);

      const res = await fetch(`http://localhost:1212/api/reviews/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: form._id,
          rating: newRating,
          review: newReview,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Review Submitted Successfully...!");
        setNewReview("");
        setNewRating(0);
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (err) {
      alert("Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to delete your review.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `http://localhost:1212/api/reviews/delete/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Review Deleted Successfully!");
      } else {
        alert(data.message || "Failed to delete review");
      }
    } catch (err) {
      alert("Error deleting review");
    }
  };

  // Edit Review
  const handleEditReview = async (reviewId) => {
    const token = localStorage.getItem("token");

    if (!editedReviewText || editedReviewRating === 0) {
      alert("Please enter both review and rating.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:1212/api/reviews/update/${reviewId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: editedReviewRating,
            review: editedReviewText,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Review Updated Successfully!");
        setEditingReviewId(null);
        fetchUpdatedProduct();
      } else {
        alert(data.message || "Failed to update review");
      }
    } catch (error) {
      console.error("Update error", error);
      alert("Error updating review");
    }
  };

  // Edit Click review
  const handleEditClick = (review) => {
    setEditingReviewId(review._id);
    setEditedReviewText(review.review);
    setEditedReviewRating(review.rating);
  };

  // HANDLE SEARCH
  const handleSearch = (query, selectedCategory, priceSort) => {
    const lowerQuery = query.toLowerCase();

    // FILTER QUERY
    let filtered = allProducts.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";
      const price = product.price?.toString() || "";
      const categories = Array.isArray(product.categories)
        ? product.categories.join(", ").toLowerCase()
        : (product.categories || "").toLowerCase();

      return (
        name.includes(lowerQuery) ||
        description.includes(lowerQuery) ||
        price.includes(lowerQuery) ||
        categories.includes(lowerQuery)
      );
    });

    // FILTER CATEGORY WISE
    if (selectedCategory && selectedCategory !== "") {
      filtered = filtered.filter((product) =>
        product.categories?.some((category) =>
          category.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      );
    }

    // FILTER PRICE WISE
    if (priceSort === "asc") {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (priceSort === "desc") {
      filtered = filtered.sort((a, b) => b.price - a.price);
    }
    setProducts(filtered);
  };

  // FETCH PRODUCT
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      if (res.data.success && Array.isArray(res.data.products)) {
        setAllProducts(res.data.products);
        setProducts(res.data.products);
      } else {
        alert(res.data.message || "Failed to fetch products.");
        setAllProducts([]);
        setProducts([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching products");
    }
  };

  // DELETE PRODUCT
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (isConfirmed) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert("Delete failed");
        console.error(err);
      }
    } else {
      console.log("Delete operation was canceled.");
    }
  };

  // EDIT PRODUCT
  const handleEdit = (product) => {
    setFormMode("edit");
    setFormVisible(true);
    setEditing(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      categories: Array.isArray(product.categories)
        ? product.categories
        : typeof product.categories === "string"
        ? product.categories.split(",").map((c) => c.trim())
        : [],
      quantity: product.quantity,
      image: null,
    });
  };

  // VIEW PRODUCT
  const handleView = (product) => {
    setFormMode("view");
    setFormVisible(true);
    setEditing(null);
    setForm({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      categories: Array.isArray(product.categories)
        ? product.categories
        : typeof product.categories === "string"
        ? product.categories.split(",").map((c) => c.trim())
        : [],
      quantity: product.quantity,
      image: product.image,
      avgRating: product.avgRating || "0.0",
      reviews: product.reviews || [],
    });
  };

  // VALIDATE FORM
  const validateForm = async () => {
    try {
      if (typeof form.categories === "string") {
        try {
          form.categories = JSON.parse(form.categories);
        } catch {
          form.categories = [form.categories];
        }
      }

      await productValidationSchema.validate(form, { abortEarly: false });
      return true;
    } catch (err) {
      if (err.inner) {
        const errors = {};
        err.inner.forEach((e) => {
          errors[e.path] = e.message;
        });
        setErrors(errors);
      }
      return false;
    }
  };

  // UPDATE PRODUCT
  const handleUpdate = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "categories") {
          formData.append("categories", JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      await api.put(`/products/${editing}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setEditing(null);
      setFormVisible(false);
      setFormMode("");
      resetForm();
      fetchProducts();
    } catch (err) {
      alert("Update failed");
    }
  };

  // CREATE PRODUCT
  const handleCreate = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "categories") {
          formData.append("categories", JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      resetForm();
      setFormVisible(false);
      setFormMode("");

      setTimeout(() => {
        fetchProducts();
      }, 500);
    } catch (err) {
      alert("Create failed");
    }
  };

  // ADD-TO-CART
  const handleAddToCart = async (productId, quantity) => {
    try {
      const res = await api.post("/carts/add", {
        productId,
        quantity,
      });
      if (res.data.success) {
        alert("Product added to cart!");
      } else {
        alert(res.data.message || "Failed to add to cart");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error adding to cart");
    }
  };

  // Reset Form
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      categories: [],
      quantity: "",
      image: null,
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen mx-auto p-6 text-gray-900 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      {formVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 overflow-y-auto">
          {formMode === "view" ? (
            <div
              className="bg-gray-900 text-white shadow-2xl p-6 rounded-2xl w-full max-w-xl border border-gray-700 transition-all duration-300"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <h2 className="text-2xl mb-5 font-bold text-indigo-400">
                {form.name}
              </h2>

              {/* Image with zoom */}
              <div className="overflow-hidden rounded-lg mb-3 border border-gray-500 h-56">
                <img
                  src={`http://localhost:1212${form.image}`}
                  alt={form.name}
                  className="w-full h-full object-contain transform transition-transform duration-300 hover:scale-110 cursor-pointer"
                />
              </div>

              <div className="space-y-3 mt-7">
                <p>
                  <span className="font-medium text-indigo-400">
                    Description:
                  </span>{" "}
                  <span className="text-gray-400 text-sm">
                    {form.description}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-indigo-400">Price:</span>{" "}
                  <span className="text-gray-400 text-sm">${form.price}</span>
                </p>
                <p>
                  <span className="font-medium text-indigo-400">
                    Categories:
                  </span>{" "}
                  <span className="text-gray-400 text-sm">
                    {form.categories?.join(", ")}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-indigo-400">Quantity:</span>{" "}
                  <span className="text-gray-400 text-sm">{form.quantity}</span>
                </p>
              </div>

              <div className="w-full flex flex-col gap-5 mt-6">
                {/* Top Buttons Row */}
                <div className="flex flex-wrap justify-between items-center gap-4 w-full">
                  {/* Quantity + Add to Cart */}
                  {!isAdmin && (
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        className="w-20 px-3 py-1 rounded-md bg-gray-700 text-white text-center border border-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
                        value={quantities[form._id] || 1}
                        onChange={(e) =>
                          setQuantities({
                            ...quantities,
                            [form._id]: parseInt(e.target.value),
                          })
                        }
                      />
                      <button
                        onClick={() =>
                          handleAddToCart(form._id, quantities[form._id] || 1)
                        }
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-200 cursor-pointer"
                      >
                        🛒 Add to Cart
                      </button>
                    </div>
                  )}

                  {/* Edit & Delete */}
                  {isAdmin && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(form)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-800 active:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-200 cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(form._id)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-800 active:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-200 cursor-pointer"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Average Rating and Reviews Section */}
                {form.avgRating && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm font-medium text-indigo-400">
                      Average Rating:
                    </span>
                    <span className="bg-green-600 text-white text-sm font-semibold px-2 py-1 rounded-full shadow-sm">
                      {form.avgRating}
                    </span>
                    <span className="text-gray-400 text-md font-semibold">
                      / 5
                    </span>
                  </div>
                )}

                {form.reviews && form.reviews.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {form.reviews.map((review, index) => (
                      <div
                        key={index}
                        className="bg-gray-800 p-3 rounded-lg text-sm relative"
                      >
                        {/* Stars */}
                        <div className="flex items-center gap-1 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < review.rating
                                  ? "text-yellow-500"
                                  : "text-gray-400"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="ml-2 text-gray-400 text-xs">
                            {review.rating} / 5
                          </span>
                        </div>

                        {/* Reviewer name */}
                        {review.user?.name && (
                          <p className="text-indigo-400 text-xs mb-1">
                            {review.user.name}
                          </p>
                        )}

                        {/* Review Text */}
                        <p className="text-gray-300 text-sm">{review.review}</p>

                        {(review.user?._id === currentUserId ||
                          ["admin", "superadmin"].includes(
                            currentUserRole
                          )) && (
                          <div className="flex gap-2 absolute top-2 right-2">
                            {/* Update button */}
                            {review.user?._id === currentUserId &&
                              !["admin", "superadmin"].includes(
                                currentUserRole
                              ) && (
                                <button
                                  onClick={() => handleEditClick(review)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-full text-xs shadow-md transition cursor-pointer"
                                >
                                  Update
                                </button>
                              )}

                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-full text-xs shadow-md transition cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 italic text-sm mt-6 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
                    🚫 No reviews yet for this product.
                  </p>
                )}

                {!isAdmin && (
                  <>
                    {editingReviewId ? (
                      // Edit Review Form
                      <div className="mt-6 border-t border-gray-700 pt-4">
                        <h3 className="text-indigo-400 font-semibold text-lg mb-2">
                          Edit Your Review
                        </h3>

                        {/* Star Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setEditedReviewRating(i + 1)}
                              className={`text-xl focus:outline-none ${
                                i < editedReviewRating
                                  ? "text-yellow-400"
                                  : "text-gray-500"
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>

                        {/* Review Textarea */}
                        <textarea
                          value={editedReviewText}
                          onChange={(e) => setEditedReviewText(e.target.value)}
                          className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white text-sm"
                          rows="3"
                        />

                        {/* Save + Cancel Buttons */}
                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => handleEditReview(editingReviewId)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingReviewId(null)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Add Review Form
                      <div className="mt-6 border-t border-gray-700 pt-4">
                        <h3 className="text-indigo-400 font-semibold text-lg mb-2">
                          Write a Review
                        </h3>

                        {/* Star Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setNewRating(i + 1)}
                              className={`text-xl focus:outline-none ${
                                i < newRating
                                  ? "text-yellow-400"
                                  : "text-gray-500"
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>

                        {/* 📝 Review Textarea */}
                        <textarea
                          value={newReview}
                          onChange={(e) => setNewReview(e.target.value)}
                          className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white text-sm"
                          placeholder="Write your review here..."
                          rows="3"
                        />

                        {/* Submit Button */}
                        <button
                          onClick={handleSubmitReview}
                          disabled={submittingReview}
                          className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-all text-sm font-medium cursor-pointer"
                        >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Close Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setFormVisible(false);
                      setFormMode("");
                      setEditing(null);
                      resetForm();
                    }}
                    className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 transition duration-200 text-white font-semibold px-6 py-2 rounded-lg shadow-sm cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Create/Edit modal
            <div className="bg-gray-900 text-white shadow-2xl p-6 rounded-2xl w-full max-w-xl space-y-5 border border-gray-700 transition-all duration-300">
              <h2 className="text-2xl font-bold text-indigo-400 text-center">
                {formMode === "edit" ? "Edit Product" : "Create Product"}
              </h2>

              {/* Reuse form fields */}
              <input
                className="border border-gray-500 p-2 w-full rounded bg-gray-800"
                value={form.name}
                placeholder="Product Name"
                readOnly={formMode === "view"}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && (
                <p className="text-red-400 text-sm">{errors.name}</p>
              )}

              <textarea
                className="border border-gray-500 p-2 w-full rounded bg-gray-800"
                value={form.description}
                placeholder="Description"
                readOnly={formMode === "view"}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              {errors.description && (
                <p className="text-red-400 text-sm">{errors.description}</p>
              )}

              <input
                type="number"
                className="border border-gray-500 p-2 w-full rounded bg-gray-800"
                value={form.price}
                placeholder="Price"
                readOnly={formMode === "view"}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              {errors.price && (
                <p className="text-red-400 text-sm">{errors.price}</p>
              )}

              <input
                className="border border-gray-500 p-2 w-full rounded bg-gray-800"
                value={
                  Array.isArray(form.categories)
                    ? form.categories.join(", ")
                    : ""
                }
                readOnly={formMode === "view"}
                placeholder="Categories (e.g. Electronics, Mobile)"
                onChange={(e) =>
                  setForm({
                    ...form,
                    categories: e.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter((item) => item !== ""),
                  })
                }
              />
              {errors.categories && (
                <p className="text-red-400 text-sm">{errors.categories}</p>
              )}

              <input
                type="number"
                className="border border-gray-500 p-2 w-full rounded bg-gray-800"
                value={form.quantity}
                placeholder="Quantity"
                readOnly={formMode === "view"}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
              {errors.quantity && (
                <p className="text-red-400 text-sm">{errors.quantity}</p>
              )}

              <input
                type="file"
                accept="image/*"
                disabled={formMode === "view"}
                onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                className="border border-gray-500 p-2 w-full rounded bg-gray-800"
              />
              {errors.image && (
                <p className="text-red-400 text-sm">{errors.image}</p>
              )}

              <div className="flex justify-between">
                {formMode !== "view" && (
                  <button
                    className={`${
                      editing
                        ? "bg-blue-600 hover:bg-blue-800"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white px-4 py-2 rounded transition cursor-pointer`}
                    onClick={editing ? handleUpdate : handleCreate}
                  >
                    {editing ? "Update Product" : "Create Product"}
                  </button>
                )}

                <button
                  onClick={() => {
                    setFormVisible(false);
                    setFormMode("");
                    setEditing(null);
                    resetForm();
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center">
        <input
          type="text"
          placeholder="🔍 Search by name, description, price, or category..."
          className="w-full max-w-md p-2 mt-2 rounded border border-gray-400 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
        />
      </div>

      <div className="flex justify-center space-x-4 mt-7">
        {/* Category Dropdown */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              const category = e.target.value;
              setSelectedCategory(category);
              setPriceSort("");
              handleSearch(searchQuery, category, "");
            }}
            className="p-2 rounded border border-gray-400 bg-gray-800 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Price Sorting Dropdown */}
        <div>
          <select
            value={priceSort}
            onChange={(e) => {
              const sortOrder = e.target.value;
              setPriceSort(sortOrder);
              handleSearch(searchQuery, selectedCategory, sortOrder);
            }}
            className="p-2 rounded border border-gray-400 bg-gray-800 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="asc">Low to High</option>
            <option value="desc">High to Low</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center my-6">
        <h3 className="text-xl font-semibold underline">Product List</h3>

        {/* Add Product button */}
        {!formVisible && isAdmin && (
          <button
            className="bg-green-600 hover:bg-green-800 text-white px-3 py-1 rounded transition cursor-pointer"
            onClick={() => {
              setFormVisible(true);
              setFormMode("create");
              setEditing(null);
              resetForm();
            }}
          >
            + Add Product
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg ">
        {products.length > 0 ? (
          isAdmin ? (
            // Table view for Admin/SuperAdmin
            <div className="overflow-x-auto w-full">
              <table className="min-w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 border border-gray-700 rounded">
                <thead>
                  <tr className="bg-gray-900 text-left text-white">
                    <th className="px-4 py-2 border-b border-r border-gray-600">
                      Image
                    </th>
                    <th className="px-4 py-2 border-b border-r border-gray-600">
                      Name
                    </th>
                    <th className="px-4 py-2 border-b border-r border-gray-600">
                      Description
                    </th>
                    <th className="px-4 py-2 border-b border-r border-gray-600">
                      Price
                    </th>
                    <th className="px-4 py-2 border-b border-r border-gray-600">
                      Categories
                    </th>
                    <th className="px-4 py-2 border-b border-r border-gray-600">
                      Quantity
                    </th>
                    <th className="px-4 py-2 border-b border-r border-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-700 text-white"
                    >
                      <td className="px-4 py-2 border-b border-r border-gray-700 bg-gray-800">
                        <div
                          onClick={() => handleView(product)}
                          className="cursor-pointer hover:scale-105 transition-transform duration-200 inline-block"
                        >
                          <img
                            src={`http://localhost:1212${product.image}`}
                            alt={product.name}
                            className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 object-cover rounded border"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2 border-b border-r border-gray-700 bg-gray-800 text-xs sm:text-sm md:text-base">
                        {product.name}
                      </td>
                      <td className="px-4 py-2 border-b border-r border-gray-700 bg-gray-800 text-xs sm:text-sm text-gray-400">
                        {product.description}
                      </td>
                      <td className="px-4 py-2 border-b border-r border-gray-700 bg-gray-800 text-xs sm:text-sm text-gray-400">
                        ${product.price}
                      </td>
                      <td className="px-4 py-2 border-b border-r border-gray-700 bg-gray-800 text-xs sm:text-sm text-gray-400">
                        {Array.isArray(product.categories)
                          ? product.categories.join(", ")
                          : product.categories}
                      </td>
                      <td className="px-4 py-2 border-b border-r border-gray-700 bg-gray-800 text-xs sm:text-sm text-gray-400">
                        {product.quantity}
                      </td>
                      <td className="px-4 py-2 border-b border-r border-gray-700 bg-gray-800">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="bg-blue-500 hover:bg-blue-800 text-white text-xs sm:text-sm px-3 py-1 rounded transition duration-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="bg-red-500 hover:bg-red-800 text-white text-xs sm:text-sm px-3 py-1 rounded transition duration-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Grid view for normal user
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-xl shadow-lg p-4 text-white flex flex-col items-center text-center"
                >
                  <div
                    onClick={() => handleView(product)}
                    className="cursor-pointer w-full space-y-2"
                  >
                    <div className="overflow-hidden rounded-lg mb-3 border border-gray-500 h-56">
                      <img
                        src={`http://localhost:1212${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <h2 className="text-lg font-bold">{product.name}</h2>
                    <p className="text-sm text-gray-300">
                      <span className="font-medium text-white">Price:</span> $
                      {product.price}
                    </p>
                    <p className="text-sm text-gray-300">
                      <span className="font-medium text-white">Category:</span>{" "}
                      {Array.isArray(product.categories)
                        ? product.categories.join(", ")
                        : product.categories}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <p className="text-center text-gray-700 text-2xl font-bold mt-5">
            Product Not Found.
          </p>
        )}
      </div>
    </div>
  );
}
