import NavButtons from "../components/navButtons";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 px-4 py-10">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-xl w-full text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Welcome to the Product App!
        </h2>

        <p className="text-gray-700 text-md">
          Choose between{' '}
          <span className="font-semibold text-blue-600">SSR</span> or{' '}
          <span className="font-semibold text-green-600">CSR</span> to view
          products.
        </p>

        <NavButtons />
      </div>
    </div>
  );
}
