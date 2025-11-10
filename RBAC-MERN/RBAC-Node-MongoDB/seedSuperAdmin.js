const User = require("./models/userModel");

const createSuperAdminIfNotExists = async () => {
  const email = "superadmin@example.com";
  const password = "Super@123";
  const name = "Super Admin";

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("✅ Superadmin already exists.");
      return;
    }
    const superadmin = new User({
      name,
      email,
      password,
      role: "superadmin",
    });
    await superadmin.save();
    console.log("✅ Superadmin Created Successfully...");
  } catch (err) {
    console.error("❌ Error creating superadmin:", err);
  }
};

module.exports = createSuperAdminIfNotExists;
