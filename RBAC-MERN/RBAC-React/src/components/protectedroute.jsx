import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token || token === "undefined" || token === "null") {
    return <Navigate to="/login" replace />;
  }

  return children;
}


export function RedirectIfLoggedInRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
