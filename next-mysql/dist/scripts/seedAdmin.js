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
const db_1 = require("../app/lib/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function seedAdmin() {
    const adminEmail = "admin@gmail.com";
    const adminPassword = "Admin@123";
    const adminName = "Admin";
    try {
        console.log("🔌 Checking database connection...");
        const [rows] = await db_1.db.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [adminEmail]);
        if (rows.length > 0) {
            console.log("⚠️ Admin already exists");
            console.log("📧 Email:", adminEmail);
            process.exit(0);
        }
        console.log("🔐 Hashing password...");
        const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 10);
        console.log("👤 Creating admin user...");
        await db_1.db.execute(`INSERT INTO users 
      (name, email, password, isActive, isEmailVerified, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())`, [adminName, adminEmail, hashedPassword, 1, 1]);
        console.log("🎉 Admin seeded successfully!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("👤 Name :", adminName);
        console.log("📧 Email :", adminEmail);
        console.log("🔑 Password :", adminPassword);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Admin seed failed");
        console.error(error);
        process.exit(1);
    }
}
seedAdmin();
