import { db } from "../../app/lib/db"

export async function up() {
  console.log("🚀 Running login_history migration...")

  const [rows]: any = await db.execute("SHOW TABLES LIKE 'login_history'")
  if (rows.length > 0) {
    console.log("⚠️ login_history table already exists")
    return
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS login_history (
      id INT(11) NOT NULL AUTO_INCREMENT,
      user_id INT(11) DEFAULT NULL,
      ip VARCHAR(45) DEFAULT NULL,
      user_agent TEXT DEFAULT NULL,
      status VARCHAR(50) DEFAULT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX user_id_index (user_id),
      CONSTRAINT fk_login_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)

  console.log("✅ login_history table created...")
}

export async function down() {
  console.log("↩️ Rolling back login_history table")
  await db.execute(`DROP TABLE IF EXISTS login_history`)
}