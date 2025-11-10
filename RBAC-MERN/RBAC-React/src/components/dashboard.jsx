import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("http://localhost:1212/api/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        console.log("API Response:", response.data); 
  
        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError("Failed to fetch data.");
        }
      } catch (err) {
        setError("An error occurred while fetching data.");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchDashboardData();
  }, []);
  

  if (error === 'Forbidden') {
    return <Redirect to="/login" />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4">
      <h1 className="text-2xl font-bold text-center text-gray-800 mt-5 underline">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-300">Total Users</h3>
          <p className="text-2xl font-bold text-blue-400">{dashboardData.totalUsers}</p>
        </div>
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-300">Total Products</h3>
          <p className="text-2xl font-bold text-blue-400">{dashboardData.totalProducts}</p>
        </div>
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-300">Total Orders</h3>
          <p className="text-2xl font-bold text-blue-400">{dashboardData.totalOrders}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
