import dotenv from "dotenv"
import path from "path"

dotenv.config({
  path: path.resolve(process.cwd(), ".env")
})

import { db } from "../../app/lib/db"
import bcrypt from "bcryptjs"

async function seedAdmin() {
  const adminEmail = "admin@gmail.com"
  const adminPassword = "Admin@123"
  const adminName = "Admin"

  try {
    console.log("🔌 Checking database connection...")

    const [rows]: any = await db.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [adminEmail]
    )

    if (rows.length > 0) {
      console.log("⚠️ Admin already exists")
      console.log("📧 Email:", adminEmail)
      process.exit(0)
    }

    console.log("🔐 Hashing password...")

    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    console.log("👤 Creating admin user...")

    await db.execute(
      `INSERT INTO users 
      (name, email, password, isActive, isEmailVerified, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [adminName, adminEmail, hashedPassword, 1, 1]
    )

    console.log("🎉 Admin seeded successfully!")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("👤 Name :", adminName)
    console.log("📧 Email :", adminEmail)
    console.log("🔑 Password :", adminPassword)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━")

    process.exit(0)
  } catch (error) {
    console.error("❌ Admin seed failed")
    console.error(error)
    process.exit(1)
  }
}

seedAdmin()