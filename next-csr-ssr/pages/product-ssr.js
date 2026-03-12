import { useEffect } from "react";

export default function ProductsSSR({ products, fetchTime, serverTimestamp }) {
  useEffect(() => {
    console.log("🌐 === SSR PAGE HYDRATED (BROWSER) ===");
    console.log("📍 Location: Client-side useEffect (hydration)");
    console.log("✅ Data already in HTML - instant render!");
    console.log("📦 Products count:", products.length);
    console.log("═".repeat(50));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-xl px-8 py-4 rounded-3xl shadow-2xl mb-6">
            <div className="w-4 h-4 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-2xl">
              SSR Products
            </h1>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-white">
              <div className="text-2xl font-bold text-green-300">✅ Server Rendered</div>
              <div className="text-sm opacity-90">Rendering Complete</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-white">
              <div className="text-2xl font-bold text-blue-300">{fetchTime}ms</div>
              <div className="text-sm opacity-90">Server Fetch Time</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-white">
              <div className="text-2xl font-bold">{products.length}</div>
              <div className="text-sm opacity-90">Products Rendered</div>
            </div>
          </div>

          <div className="text-xl text-white/90 bg-black/20 rounded-2xl p-6 backdrop-blur-xl">
            🔍 <strong>SSR:</strong> View Page Source - FULL DATA VISIBLE! Check terminal logs.
          </div>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="group bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl hover:shadow-3xl hover:-translate-y-3 transition-all duration-500 h-full border border-white/50 hover:border-emerald-300"
            >
              <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden mb-4">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
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

export async function getServerSideProps() {
  const start = Date.now();
  console.log("🚀 === SSR FETCH STARTED (SERVER ONLY) ===");
  console.log("📍 Location: getServerSideProps (Node.js)");
  console.log("⏱️ Server time:", new Date().toISOString());
  
  try {
    const res = await fetch("https://fakestoreapi.com/products", {
      cache: 'no-store'
    });
    
    console.log("📡 Server received response:", res.status);
    const products = await res.json();
    
    const end = Date.now();
    const fetchTime = end - start;
    const serverTimestamp = new Date().toISOString();
    
    console.log(`✅ SSR FETCH COMPLETED in ${fetchTime}ms`);
    console.log("📦 Products count:", products.length);
    console.log("💾 Data embedded in HTML response");
    console.log("🌐 View page source - DATA VISIBLE!");
    console.log("═".repeat(50));
    
    return {
      props: {
        products,
        fetchTime,
        serverTimestamp
      }
    };
  } catch (error) {
    console.error("❌ SSR Fetch failed:", error);
    return { props: { products: [], fetchTime: 0 } };
  }
}
