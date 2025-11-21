# 🚀 NestJS + Sequelize + MySQL  
Complete guide for running migrations, seeders, and testing CRUD APIs.

---

## 📦 1. Installation

```bash
npm install
npm install sequelize mysql2 sequelize-typescript bcryptjs
npm install --save-dev sequelize-cli

⚙️ 2. Environment Setup (.env)

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=yourpassword
DB_NAME=nestdb

DB_NAME_TEST=nestdb_test
DB_NAME_PROD=nestdb_prod

🛠 3. Sequelize Configuration

require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST,
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
  },
};

🗄 4. Create Database

mysql -u root -p -e "CREATE DATABASE nestdb;"

🧱 5. Migrations

npx sequelize-cli migration:generate --name create-users-table

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Users');
  },
};


Run migrations :- npx sequelize-cli db:migrate
Undo last migration :- npx sequelize-cli db:migrate:undo
Undo all migrations :- npx sequelize-cli db:migrate:undo:all
status :- npx sequelize-cli db:migrate:status

🌱 6. Seeders

Generate seeder :- npx sequelize-cli seed:generate --name admin-seeder

'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    return queryInterface.bulkInsert('Users', [
      {
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('Users', {
      email: 'admin@example.com',
    });
  },
};


Run all seeders :- npx sequelize-cli db:seed:all
Run single seeder :- npx sequelize-cli db:seed --seed <filename>.js
Undo last seeder :- npx sequelize-cli db:seed:undo
Undo all seeders :- npx sequelize-cli db:seed:undo:all

🚀 7. Start the Application

npm run start:dev

🔥 8. API Testing (cURL)

<!-- # CREATE -->
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123456"}' | jq

<!-- # READ ALL -->
curl http://localhost:3000/users | jq

<!-- # READ ONE -->
curl http://localhost:3000/users/1 | jq

<!-- # UPDATE -->
curl -X PATCH http://localhost:3000/users/1 -H "Content-Type: application/json" \
  -d '{"name":"Updated"}' | jq

<!-- # DELETE -->
curl -X DELETE http://localhost:3000/users/1 | jq

<!-- Terminal Execution -->

-> Run main app - npm run start:dev
-> Open another terminal - execute above all queries
