import React, { useEffect, useState } from "react";
import { fetchUsers, deleteUser, updateUser } from "../services/api";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    image: null,
    available_days: [],
  });

  // Single search state
  const [searchQuery, setSearchQuery] = useState("");

  const loadUsers = async () => {
    const res = await fetchUsers();
    setUsers(res.data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    await deleteUser(id);
    loadUsers();
  };

  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setForm({
      name: user.name,
      email: user.email,
      image: null,
      available_days: user.available_days || [],
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    if (form.image) {
      formData.append("image", form.image);
    }
    formData.append(
      "available_days",
      JSON.stringify(form.available_days || [])
    );

    try {
      await updateUser(editingUser, formData);
      setEditingUser(null);
      setForm({ name: "", email: "", image: null, available_days: [] });
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user.");
    }
  };

  // Filter Users
  const filteredUsers = users.filter((user) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(lowerCaseQuery) ||
      user.email.toLowerCase().includes(lowerCaseQuery) ||
      user.available_days?.some((day) =>
        day.toLowerCase().includes(lowerCaseQuery)
      ) ||
      user.id.toString().includes(searchQuery)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-7 my-14 bg-gray-900 text-white shadow-2xl rounded-2xl flex flex-col overflow-hidden">
      <h2 className="text-3xl font-bold text-center underline decoration-blue-500 mb-8">
        👤 User List
      </h2>

      {/* Single Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by ID , Name , Email , or Available Days"
          className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex-grow overflow-auto">
        {/* Edit User Form */}
        {editingUser && (
          <form
            onSubmit={handleUpdate}
            className="mb-8 bg-gray-800 p-6 rounded-lg shadow-md space-y-4 overflow-visible overflow-y-auto"
          >
            <h3 className="text-xl font-semibold text-blue-400">Edit User</h3>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              placeholder="Name"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleFormChange}
              placeholder="Email"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full bg-gray-700 text-gray-300 rounded-md border border-gray-600 cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
            />

            {/* Availability Days Checkboxes */}
            <div className="mt-4">
              <p className="text-blue-400 font-semibold mb-2">
                Select Available Days:
              </p>
              <div className="flex flex-wrap gap-3 max-h-24 overflow-y-auto">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <label
                    key={day}
                    className="inline-flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.available_days?.includes(day) || false}
                      onChange={() => {
                        let newDays = form.available_days
                          ? [...form.available_days]
                          : [];
                        if (newDays.includes(day)) {
                          newDays = newDays.filter((d) => d !== day);
                        } else {
                          newDays.push(day);
                        }
                        setForm({ ...form, available_days: newDays });
                      }}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-800 text-white font-medium py-2 rounded-md transition cursor-pointer"
            >
              Update User
            </button>
          </form>
        )}

        {/* User List Display */}
        {filteredUsers.length === 0 ? (
          <p className="text-center text-gray-400">User Not Found.</p>
        ) : (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full bg-gray-800 border border-gray-700 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-blue-400">ID</th>
                  <th className="px-4 py-2 text-left text-blue-400">Image</th>
                  <th className="px-4 py-2 text-left text-blue-400">Name</th>
                  <th className="px-4 py-2 text-left text-blue-400">Email</th>
                  <th className="px-4 py-2 text-left text-blue-400">
                    Available Days
                  </th>
                  <th className="px-4 py-2 text-left text-blue-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700">
                    <td className="px-4 py-2 text-gray-400">{user.id}</td>
                    <td className="px-4 py-2">
                      <img
                        src={`http://localhost:5000/uploads/${user.image}`}
                        alt={user.name}
                        className="w-12 h-12 object-cover rounded-full border border-gray-600"
                      />
                    </td>
                    <td className="px-4 py-2 text-gray-400">{user.name}</td>
                    <td className="px-4 py-2 text-gray-400">{user.email}</td>
                    <td className="px-4 py-2">
                      {user.available_days?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.available_days.map((day, index) => (
                            <span
                              key={index}
                              className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm font-semibold"
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="italic text-gray-400">
                          No days selected
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2 text-gray-400 space-x-4">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="bg-yellow-500 text-white hover:bg-yellow-700 px-4 py-1 rounded-md cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-500 text-white hover:bg-red-700 px-4 py-1 rounded-md cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
