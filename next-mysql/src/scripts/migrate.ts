import fs from "fs"
import path from "path"
import { db } from "../app/lib/db"

async function migrate() {

  await db.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const migrationDir = path.join(__dirname, "migrations")
  let files = fs.readdirSync(migrationDir).sort()

  const migrationFile = process.argv[2]
  if (migrationFile) {
    files = files.filter(f => f === migrationFile)
    if (files.length === 0) {
      console.log(`❌ Migration file not found: ${migrationFile}`)
      process.exit(1)
    }
  }

  const [rows]: any = await db.execute("SELECT name FROM migrations")
  const executed = rows.map((r: any) => r.name)

  for (const file of files) {
    if (executed.includes(file)) {
      console.log(`⚠️ Migration already executed: ${file}`)
      continue
    }

    console.log(`🚀 Running migration: ${file}`)
    const migration = await import(`./migrations/${file}`)
    await migration.up()

    await db.execute("INSERT INTO migrations (name) VALUES (?)", [file])
  }

  console.log("✅ Migration(s) completed")
  process.exit(0)
}

migrate()