import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { registerValidationSchema } from "../validation/validation";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("user");

    if (!saved) {
      return navigate("/login");
    }

    let parsedSaved;
    try {
      parsedSaved = JSON.parse(saved);
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
      return navigate("/login");
    }

    if (!parsedSaved._id && parsedSaved.id) {
      parsedSaved = { ...parsedSaved, _id: parsedSaved.id };
    }

    setUser(parsedSaved);
    setForm({
      name: parsedSaved.name,
      email: parsedSaved.email,
      role: parsedSaved.role,
      password: "",
    });
  }, [navigate]);

  const handleEditClick = () => setIsEditing(true);

  const handleCancelClick = () => {
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    });
    setImageFile(null);
    setErrors({});
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationData = {
      name: form.name,
      email: form.email,
      role: form.role,
    };
    if (form.password.trim() !== "") {
      validationData.password = form.password;
    }

    try {
      await registerValidationSchema.validate(validationData, {
        abortEarly: false,
      });

      setLoading(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      if (form.password.trim() !== "") {
        formData.append("password", form.password);
      }
      if (user.role === "superadmin") {
        formData.append("role", form.role);
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await api.put(`/users/${user._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        alert("Profile Updated Successfully!");

        const updatedUser = {
          _id: res.data.user._id || res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
          image: res.data.user.image,
        };

        setUser(updatedUser);
        setForm({
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          password: "",
        });

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditing(false);
        setImageFile(null);
      } else {
        alert(res.data.message || "Update failed");
      }
    } catch (validationError) {
      if (validationError.name === "ValidationError") {
        const newErrors = {};
        validationError.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        alert(
          validationError.response?.data?.message || "Something went wrong"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 px-4 text-white">
      <div className="min-h-screen mt-20 flex items-center justify-center px-4 text-white">
        <div className="min-w-md w-full bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4 text-center tracking-wide">
            Welcome, <span className="text-indigo-400">{user.name}</span>
          </h2>

          {user.image && (
            <div className="mb-3 text-center">
              <img
                src={`http://localhost:1212/${user.image}`}
                alt="Profile"
                className="w-16 h-16 object-cover rounded-full border-2 border-indigo-500 mx-auto"
              />
            </div>
          )}

          {!isEditing ? (
            <>
              <div className="mb-4 space-y-1 text-sm text-gray-300 text-center">
                <p>
                  <strong className="text-indigo-400">Name:</strong> {user.name}
                </p>
                <p>
                  <strong className="text-indigo-400">Email:</strong>{" "}
                  {user.email}
                </p>
                <p>
                  <strong className="text-indigo-400">Role:</strong>{" "}
                  <span className="font-semibold text-indigo-300">
                    {user.role}
                  </span>
                </p>
              </div>

              <button
                onClick={handleEditClick}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 text-white py-2 rounded-lg shadow-md transition-all text-sm font-medium cursor-pointer"
              >
                ✏️ Update Profile
              </button>
            </>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-3 text-gray-200 text-sm"
            >
              <div>
                <label className="block mb-1 font-medium">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-3 py-1 bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-600 focus:ring-indigo-400"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full px-3 py-1 bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-600 focus:ring-indigo-400"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Password{" "}
                  <span className="text-gray-400">
                    (leave blank to keep unchanged)
                  </span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className={`w-full px-3 py-1 bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-600 focus:ring-indigo-400"
                  }`}
                  placeholder="New password"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Role</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  disabled={user.role !== "superadmin"}
                  className={`w-full px-3 py-1 ${
                    user.role !== "superadmin"
                      ? "bg-gray-600 cursor-not-allowed text-white border-gray-500"
                      : "bg-gray-700 text-white"
                  } border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.role
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-600 focus:ring-indigo-400"
                  }`}
                />
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg shadow-md disabled:opacity-50 transition duration-300 cursor-pointer"
                >
                  {loading ? "Updating..." : "✅ Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelClick}
                  disabled={loading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg shadow-md disabled:opacity-50 transition duration-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
