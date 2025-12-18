import { Routes, Route } from "react-router-dom";
import { ProtectedRoute, RedirectIfLoggedInRoute } from "./protectedroute";
import Profile from "./profile";
import Dashboard from "./dashboard";
import Users from "./userList";
import Products from "./productList";
import Carts from "./cartList";
import Orders from "./orderList";
import Login from "./login";
import Register from "./register";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("token");
    setUser(storedUser);
    setToken(storedToken);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  const currentPath = location.pathname;

  const linkClass = (path) =>
    `block px-4 py-2 font-medium ${
      currentPath === path
        ? "text-blue-300 underline underline-offset-4 decoration-2"
        : "text-blue-300 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen">
      {/* Admin/Superadmin Sidebar */}
      {(user?.role === "admin" || user?.role === "superadmin") && (
        <div className="w-64 bg-gray-800 text-white min-h-screen fixed top-0 left-0 flex flex-col">
          <div className="p-4">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              {user?.image && (
                <img
                  src={`http://localhost:1212/${user.image}`}
                  alt="User"
                  className="w-14 h-14 rounded-full border-2 border-white object-cover"
                />
              )}
              <div className="text-white">
                <p className="text-xl font-semibold text-red-300">
                  {user.name?.trim()}
                </p>
                <p className="text-sm text-blue-300 mt-1">
                  ({user.role.charAt(0).toUpperCase() + user.role.slice(1)})
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-6 flex-grow">
            <Link to="/profile" className={linkClass("/profile")}>
              Profile
            </Link>
            <Link to="/dashboard" className={linkClass("/dashboard")}>
              Dashboard
            </Link>
            <Link to="/users" className={linkClass("/users")}>
              Users
            </Link>
            <Link to="/products" className={linkClass("/products")}>
              Products
            </Link>
            <Link to="/orders" className={linkClass("/orders")}>
              Orders
            </Link>
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="block w-60 bg-red-600 px-3 py-2 mt-auto mb-2 rounded hover:bg-red-700 text-white cursor-pointer transition duration-300 mx-auto"
          >
            Logout
          </button>
        </div>
      )}

      {/* User Top Header */}
      {user?.role === "user" && (
        <div className="fixed top-0 left-0 right-0 bg-gray-800 text-white flex items-center justify-between px-6 py-4 z-10">
          <div className="flex items-center gap-4">
            {user?.image && (
              <img
                src={`http://localhost:1212/${user.image}`}
                alt="User"
                className="w-14 h-14 rounded-full border-2 border-white object-cover"
              />
            )}
            <div>
              <p className="text-lg font-semibold text-red-300">
                {user.name?.trim()}
              </p>
              <p className="text-sm text-blue-300">
                ({user.role.charAt(0).toUpperCase() + user.role.slice(1)})
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Link to="/profile" className={linkClass("/profile")}>
              Profile
            </Link>
            <Link to="/products" className={linkClass("/products")}>
              Products
            </Link>
            <Link to="/carts" className={linkClass("/carts")}>
              Carts
            </Link>
            <Link to="/orders" className={linkClass("/orders")}>
              Orders
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition duration-300 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 ${
          user?.role === "admin" || user?.role === "superadmin" ? "ml-64" : ""
        }`}
      >
        <Routes>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/carts"
            element={
              <ProtectedRoute>
                <Carts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          {/* Unprotected Routes with Redirect */}
          <Route
            path="/login"
            element={
              <RedirectIfLoggedInRoute>
                <Login />
              </RedirectIfLoggedInRoute>
            }
          />
          <Route
            path="/register"
            element={
              <RedirectIfLoggedInRoute>
                <Register />
              </RedirectIfLoggedInRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
