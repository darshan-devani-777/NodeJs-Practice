import { useFormik } from "formik";
import { registerValidationSchema } from "../validation/validation"; 
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api"; 
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("password", values.password);
        formData.append("role", values.role);
        if (image) {
          formData.append("image", image);
        }

        const res = await api.post("/auth/register", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.data.success) {
          alert("Registration successful! Please login.");
          navigate("/login");
        } else {
          alert(res.data.message || "Registration failed.");
        }
      } catch (error) {
        alert(error.response?.data?.message || "Something went wrong.");
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 px-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-white underline">Register</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4" encType="multipart/form-data">
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full px-4 py-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="text-red-500 text-sm">{formik.errors.name}</p>
          )}
  
          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-sm">{formik.errors.email}</p>
          )}
  
          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-sm">{formik.errors.password}</p>
          )}
  
          {/* Role */}
          <select
            name="role"
            value={formik.values.role}
            className="w-full px-4 py-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
  
          {/* Image */}
          <input
            type="file"
            accept="image/*"
            className="w-full px-4 py-2 border rounded-lg cursor-pointer bg-gray-800 text-white"
            onChange={(e) => setImage(e.target.files[0])}
          />
  
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-800 transition cursor-pointer"
          >
            Register
          </button>
  
          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:underline font-medium">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
