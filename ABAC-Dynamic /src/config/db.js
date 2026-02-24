const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
    });

    console.log("✅ MongoDB Connected:", process.env.MONGO_URI);
  } catch (error) {
    console.error("❌ DB Connection Failed:", error.message);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected!");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("♻️ MongoDB reconnected");
  });
};

module.exports = connectDB;