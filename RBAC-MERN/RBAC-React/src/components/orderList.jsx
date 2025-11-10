import { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [selectedOrder]);

  // FETCH ORDER
  const fetchOrders = async () => {
    try {
      let res;
      if (!user || (!user.id && !user._id)) {
        console.warn("User not loaded or missing ID");
        return;
      }

      if (user.role === "admin" || user.role === "superadmin") {
        res = await api.get("/orders");
        const allOrders = res.data.data || [];
        const filtered = allOrders.filter(
          (order) => (order.user?.role || "user") === "user"
        );
        setOrders(filtered);
      } else {
        const userId = user.id || user._id;
        res = await api.get(`/orders/specific/${userId}`);
        setOrders(res.data.data || []);
      }
    } catch (err) {
      alert("Error fetching orders");
      console.error("Fetch Order Error:", err.response?.data || err.message);
    }
  };

  // DELETE ORDER
  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure to delete this order?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:1212/api/orders/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    setIsEditing(false);
  };

  const openEditModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    setIsEditing(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <h2 className="text-xl font-semibold my-6 underline">Order List</h2>

      <div className="rounded-md overflow-x-auto">
        <table className="min-w-full text-left bg-gray-800 text-white">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-2 border border-gray-600">ID</th>
              <th className="px-4 py-2 border border-gray-600">User</th>
              <th className="px-4 py-2 border border-gray-600">Status</th>
              <th className="px-4 py-2 border border-gray-600">State</th>
              <th className="px-4 py-2 border border-gray-600">City</th>
              <th className="px-4 py-2 border border-gray-600">Created</th>
              <th className="px-4 py-2 border border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-6 text-gray-400 border-t border-gray-700"
                >
                  Order Not Found.
                </td>
              </tr>
            ) : (
              orders.map((order, index) => {
                const isUserOrder = order.userId === user._id;
                return (
                  <tr key={order._id} className="border-t border-gray-600">
                    <td className="px-4 py-2 border border-gray-700 bg-gray-800">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 bg-gray-800">
                      {order.user?.name || order.user?.email || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 bg-gray-800">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          order.deliveryStatus === "processing"
                            ? "bg-yellow-600"
                            : order.deliveryStatus === "delivered"
                            ? "bg-green-600"
                            : order.deliveryStatus === "shipped"
                            ? "bg-gray-600"
                            : "bg-red-600"
                        }`}
                      >
                        {order.deliveryStatus || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 border border-gray-700 bg-gray-800 text-sm text-gray-400">
                      {order.address?.state}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 bg-gray-800 text-sm text-gray-400">
                      {order.address?.city}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 bg-gray-800 text-sm text-gray-400">
                      {new Date(order.createdAt).toISOString().split("T")[0]}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 bg-gray-800 space-x-2">
                      <button
                        onClick={() => openModal(order)}
                        className="bg-green-500 hover:bg-green-700 px-3 py-1 rounded text-sm cursor-pointer transition duration-300"
                      >
                        View
                      </button>

                      <button
                        onClick={() => {
                          if (user.role === "user" && isUserOrder) {
                            openEditModal(order);
                          }
                        }}
                        disabled={user.role !== "user" || !isUserOrder}
                        className={`px-3 py-1 rounded text-sm transition duration-300 ${
                          user.role === "user" && isUserOrder
                            ? "bg-blue-500 hover:bg-blue-700 cursor-pointer"
                            : "bg-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          if (user.role === "user" && isUserOrder) {
                            handleDelete(order._id);
                          }
                        }}
                        disabled={user.role !== "user" || !isUserOrder}
                        className={`px-3 py-1 rounded text-sm transition duration-300 ${
                          user.role === "user" && isUserOrder
                            ? "bg-red-600 hover:bg-red-800 cursor-pointer"
                            : "bg-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 text-white p-6 rounded-2xl w-full max-w-xl border border-gray-700 shadow-2xl space-y-2 relative transition-all duration-300">
            {/* Header */}
            <h2 className="text-2xl font-bold text-indigo-400">
              {isEditing
                ? `Edit Order for ${selectedOrder.user?.name || "Unknown"}`
                : `Order Details for ${selectedOrder.user?.name || "Unknown"}`}
            </h2>

            {isEditing ? (
              <div className="space-y-4">
                {/* City Field */}
                <div className="space-y-4">
                  {/* Street Field */}
                  <div className="flex flex-col">
                    <label className="text-sm mb-1">Street</label>
                    <input
                      type="text"
                      value={selectedOrder.address?.street || ""}
                      onChange={(e) =>
                        setSelectedOrder((prev) => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            street: e.target.value,
                          },
                        }))
                      }
                      className="p-1 rounded bg-gray-800 text-white border border-gray-600 text-sm"
                    />
                  </div>

                  {/* City Field */}
                  <div className="flex flex-col">
                    <label className="text-sm mb-1">City</label>
                    <input
                      type="text"
                      value={selectedOrder.address?.city || ""}
                      onChange={(e) =>
                        setSelectedOrder((prev) => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            city: e.target.value,
                          },
                        }))
                      }
                      className="p-1 rounded bg-gray-800 text-white border border-gray-600 text-sm"
                    />
                  </div>

                  {/* State Field */}
                  <div className="flex flex-col">
                    <label className="text-sm mb-1">State</label>
                    <input
                      type="text"
                      value={selectedOrder.address?.state || ""}
                      onChange={(e) =>
                        setSelectedOrder((prev) => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            state: e.target.value,
                          },
                        }))
                      }
                      className="p-1 rounded bg-gray-800 text-white border border-gray-600 text-sm"
                    />
                  </div>

                  {/* Country Field */}
                  <div className="flex flex-col">
                    <label className="text-sm mb-1">Country</label>
                    <input
                      type="text"
                      value={selectedOrder.address?.country || ""}
                      state
                      onChange={(e) =>
                        setSelectedOrder((prev) => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            country: e.target.value,
                          },
                        }))
                      }
                      className="p-1 rounded bg-gray-800 text-white border border-gray-600 text-sm"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm mb-1">Contact</label>
                    <input
                      type="text"
                      value={selectedOrder.contact || ""}
                      onChange={(e) =>
                        setSelectedOrder((prev) => ({
                          ...prev,
                          contact: e.target.value,
                        }))
                      }
                      className="p-1 rounded bg-gray-800 text-white border border-gray-600 text-sm"
                    />
                  </div>
                </div>

                {/* Quantity Field */}
                <div className="flex flex-col">
                  <label className="text-sm mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={selectedOrder.products?.[0]?.quantity || 1}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value, 10);
                      if (newQuantity > 0) {
                        setSelectedOrder((prev) => {
                          const updatedProducts = [...prev.products];
                          updatedProducts[0].quantity = newQuantity;

                          // Recalculate the total amount
                          const updatedTotalAmount =
                            updatedProducts[0].quantity *
                            (updatedProducts[0].product?.price || 0);

                          return {
                            ...prev,
                            products: updatedProducts,
                            totalAmount: updatedTotalAmount,
                          };
                        });
                      }
                    }}
                    className="p-1 rounded bg-gray-800 text-white border border-gray-600"
                  />
                </div>

                {/* Total Price Calculation */}
                <div className="flex flex-col">
                  <p className="text-md mt-1 text-gray-300">Total Price</p>
                  <p className="text-lg font-semibold text-green-400 mt-1">
                    ₹
                    {(
                      (selectedOrder.products?.[0]?.quantity || 1) *
                      (typeof selectedOrder.products?.[0]?.product?.price ===
                      "number"
                        ? selectedOrder.products?.[0]?.product?.price
                        : 0)
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2 text-sm text-gray-300">
                  <p className="py-1">
                    <span className="font-medium text-indigo-400">Status:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        selectedOrder.deliveryStatus === "processing"
                          ? "bg-yellow-600"
                          : selectedOrder.deliveryStatus === "delivered"
                          ? "bg-green-600"
                          : selectedOrder.deliveryStatus === "shipped"
                          ? "bg-gray-600"
                          : "bg-red-600"
                      }`}
                    >
                      {selectedOrder.deliveryStatus ||
                        selectedOrder.status ||
                        "Not Available"}
                    </span>
                  </p>

                  <p className="py-1">
                    <span className="font-medium text-indigo-400">
                      Address:
                    </span>{" "}
                    {selectedOrder.address?.street ? (
                      <>
                        <span>{selectedOrder.address.street}</span>
                        <span className="mx-1">,</span>{" "}
                      </>
                    ) : (
                      "Address not available, "
                    )}
                    {selectedOrder.address?.city || "City not available, "}
                    {selectedOrder.address?.state ? (
                      <>
                        <span className="mx-1">, </span>
                        <span>{selectedOrder.address.state}</span>
                      </>
                    ) : null}
                    {selectedOrder.address?.country ? (
                      <>
                        <span className="mx-1">, </span>
                        <span>{selectedOrder.address.country}</span>
                      </>
                    ) : null}
                  </p>

                  <p className="py-1">
                    <span className="font-medium text-indigo-400">
                      Contact:
                    </span>{" "}
                    {selectedOrder.contact || "No contact available"}
                  </p>
                  <p className="py-1">
                    <span className="font-medium text-indigo-400">
                      Created At:
                    </span>{" "}
                    {selectedOrder.createdAt
                      ? new Date(selectedOrder.createdAt)
                          .toISOString()
                          .split("T")[0]
                      : "Date not available"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
                  {selectedOrder.products?.length > 0 ? (
                    <div className="overflow-y-auto max-h-[300px]">
                      {selectedOrder.products.map((item, idx) => {
                        const imagePath =
                          item.product?.image || item.productImage;
                        const imageUrl = imagePath?.startsWith("http")
                          ? imagePath
                          : `http://localhost:1212${imagePath}`;
                        const product = item.product || {};

                        return (
                          <div
                            key={idx}
                            className="flex gap-6 bg-gray-900 rounded-xl p-5 border border-gray-700"
                          >
                            {/* Left side - Image */}
                            <div className="w-1/2 h-60 rounded-lg overflow-hidden border border-gray-600 flex-shrink-0 bg-white">
                              <img
                                src={imageUrl}
                                alt={product.name || "Product"}
                                className="w-full h-full object-contain transition-transform duration-300 hover:scale-110 cursor-pointer"
                                onError={(e) =>
                                  (e.target.src = "/no-image.png")
                                }
                              />
                            </div>

                            {/* Right side - Product Details */}
                            <div className="flex flex-col justify-between text-white w-2/3">
                              <div>
                                <p className="text-lg font-bold text-indigo-200 mb-2">
                                  {product.name || "Unnamed Product"}
                                </p>
                                {product.description && (
                                  <p className="text-sm text-gray-300 mb-1">
                                    <span className="font-medium text-indigo-400">
                                      Description:
                                    </span>{" "}
                                    {product.description}
                                  </p>
                                )}
                                <p className="text-sm text-gray-300 mb-1">
                                  <span className="font-medium text-indigo-400">
                                    Categories:
                                  </span>{" "}
                                  {product.categories?.join(", ") || "N/A"}
                                </p>
                              </div>
                              <div className="mt-3 space-y-1">
                                <p className="text-sm text-gray-300">
                                  <span className="font-medium text-indigo-400">
                                    Price:
                                  </span>{" "}
                                  ₹{product.price?.toFixed(2) || "0.00"}
                                </p>
                                <p className="text-sm text-gray-300">
                                  <span className="font-medium text-indigo-400">
                                    Quantity:
                                  </span>{" "}
                                  {item.quantity}
                                </p>
                                <p className="text-md mt-2 text-green-400 font-semibold">
                                  Total: ₹
                                  {(
                                    item.quantity * (product.price || 0)
                                  ).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="col-span-2 text-center text-gray-400">
                      No product details available for this order.
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end space-x-4">
              {isEditing && (
                <button
                  onClick={async () => {
                    try {
                      console.log(
                        "Selected Order before update:",
                        selectedOrder
                      );

                      const updatedTotalAmount = selectedOrder.products?.reduce(
                        (total, product) =>
                          total +
                          product.quantity * (product.product?.price || 0),
                        0
                      );

                      const updatedOrder = {
                        ...selectedOrder,
                        totalAmount: updatedTotalAmount,
                        products: selectedOrder.products,
                      };

                      console.log("Updated Order:", updatedOrder);

                      const response = await axios.put(
                        `http://localhost:1212/api/orders/update-details/${selectedOrder._id}`,
                        updatedOrder,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );

                      console.log("Response from server:", response.data);
                      setSelectedOrder(response.data.data);
                      fetchOrders();
                      closeModal();
                    } catch (err) {
                      console.error("Update failed:", err);
                      alert("Failed to update order.");
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-800 text-white px-6 py-2 rounded-lg cursor-pointer"
                >
                  Save
                </button>
              )}

              <button
                onClick={closeModal}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg cursor-pointer"
              >
                {isEditing ? "Cancel" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
