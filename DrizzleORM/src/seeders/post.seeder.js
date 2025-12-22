const { faker } = require("@faker-js/faker");
const { db, users } = require("../models/schema");
const { and, isNull, eq } = require("drizzle-orm");
const PostModel = require("../models/PostModel");

async function postSeeder() {
  console.log(
    "📝 [POST] Creating EXACT 1 hacker-style post per seeded user..."
  );

  const seededUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(and(isNull(users.deletedAt), eq(users.isSeeded, 1)));

  console.log(`📝 [POST] ${seededUsers.length} seeded users found`);

  const posts = [];

  for (const user of seededUsers) {
    const title = faker.helpers
    .arrayElements(
      [
        faker.hacker.noun(),
        faker.hacker.verb(),
        faker.hacker.adjective(),
        faker.hacker.ingverb(),
      ],
      2
    )
    .join(" ");

    const content = Array.from(
      { length: faker.number.int({ min: 3, max: 5 }) },
      () => faker.hacker.phrase()
    ).join(" ");

    posts.push({
      userId: user.id,
      title,
      content,
      isSeeded: 1,
    });
  }

  if (posts.length === 0) {
    console.log("⚠️ No seeded users found, skipping posts");
    return;
  }
  
  await PostModel.batchCreate(posts);
  console.log(`✅ [POST] ${posts.length} seeded posts created`);
}

module.exports = postSeeder;
