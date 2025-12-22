const { faker } = require("@faker-js/faker");
const { db, users } = require("../models/schema");
const { and, isNull, eq } = require("drizzle-orm");
const PostModel = require("../models/PostModel");

async function postSeeder() {
  console.log("📝 [POST] Creating EXACT 1 post per seeded user...");

  const seededUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        isNull(users.deletedAt),
        eq(users.isSeeded, 1)
      )
    );

  console.log(`📝 [POST] ${seededUsers.length} seeded users found`);

  const posts = [];

  for (const user of seededUsers) {
    posts.push({
      userId: user.id,
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(2),
      isSeeded: 1,
    });
  }

  await PostModel.batchCreate(posts);

  console.log(`✅ [POST] ${posts.length} seeded posts created`);
}

module.exports = postSeeder;
