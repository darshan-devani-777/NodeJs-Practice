"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.resolve(process.cwd(), ".env")
});
const db_1 = require("../../app/lib/db");
async function createUsersTable() {
    try {
        console.log("🚀 Running users migration...");
        const [result] = await db_1.db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT(11) NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        isActive TINYINT(1) DEFAULT 1,
        isEmailVerified TINYINT(1) DEFAULT 0,
        emailVerificationToken VARCHAR(255) DEFAULT NULL,
        emailVerificationExpire DATETIME DEFAULT NULL,
        resetPasswordToken VARCHAR(255) DEFAULT NULL,
        resetPasswordExpire DATETIME DEFAULT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX email_index (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
        if (result.warningStatus === 0) {
            console.log("✅ users table ready");
        }
        else {
            console.log("⚠️ users table already exists");
        }
        process.exit(0);
    }
    catch (error) {
        console.error("❌ users migration failed");
        console.error(error);
        process.exit(1);
    }
}
createUsersTable();
