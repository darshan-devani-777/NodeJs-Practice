export default async function ProductDetailSSR({ params }) {
  const res = await fetch(`https://dummyjson.com/products/${params.id}`, {
    cache: 'no-store'
  });
  const product = await res.json();

  console.log("🚀 === SSR PRODUCT DETAIL ===");
  console.log("📍 Server-rendered product:", product.title);
  console.log("💾 Data in HTML source!");

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/50">
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-6 py-3 rounded-full mb-6">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              SSR Product Detail - Server Rendered
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
              <div className="absolute -top-4 -right-4 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg">
                Server Rendered
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="inline-block bg-gradient-to-r from-teal-100 to-blue-100 text-teal-800 text-sm px-4 py-2 rounded-full font-semibold uppercase tracking-wide">
                  {product.category}
                </span>
              </div>
              
              <div>
                <div className="text-4xl font-black text-emerald-600 mb-2 drop-shadow-lg">
                  ${product.price}
                </div>
                <div className="text-sm text-gray-500">Price (Server fetched)</div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl">
                <h3 className="font-bold text-xl mb-3 text-gray-900">SSR Benefits:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• ✅ Data visible in page source</li>
                  <li>• ✅ SEO friendly</li>
                  <li>• ✅ Fast first paint</li>
                  <li>• Server: {new Date().toLocaleString()}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
