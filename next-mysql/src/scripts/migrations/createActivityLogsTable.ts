import { db } from "../../app/lib/db"

export async function up() {
  console.log("🚀 Running activity_logs migration...")

  const [rows]: any = await db.execute("SHOW TABLES LIKE 'activity_logs'")
  if (rows.length > 0) {
    console.log("⚠️ activity_logs table already exists")
    return
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INT(11) NOT NULL AUTO_INCREMENT,
      user_id INT(11) DEFAULT NULL,
      action VARCHAR(50) DEFAULT NULL,
      description TEXT DEFAULT NULL,
      ip VARCHAR(45) DEFAULT NULL,
      user_agent TEXT DEFAULT NULL,
      status VARCHAR(20) DEFAULT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX user_id_index (user_id),
      CONSTRAINT fk_activity_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)

  console.log("✅ activity_logs table created")
}

export async function down() {
  console.log("↩️ Rolling back activity_logs table")
  await db.execute(`DROP TABLE IF EXISTS activity_logs`)
}