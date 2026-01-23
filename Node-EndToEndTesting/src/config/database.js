const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nodejs-e2e-demo';

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(mongoURI, options);

    if (process.env.NODE_ENV !== 'test') {
      console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    }

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected...');
    });

    return conn;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (process.env.NODE_ENV !== 'test') {
      console.log('🍃 MongoDB connection closed');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
