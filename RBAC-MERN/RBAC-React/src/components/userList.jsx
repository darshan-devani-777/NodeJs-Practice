import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useFormik } from "formik";
import { userValidationSchema } from "../validation/validation";

export default function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
    }
    fetchUsers();
  }, []);

  // FETCH USER
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      if (res.data.success && Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      } else {
        alert(res.data.message || "Failed to fetch users.");
        setUsers([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching users");
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
    validationSchema: userValidationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("password", values.password);
        formData.append("role", values.role);
        if (imageFile) {
          formData.append("image", imageFile);
        }

        if (editing) {
          await api.put(`/users/${editing}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          setEditing(null);
        } else {
          await api.post("/auth/register", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        formik.resetForm();
        setImageFile(null);
        setFormVisible(false);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || "Error saving user");
      }
    },
    enableReinitialize: true,
  });

  // EDIT USER
  const handleEdit = (user) => {
    setFormVisible(true);
    setEditing(user._id);
    formik.setValues({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setImageFile(null);
  };

  // DELETE USER
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (isConfirmed) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert("Delete failed");
        console.error(err);
      }
    } else {
      console.log("Delete operation was canceled.");
    }
  };

  // SEARCH USER
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen mx-auto p-6 text-white bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      {formVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <form
            onSubmit={formik.handleSubmit}
            className="bg-gray-800 shadow-md p-6 rounded-lg w-full max-w-md space-y-4 border border-gray-700"
          >
            {/*  'Edit Based */}
            <h2 className="text-2xl font-bold text-indigo-400 text-center">
              {editing ? "Edit User" : "Create User"}
            </h2>

            <input
              className="bg-gray-900 border border-gray-600 p-2 w-full rounded text-white cursor-pointer"
              name="name"
              placeholder="Name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-sm">{formik.errors.name}</p>
            )}

            <input
              className="bg-gray-900 border border-gray-600 p-2 w-full rounded text-white cursor-pointer"
              name="email"
              placeholder="Email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm">{formik.errors.email}</p>
            )}

            <input
              className="bg-gray-900 border border-gray-600 p-2 w-full rounded text-white cursor-pointer"
              name="password"
              placeholder="Password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-sm">{formik.errors.password}</p>
            )}

            <select
              className="bg-gray-900 border border-gray-600 p-2 w-full rounded text-white cursor-pointer"
              name="role"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.role}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {formik.touched.role && formik.errors.role && (
              <p className="text-red-500 text-sm">{formik.errors.role}</p>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between">
              <button
                type="submit"
                className={`${
                  editing
                    ? "bg-blue-600 hover:bg-blue-800"
                    : "bg-green-600 hover:bg-green-700"
                } text-white px-4 py-2 rounded transition cursor-pointer`}
              >
                {editing ? "Update User" : "Create User"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormVisible(false);
                  setEditing(null);
                  formik.resetForm();
                  setImageFile(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View details */}
      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xl border border-gray-700 text-white space-y-4">
            <h2 className="text-2xl font-semibold text-center mb-4 text-indigo-400">
              User Details
            </h2>
            {/* User Image at the Top */}
            <div className="flex justify-center my-7">
              {selectedUser.image ? (
                <img
                  src={`http://localhost:1212/${selectedUser.image}`}
                  alt="profile"
                  className="w-24 h-24 rounded-full object-cover border border-indigo-400"
                />
              ) : (
                <span className="text-gray-400 text-sm">No Image</span>
              )}
            </div>
            {/* Flex container */}
            <div className="flex justify-between gap-30">
              {/* Left Side: User Info */}
              <div className="space-y-2 text-white text-left w-1/2">
                <p>
                  <span className="font-medium text-indigo-400">Name:</span>{" "}
                  <span className="text-gray-400 text-sm">
                    {selectedUser.name}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-indigo-400">Email:</span>{" "}
                  <span className="text-gray-400 text-sm">
                    {selectedUser.email}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-indigo-400">Role:</span>{" "}
                  <span className="text-gray-400 text-sm">
                    {selectedUser.role}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-indigo-400">Contact:</span>{" "}
                  <span className="text-gray-400 text-sm">
                    {selectedUser.contact}
                  </span>
                </p>
              </div>

              {/* Right Side: Address Info */}
              <div className="space-y-5 text-white text-start w-1/2">
                <p className="font-medium text-indigo-400 mb-2">Address:</p>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium text-indigo-400">Street:</span>{" "}
                    <span className="text-gray-400 text-sm">
                      {selectedUser.address?.street || "No Street Provided"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-indigo-400">City:</span>{" "}
                    <span className="text-gray-400 text-sm">
                      {selectedUser.address?.city || "No City Provided"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-indigo-400">State:</span>{" "}
                    <span className="text-gray-400 text-sm">
                      {selectedUser.address?.state || "No State Provided"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-indigo-400">
                      Country:
                    </span>{" "}
                    <span className="text-gray-400 text-sm">
                      {selectedUser.address?.country || "No Country Provided"}
                    </span>
                  </p>
                </div>
              </div>
            </div>{" "}
            {/* Close Button */}
            <div className="text-center mt-4">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-gray-500 hover:bg-gray-700 transition duration-200 text-white px-4 py-2 rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <input
          type="text"
          placeholder="🔍  Search by name, email, or role..."
          className="w-full max-w-md p-2 mt-2 rounded border border-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex justify-between items-center my-6">
        <h2 className="text-xl font-semibold text-center text-black underline">
          User List
        </h2>

        {/* Conditionally render the Add User button */}
        {!formVisible && isAdmin && (
          <button
            className="bg-green-600 hover:bg-green-800 text-white px-3 py-1 rounded transition cursor-pointer"
            onClick={() => {
              setFormVisible(true);
              setEditing(null);
              formik.resetForm();
              setImageFile(null);
            }}
          >
            + Add User
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-md">
        <table className="min-w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 border border-gray-700 rounded">
          <thead>
            <tr className="bg-gray-00 text-left text-white">
              <th className="px-4 py-2 border-b border-r border-gray-600">
                ID
              </th>
              <th className="px-4 py-2 border-b border-r border-gray-600">
                Image
              </th>
              <th className="px-4 py-2 border-b border-r border-gray-600">
                Name
              </th>
              <th className="px-4 py-2 border-b border-r border-gray-600">
                Email
              </th>
              <th className="px-4 py-2 border-b border-r border-gray-600">
                Role
              </th>
              <th className="px-4 py-2 border-b border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user._id} className="hover:bg-gray-700 text-white">
                  <td className="px-4 py-2 border-b border-r border-gray-700 bg-gray-800">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 border-b border-r border-gray-700 bg-gray-800">
                    {user.image ? (
                      <img
                        src={`http://localhost:1212/${user.image}`}
                        alt="profile"
                        className="w-12 h-12 rounded-full object-cover border border-indigo-400 cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No Image</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border-b border-r border-gray-700 bg-gray-800">
                    {user.name}
                  </td>
                  <td className="px-4 py-2 text-sm border-b border-r border-gray-700 bg-gray-800 text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-4 py-2 border-b border-r border-gray-700 bg-gray-800 capitalize text-sm">
                    {user.role}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-700 bg-gray-800">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="bg-blue-500 hover:bg-blue-800 text-white text-sm px-3 py-1 rounded cursor-pointer transition duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-500 hover:bg-red-800 text-white text-sm px-3 py-1 rounded cursor-pointer transition duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-4 text-gray-400 bg-gray-800 text-2xl"
                >
                  User Not Found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
