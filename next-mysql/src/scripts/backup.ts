import fs from "fs";
import path from "path";
import zlib from "zlib";
import { db } from "../app/lib/db";

// Ensure backups folder exists
const backupDir = path.join(__dirname, "backups");
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

async function backupDatabase() {
  try {
    console.log("🚀 Starting database backup...");

    // Get all tables
    const [tables]: any = await db.query("SHOW TABLES");
    const tableNames = tables.map((row: any) => Object.values(row)[0]);

    for (const table of tableNames) {
      console.log(`📦 Backing up table: ${table}`);

      let sqlDump = "";

      // Get CREATE TABLE statement
      const [createStmt]: any = await db.query(`SHOW CREATE TABLE \`${table}\``);
      sqlDump += createStmt[0]["Create Table"] + ";\n\n";

      // Get table rows
      const [rows]: any = await db.query(`SELECT * FROM \`${table}\``);
      for (const row of rows) {
        const values = Object.values(row)
          .map((v) => (v === null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`))
          .join(", ");
        sqlDump += `INSERT INTO \`${table}\` VALUES (${values});\n`;
      }

      // Save SQL to file
      const filePath = path.join(backupDir, `${table}_${Date.now()}.sql`);
      fs.writeFileSync(filePath, sqlDump, { encoding: "utf8" });

      // Compress with gzip
      const gzipPath = `${filePath}.gz`;
      const fileContents = fs.readFileSync(filePath);
      const gzip = zlib.gzipSync(fileContents);
      fs.writeFileSync(gzipPath, gzip);

      // Remove uncompressed file
      fs.unlinkSync(filePath);

      console.log(`✅ Table backup completed: ${gzipPath}`);
    }

    console.log("🎉 Full database backup finished!");
  } catch (err) {
    console.error("❌ Backup failed", err);
  } finally {
    process.exit(0);
  }
}

backupDatabase();