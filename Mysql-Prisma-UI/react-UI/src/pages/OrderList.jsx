import { useEffect, useState } from "react";
import { fetchAllOrders, deleteOrder } from "../services/api";

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);

  useEffect(() => {
    fetchAllOrders()
      .then(setOrders)
      .catch((err) => setError(err.message));
  }, []);

  const handleDeleteOrder = async (orderId) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete order ${orderId}?`
    );
    if (!confirmed) return;

    try {
      setLoadingDeleteId(orderId);
      await deleteOrder(orderId);

      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
      setLoadingDeleteId(null);
    } catch (err) {
      setError(err.message);
      setLoadingDeleteId(null);
    }
  };

  if (error) return <div className="text-red-600 p-4">Error: {error}</div>;

  return (
    <div className="p-6 overflow-x-auto my-5">
      <h1 className="text-2xl font-bold mb-4 underline">All Orders</h1>
      {orders.length === 0 ? (
        <p className="text-2xl font-semibold text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 shadow rounded text-sm sm:text-base border-collapse">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 text-left border border-gray-300">
                    Order ID
                  </th>
                  <th className="py-3 px-4 text-left border border-gray-300">
                    User
                  </th>
                  <th className="py-3 px-4 text-left border border-gray-300">
                    Order Date
                  </th>
                  <th className="py-3 px-4 text-left border border-gray-300">
                    Product
                  </th>
                  <th className="py-3 px-4 text-right border border-gray-300">
                    Price
                  </th>
                  <th className="py-3 px-4 text-center border border-gray-300">
                    Qty
                  </th>
                  <th className="py-3 px-4 text-right border border-gray-300">
                    Subtotal
                  </th>
                  <th className="py-3 px-4 text-right border border-gray-300">
                    Total
                  </th>
                  <th className="py-3 px-4 text-center border border-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const total = order.items.reduce(
                    (acc, item) => acc + item.product.price * item.quantity,
                    0
                  );
                  return order.items.map((item, index) => (
                    <tr
                      key={`${order.id}-${item.id}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="py-2 px-4 font-bold border border-gray-300">
                        {index === 0 ? order.id : ""}
                      </td>
                      <td className="py-2 px-4 text-gray-600 border border-gray-300">
                        {index === 0 ? order.user?.name || "Unknown" : ""}
                      </td>
                      <td className="py-2 px-4 text-gray-600 text-sm border border-gray-300">
                        {index === 0
                          ? new Date(order.createdAt).toLocaleDateString()
                          : ""}
                      </td>
                      <td className="py-2 px-4 text-gray-600 border border-gray-300">
                        {item.product.name}
                      </td>
                      <td className="py-2 px-4 text-right text-gray-600 border border-gray-300">
                        ${item.product.price.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 text-center text-gray-600 border border-gray-300">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-4 text-right border border-gray-300">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="py-2 px-4 text-right font-semibold border border-gray-300">
                        {index === 0 ? `$${total.toFixed(2)}` : ""}
                      </td>
                      <td className="py-2 px-4 text-center border border-gray-300">
                        {index === 0 && (
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={loadingDeleteId === order.id}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800 disabled:opacity-50 cursor-pointer"
                          >
                            {loadingDeleteId === order.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="space-y-4 sm:hidden">
            {orders.map((order) => {
              const total = order.items.reduce(
                (acc, item) => acc + item.product.price * item.quantity,
                0
              );
              return (
                <div
                  key={order.id}
                  className="border rounded shadow p-4 bg-white"
                >
                  <div className="mb-2 font-bold">Order ID: {order.id}</div>
                  <div>User: {order.user?.name || "Unknown"}</div>
                  <div>
                    Order Date: {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mt-3 space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="border-t pt-2">
                        <div>Product: {item.product.name}</div>
                        <div>Price: ${item.product.price.toFixed(2)}</div>
                        <div>Quantity: {item.quantity}</div>
                        <div>
                          Subtotal: $
                          {(item.product.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 font-semibold">
                    Total: ${total.toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    disabled={loadingDeleteId === order.id}
                    className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-800 disabled:opacity-50 cursor-pointer"
                  >
                    {loadingDeleteId === order.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
