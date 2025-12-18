import Link from "next/link";
import { useState, useMemo } from "react";

export async function getServerSideProps() {
  const res = await fetch("https://dummyjson.com/products?limit=100");
  const data = await res.json();

  return {
    props: { products: data.products },
  };
}

export default function ProductsSSR({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="p-4 bg-gray-800">
        <p className="text-white">No products available.</p>
      </div>
    );
  }

  // Pagination state
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // Search / Cagtegory / Price
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState(1000);

  // Filtered products based on search, category, and price
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "" || product.category === selectedCategory;
      const matchesPrice = product.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, selectedCategory, maxPrice]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  const categories = Array.from(
    new Set(products.map((product) => product.category))
  );

  return (
    <div className="p-4 bg-gray-800 min-h-screen">
      <h2 className="text-2xl font-bold mb-5 text-white underline text-center">
        Server Side Rendered Products
      </h2>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center items-center">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by title..."
          className="px-3 py-2 rounded text-white border border-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Category Filter */}
        <select
          className="px-3 py-2 rounded text-white border border-gray-500"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {/* Max Price Range Filter */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="1000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="px-3 py-2 rounded text-white border border-gray-500"
          />
          <span className="text-sm text-white">Max Price: ${maxPrice}</span>
        </div>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-white text-2xl text-center">No products found.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedProducts.map((p) => {
            return (
              <li
                key={p.id}
                className="border border-gray-300 rounded-lg shadow-sm p-4 bg-white hover:shadow-lg hover:scale-105 transition duration-300 ease-in-out cursor-pointer"
              >
                <Link href={`/ssr-products/${p.id}`}>
                  <div>
                    <img
                      src={p.images?.[0] || "https://via.placeholder.com/150"}
                      alt={p.title}
                      className="w-full h-40 object-contain mb-4"
                    />
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-blue-700 mb-1">
                        Title: {p.title}
                      </h3>
                      <p className="text-sm font-semibold text-gray-500 mb-2 capitalize">
                        Category: {p.category}
                      </p>
                      <p className="text-base font-medium text-green-700">
                        Price: ${p.price}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination Controls */}
      {filteredProducts.length > 0 && (
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
      )}
    </div>
  );
}
