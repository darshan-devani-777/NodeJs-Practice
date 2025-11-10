import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation(); 

  const navLinkStyle = (path) =>
    `px-3 py-2 rounded cursor-pointer transition duration-300 ease-in-out 
     hover:bg-blue-500 hover:text-white hover:shadow-md 
     ${location.pathname === path ? "underline underline-offset-4" : ""}`; 

  return (
    <nav className="bg-gray-700 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-50 font-semibold text-xl">
      <div>
        <Link to="/" className={navLinkStyle("/")}>
          Home
        </Link>
      </div>

      <div className="flex gap-6">
        <Link to="/users" className={navLinkStyle("/users")}>
          Users
        </Link>
        <Link to="/products" className={navLinkStyle("/products")}>
          Products
        </Link>
        <Link to="/carts" className={navLinkStyle("/carts")}>
          Carts
        </Link>
        <Link to="/orders" className={navLinkStyle("/orders")}>
          Orders
        </Link>
      </div>
    </nav>
  );
}
