'use client'

import { useEffect, useState } from "react";

export default function ProductsCSR() {
  const [products, setProducts] = useState([]);
  const [loadTime, setLoadTime] = useState(null);
  const [status, setStatus] = useState('🟡 Initializing...');

  useEffect(() => {
    const start = performance.now();
    console.log("🚀 === CSR FETCH STARTED (BROWSER ONLY) ===");
    console.log("📍 Location: Client-side useEffect");
    console.log("⏱️ Start time:", new Date().toISOString());
    
    setStatus('🔄 Fetching data from FakeStore API...');

    fetch("https://fakestoreapi.com/products", { 
      cache: 'no-store'
    })
      .then((res) => {
        console.log("📡 Response received:", res.status);
        return res.json();
      })
      .then((data) => {
        const end = performance.now();
        const time = (end - start).toFixed(2);
        
        console.log(`✅ CSR FETCH COMPLETED in ${time}ms`);
        console.log("📦 Products count:", data.length);
        console.log("📍 Data visible ONLY in browser dev tools");
        console.log("🌐 View page source - NO DATA HERE!");
        console.log("═".repeat(50));

        setProducts(data);
        setLoadTime(time);
        setStatus('✅ Loaded!');
      })
      .catch((error) => {
        console.error("❌ CSR Fetch failed:", error);
        setStatus('❌ Failed to load');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-xl px-8 py-4 rounded-3xl shadow-2xl mb-6">
            <div className="w-4 h-4 bg-yellow-400 rounded-full mr-3 animate-pulse"></div>
            <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-2xl">
              CSR Products
            </h1>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-white">
              <div className="text-2xl font-bold">{status}</div>
              <div className="text-sm opacity-90">Current State</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-white">
              <div className="text-2xl font-bold text-blue-300">
                {loadTime ? `${loadTime}ms` : '--'}
              </div>
              <div className="text-sm opacity-90">Client Fetch Time</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-white">
              <div className="text-2xl font-bold text-green-300">{products.length}</div>
              <div className="text-sm opacity-90">Products Loaded</div>
            </div>
          </div>

          <div className="text-xl text-white/90 bg-black/20 rounded-2xl p-6 backdrop-blur-xl">
            👀 <strong>CSR:</strong> Check browser console + View Page Source (empty data!)
          </div>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="group bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl hover:shadow-3xl hover:-translate-y-3 transition-all duration-500 h-full border border-white/50 hover:border-indigo-300"
            >
              <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden mb-4">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {p.title}
              </h3>
              <p className="text-xs text-gray-500 capitalize mb-3 font-medium tracking-wide">
                {p.category}
              </p>
              <div className="text-2xl font-black text-emerald-600 drop-shadow-lg">
                ${p.price}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
