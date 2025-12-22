const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");
const UserModel = require("../models/UserModel");

async function userSeeder(count = 20) {
  console.log(`👤 [USER] Creating ${count} seeded users...`);

  const users = [];
  const hashedPassword = await bcrypt.hash("password123", 10);

  for (let i = 0; i < count; i++) {
    users.push({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: hashedPassword,
      isSeeded: 1,
    });
  }

  await UserModel.batchCreate(users);

  console.log(`✅ [USER] ${count} seeded users inserted`);
}

module.exports = userSeeder;
