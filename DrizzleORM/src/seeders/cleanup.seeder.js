const { db, users, posts } = require("../models/schema");
const { sql } = require("drizzle-orm");

async function cleanupSeededUsers() {
  console.log("🧹 Cleaning OLD seeded users & posts...");

  console.log("🗑️ Deleting posts marked as seeded...");
  await db.execute(sql`
    DELETE FROM ${posts} WHERE isSeeded = 1
  `);

  console.log("🗑️ Deleting seeded users...");
  await db.execute(sql`
    DELETE FROM ${users} WHERE isSeeded = 1
  `);

  console.log("✅ Seeded users & posts deleted successfully");
}

module.exports = cleanupSeededUsers;
