const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  await mongoServer.stop();
});

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';

global.testUtils = {
  createTestUser: (overrides = {}) => ({
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    ...overrides
  }),

  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};
