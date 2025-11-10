import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`https://dummyjson.com/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setProduct(data);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading)
    return <p className="text-center text-white">Loading product...</p>;

  return (
    <div className="p-4 bg-gray-800 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-white underline text-center">
        Product Details
      </h2>

      {product && (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-64 object-contain mb-4 rounded-lg"
          />
          <h3 className="text-xl font-semibold text-blue-700 mb-1">
            {product.title}
          </h3>
          <p className="text-sm font-semibold text-gray-500 mb-2 capitalize">
            Category: {product.category}
          </p>
          <p className="text-base font-medium text-green-700 mb-4">
            Price: ${product.price}
          </p>
          <p className="text-gray-800">{product.description}</p>
        </div>
      )}
    </div>
  );
}
