import { useEffect, useState } from "react";
import { fetchAllCartItems, deleteCartItem } from "../services/api";

export default function Carts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllCartItems()
      .then(setItems)
      .catch((err) => setError(err.message));
  }, []);

  const handleDelete = async (userId, productId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteCartItem(userId, productId);
      setItems((prevItems) =>
        prevItems.filter(
          (item) => item.userId !== userId || item.productId !== productId
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>;
  }

  return (
    <div className="p-6 my-5">
      <h1 className="text-2xl font-bold mb-4 underline">All Cart Items</h1>

      {items.length === 0 ? (
        <p className="text-2xl font-semibold text-gray-500">No carts found.</p>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full table-fixed bg-white border border-gray-300 rounded shadow text-sm sm:text-base">
            <thead className="bg-gray-800 text-white hidden sm:table-header-group">
              <tr>
                <th className="py-3 px-4 border border-gray-300">Cart ID</th>
                <th className="py-3 px-4 border border-gray-300">User ID</th>
                <th className="py-3 px-4 border border-gray-300">Product ID</th>
                <th className="py-3 px-4 max-w-[150px] border border-gray-300">
                  Product Name
                </th>
                <th className="py-3 px-4 text-right border border-gray-300">
                  Price
                </th>
                <th className="py-3 px-4 text-center border border-gray-300">
                  Quantity
                </th>
                <th className="py-3 px-4 border border-gray-300">Created At</th>
                <th className="py-3 px-4 border border-gray-300">Updated At</th>
                <th className="py-3 px-4 border border-gray-300">Action</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <>
                  <tr
                    key={item.id}
                    className="hover:bg-gray-100 hidden sm:table-row"
                    // Remove border-b here to avoid double borders
                  >
                    <td className="py-3 px-7 font-bold border border-gray-300">
                      {item.id}
                    </td>
                    <td className="py-3 px-7 text-gray-600 border border-gray-300">
                      {item.userId}
                    </td>
                    <td className="py-3 px-7 text-gray-600 border border-gray-300">
                      {item.productId}
                    </td>
                    <td className="py-3 px-10 truncate max-w-[150px] text-gray-600 border border-gray-300">
                      {item.product?.name || "N/A"}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-600 border border-gray-300">
                      ${item.product?.price?.toFixed(2) || "0.00"}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600 border border-gray-300">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 border border-gray-300">
                      {item.product?.createdAt
                        ? new Date(item.product.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 border border-gray-300">
                      {item.product?.updatedAt
                        ? new Date(item.product.updatedAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4 border border-gray-300">
                      <button
                        onClick={() =>
                          handleDelete(item.userId, item.productId)
                        }
                        className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-800 transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                  <tr
                    key={`${item.id}-mobile`}
                    className="sm:hidden block border border-gray-300"
                  >
                    <td className="py-2 px-4 block border border-gray-300">
                      <strong>Cart ID:</strong> {item.id}
                    </td>
                    <td className="py-2 px-4 block border border-gray-300">
                      <strong>User ID:</strong> {item.userId}
                    </td>
                    <td className="py-2 px-4 block border border-gray-300">
                      <strong>Product ID:</strong> {item.productId}
                    </td>
                    <td className="py-2 px-4 block border border-gray-300">
                      <strong>Product Name:</strong>{" "}
                      {item.product?.name || "N/A"}
                    </td>
                    <td className="py-2 px-4 block border border-gray-300">
                      <strong>Price:</strong> $
                      {item.product?.price?.toFixed(2) || "0.00"}
                    </td>
                    <td className="py-2 px-4 block border border-gray-300">
                      <strong>Quantity:</strong> {item.quantity}
                    </td>
                    <td className="py-2 px-4 block border border-gray-300">
                      <strong>Created At:</strong>{" "}
                      {item.product?.createdAt
                        ? new Date(item.product.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-2 px-4 block border border-gray-300">
                      <strong>Updated At:</strong>{" "}
                      {item.product?.updatedAt
                        ? new Date(item.product.updatedAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-2 px-4 block border border-gray-300">
                      <button
                        onClick={() =>
                          handleDelete(item.userId, item.productId)
                        }
                        className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-800 transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
