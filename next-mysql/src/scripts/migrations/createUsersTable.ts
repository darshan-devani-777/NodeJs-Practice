import { db } from "../../app/lib/db"

export async function up() {
  console.log("🚀 Running users migration...")

  // Check if table exists first
  const [rows]: any = await db.execute("SHOW TABLES LIKE 'users'")
  if (rows.length > 0) {
    console.log("⚠️ users table already exists")
    return
  }

  // Create table
  await db.execute(`
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
  `)

  console.log("✅ users table created")
}

export async function down() {
  console.log("↩️ Rolling back users table")
  await db.execute(`DROP TABLE IF EXISTS users`)
}