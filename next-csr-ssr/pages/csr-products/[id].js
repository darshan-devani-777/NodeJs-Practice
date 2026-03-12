'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductDetailCSR() {
  const router = useRouter();
  const id = router.query?.id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchTime, setFetchTime] = useState(0);

  useEffect(() => {
    if (!id) return;
    
    console.log("🚀 === CSR PRODUCT DETAIL START ===");
    console.log("📍 Client-side fetch for ID:", id);
    
    const start = performance.now();
    setLoading(true);
    
    fetch(`https://dummyjson.com/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const end = performance.now();
        const time = (end - start).toFixed(2);
        
        console.log(`✅ CSR PRODUCT LOADED in ${time}ms`);
        console.log("📦 Product:", data.title);
        console.log("🌐 View page source - NO DATA!");
        console.log("═".repeat(50));
        
        setProduct(data);
        setFetchTime(Number(time));
      })
      .catch((error) => {
        console.error("❌ CSR Product fetch failed:", error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-8"></div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Loading Product...</h1>
          <p className="text-white/80 mt-2">CSR - Fetching from API</p>
          <p className="text-sm text-white/60 mt-1">Check browser console</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <p>Check browser console for errors</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/50">
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-6 py-3 rounded-full mb-6">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
              CSR Product Detail - Client Rendered ({fetchTime}ms)
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 drop-shadow-lg">
              {product.title}
            </h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="w-full h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg">
                Client Fetched
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm px-4 py-2 rounded-full font-semibold uppercase tracking-wide">
                  {product.category}
                </span>
              </div>
              
              <div>
                <div className="text-4xl font-black text-emerald-600 mb-2 drop-shadow-lg">
                  ${product.price}
                </div>
                <div className="text-sm text-gray-500">Client fetch: {fetchTime}ms</div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl">
                <h3 className="font-bold text-xl mb-3 text-gray-900">CSR Characteristics:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• ⚠️ No data in page source</li>
                  <li>• ⚠️ Loading spinner shown</li>
                  <li>• ✅ Better interactivity</li>
                  <li>• Client: {new Date().toLocaleString()}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
