import { useEffect, useState } from "react";
import { fetchUsers, updateUser, deleteUser, addUser } from "../services/api";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [loading, setLoading] = useState(false);

  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "", email: "" });

  const [newUserData, setNewUserData] = useState({ name: "", email: "" });
  const [addingUser, setAddingUser] = useState(false);
  const [addError, setAddError] = useState("");
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(() => setError("Failed to fetch users"));
  }, []);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleNewUserChange(e) {
    const { name, value } = e.target;
    setNewUserData((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditClick(user) {
    setEditingUserId(user.id);
    setEditFormData({ name: user.name, email: user.email });
    setUpdateError("");
  }

  function handleCancelClick() {
    setEditingUserId(null);
    setEditFormData({ name: "", email: "" });
    setUpdateError("");
  }

  async function handleSaveClick(userId) {
    setLoading(true);
    setUpdateError("");
    try {
      const updatedUser = await updateUser(userId, editFormData);
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? updatedUser : user))
      );
      setEditingUserId(null);
      setEditFormData({ name: "", email: "" });
    } catch (err) {
      setUpdateError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteClick(userId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmed) return;

    try {
      await deleteUser(userId);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  async function handleAddUser(e) {
    e.preventDefault();
    setAddError("");
    setAddingUser(true);

    try {
      const createdUser = await addUser(newUserData);
      setUsers((prevUsers) => [createdUser, ...prevUsers]);
      setNewUserData({ name: "", email: "" });
      setShowAddUserForm(false);
    } catch (err) {
      setAddError(err.message || "Failed to add user");
    } finally {
      setAddingUser(false);
    }
  }

  if (error) {
    return <div className="text-red-600 p-6">{error}</div>;
  }

  return (
    <div className="p-4 my-4">
      {/* Header with Title and Add User Button */}
      <div className="flex justify-between my-6 items-center">
        <h1 className="text-2xl font-bold mb-6 underline">All Users</h1>

        <div className="mb-4">
          <button
            onClick={() => setShowAddUserForm((prev) => !prev)}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-800 transition cursor-pointer"
          >
            {showAddUserForm ? "Close Form" : "Add User"}
          </button>
        </div>
      </div>

      {/* Add User Form */}
      {showAddUserForm && (
        <form
          onSubmit={handleAddUser}
          className="mb-8 bg-white p-4 rounded shadow shadow-gray-500 max-w-sm"
        >
          <h2 className="text-xl font-semibold mb-4 underline">Add New User</h2>

          <div className="mb-4">
            <label className="block font-medium mb-1" htmlFor="name">
              Name :
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={newUserData.name}
              onChange={handleNewUserChange}
              className="border p-2 rounded w-full"
              required
              disabled={addingUser}
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1" htmlFor="email">
              Email :
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={newUserData.email}
              onChange={handleNewUserChange}
              className="border p-2 rounded w-full"
              required
              disabled={addingUser}
            />
          </div>

          {addError && (
            <p className="text-red-600 mb-4 font-semibold">{addError}</p>
          )}

          <button
            type="submit"
            disabled={addingUser}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition cursor-pointer"
          >
            {addingUser ? "Adding..." : "Add User"}
          </button>
        </form>
      )}

      {/* User Table View (Desktop & Tablet) */}
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto w-full max-w-full">
            <table className="min-w-full bg-white rounded shadow">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-6 text-left border border-gray-300">
                    ID
                  </th>
                  <th className="py-3 px-6 text-left border border-gray-300">
                    Name
                  </th>
                  <th className="py-3 px-6 text-left border border-gray-300">
                    Email
                  </th>
                  <th className="py-3 px-6 text-left border border-gray-300">
                    Created
                  </th>
                  <th className="py-3 px-6 text-center border border-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-100 transition"
                  >
                    <td className="py-3 px-6 border border-gray-300">
                      {user.id}
                    </td>

                    {editingUserId === user.id ? (
                      <>
                        <td className="py-3 px-6 border border-gray-300">
                          <input
                            type="text"
                            name="name"
                            value={editFormData.name}
                            onChange={handleInputChange}
                            className="border p-1 rounded w-full"
                            disabled={loading}
                          />
                        </td>
                        <td className="py-3 px-6 border border-gray-300">
                          <input
                            type="email"
                            name="email"
                            value={editFormData.email}
                            onChange={handleInputChange}
                            className="border p-1 rounded w-full"
                            disabled={loading}
                          />
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-500 border border-gray-300">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-6 text-center space-x-2 border border-gray-300">
                          <button
                            onClick={() => handleSaveClick(user.id)}
                            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                            disabled={loading}
                          >
                            {loading ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={handleCancelClick}
                            className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500"
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-6 font-semibold border border-gray-300">
                          {user.name}
                        </td>
                        <td className="py-3 px-6 border border-gray-300">
                          {user.email}
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-500 border border-gray-300">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-6 text-center space-x-4 border border-gray-300">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-800 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user.id)}
                            className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-800 cursor-pointer"
                            disabled={loading}
                          >
                            {loading ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4 mt-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white p-4 rounded shadow space-y-2"
              >
                <p>
                  <strong>ID:</strong> {user.id}
                </p>

                {editingUserId === user.id ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium">Name:</label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleInputChange}
                        className="border p-2 rounded w-full"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        Email:
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleInputChange}
                        className="border p-2 rounded w-full"
                        disabled={loading}
                      />
                    </div>

                    <p className="text-sm text-gray-500">
                      <strong>Created:</strong>{" "}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveClick(user.id)}
                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 w-full"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancelClick}
                        className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500 w-full"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Name:</strong> {user.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Created:</strong>{" "}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-800 w-full cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user.id)}
                        className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-800 w-full cursor-pointer"
                        disabled={loading}
                      >
                        {loading ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
