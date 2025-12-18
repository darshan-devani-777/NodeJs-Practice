const { Sequelize, DataTypes } = require("sequelize");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: process.env.DATABASE_DIALECT,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 60000,
    },
    maxAllowedPacket: 512 * 1024 * 1024,
  }
);

const db = {};
const modelsDir = __dirname;

console.log("📦 Loading models from:", modelsDir);

// Loop all model files dynamically
fs.readdirSync(modelsDir)
  .filter((file) => file.endsWith(".js") && file !== "dbconfig.js" && file !== "index.js")
  .forEach((file) => {
    console.log(`➡️  Loading model: ${file}`);
    const modelFile = require(path.join(modelsDir, file));

    if (typeof modelFile !== "function") {
      console.error(`❌ Model file ${file} does NOT export a function! Skipping...`);
      return;
    }

    const model = modelFile(sequelize, DataTypes);
    db[model.name] = model;
  });

// Run associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

sequelize
  .sync({ force: false, alter: true })
  .then(() => console.log("✅ MySQL connected..."))
  .catch((err) => console.error("❌ Database connection error:", err));

module.exports = { db, sequelize };
