import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleShopNowClick = () => {
    navigate("/products"); 
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-16 text-center">
      <div className="max-w-4xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-6 drop-shadow-lg">
          Welcome to Ecommerce-Site
        </h1>

        <p className="text-gray-400 max-w-xl mx-auto mb-10 text-base sm:text-md md:text-lg leading-relaxed">
          Discover premium products at great prices. Quality you can trust!
        </p>

        <button
          onClick={handleShopNowClick}
          className="bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-600 hover:to-teal-800 active:scale-95 text-white font-semibold py-4 px-14 rounded-full shadow-xl transition duration-300 transform cursor-pointer"
          aria-label="Shop Now"
        >
          Shop Now
        </button>
      </div>
    </div>
  );
}
