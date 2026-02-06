const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log("✅ MongoDB connected...");
    console.log("Time:", new Date().toISOString());
  } catch (error) {
    console.error("❌ MongoDB connection failed");
    console.error("Error:", error.message);
    console.error("Time:", new Date().toISOString());
    process.exit(1);
  }
};

module.exports = connectDB;
