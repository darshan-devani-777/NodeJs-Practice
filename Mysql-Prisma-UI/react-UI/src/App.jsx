import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/ProductList";
import Users from "./pages/UserList";
import Orders from "./pages/OrderList";
import Carts from "./pages/CartList";

export default function App() {
  return (
    <div className="">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/users" element={<Users />} />
        <Route path="/carts" element={<Carts />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </div>
  );
}
