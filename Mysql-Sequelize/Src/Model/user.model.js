const { DataTypes } = require('sequelize');
const sequelize = require('../Database/db');

const User = sequelize.define('users', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
}, {
  timestamps: false
});

const Database = async () => {
  try {
    await sequelize.authenticate();
    console.log('MYSQL Connected...!');
    await sequelize.sync();
    console.log('Models Synced!');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

module.exports = { User, Database };
