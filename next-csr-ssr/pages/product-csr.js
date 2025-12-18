"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProductsCSR() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState(1000);

  // Pagination
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("https://dummyjson.com/products?limit=100")
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data.products);
        setLoading(false);
      });
  }, []);

  // Extract category
  const categories = [
    ...new Set(
      allProducts.map((p) =>
        typeof p.category === "object" ? p.category.name : p.category
      )
    ),
  ];

  // Apply filters
  const filteredProducts = allProducts.filter((product) => {
    const titleMatch = product.title
      .toLowerCase()
      .includes(searchTitle.toLowerCase());

    const categoryName =
      typeof product.category === "object"
        ? product.category.name
        : product.category;

    const categoryMatch = selectedCategory
      ? categoryName === selectedCategory
      : true;

    const priceMatch = product.price <= maxPrice;

    return titleMatch && categoryMatch && priceMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  if (loading) {
    return (
      <div className="p-4 bg-gray-800">
        <p className="text-white text-lg">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-5 underline text-center">
        Client Side Rendered Products
      </h2>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center items-center">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTitle}
          onChange={(e) => {
            setSearchTitle(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 rounded text-white border border-gray-500"
        />

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 rounded text-white border border-gray-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="1000"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded text-white border border-gray-500"
          />
          <span className="text-sm">Max Price: ${maxPrice}</span>
        </div>
      </div>

      {/* Product List */}
      {paginatedProducts.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedProducts.map((p) => {
            const categoryName =
              typeof p.category === "object" ? p.category.name : p.category;

            return (
              <li
                key={p.id}
                className="border border-gray-300 rounded-lg shadow-sm p-4 bg-white hover:shadow-lg hover:scale-105 transition duration-300 ease-in-out cursor-pointer"
              >
                <Link href={`/csr-products/${p.id}`}>
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-40 object-contain mb-4"
                  />
                  <div className="text-center text-black">
                    <h3 className="text-lg font-semibold text-blue-700 mb-1">
                      Title: {p.title}
                    </h3>
                    <p className="text-sm font-semibold text-gray-500 mb-2 capitalize">
                      Category: {categoryName}
                    </p>
                    <p className="text-base font-medium text-green-700">
                      Price: ${p.price}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex items-center justify-center h-96">
          <p className="text-white text-2xl text-center">No products found.</p>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-8 flex justify-center gap-3">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 rounded cursor-pointer hover:bg-gray-200 ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-white text-black"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
