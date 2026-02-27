const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminEmail = "admin@example.com";

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    const admin = await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: "Admin@123",
      role: "admin",
      isActive: true,           
      isEmailVerified: true,     
    });

    console.log("✅ Admin created successfully");
    console.log({
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      isEmailVerified: admin.isEmailVerified,
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
};

createAdmin();