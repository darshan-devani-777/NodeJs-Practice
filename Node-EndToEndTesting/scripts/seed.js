const mongoose = require('mongoose');
const User = require('../src/models/User');
const { connectDB, disconnectDB } = require('../src/config/database');

require('dotenv').config();

const seedUsers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    firstName: 'Bob',
    lastName: 'Wilson',
    email: 'bob.wilson@example.com',
    password: 'password123',
    role: 'user'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    await connectDB();

    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    const createdUsers = await User.create(seedUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    console.log('\n📋 Seeded users:');
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} - ${user.email} (${user.role})`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, seedUsers };
