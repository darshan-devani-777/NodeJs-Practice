require("dotenv").config();

const cleanupSeededUsers = require("./cleanup.seeder");
const userSeeder = require("./user.seeder");
const postSeeder = require("./post.seeder");

async function runSeeders() {
  console.log("🌱 Seeder started...");
  console.log("🌍 ENV:", process.env.NODE_ENV || "development");

  if (process.env.NODE_ENV === "production") {
    console.error("❌ Seeding blocked in PRODUCTION");
    process.exit(1);
  }

  try {
    await cleanupSeededUsers();

    await userSeeder(20);

    await postSeeder();

    console.log("🎉 Seeder finished successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeder failed:", err);
    process.exit(1);
  }
}

runSeeders();
