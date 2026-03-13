import { down as usersDown } from "./migrations/createUsersTable";
import { down as loginDown } from "./migrations/createLoginHistoryTable";
import { down as activityDown } from "./migrations/createActivityLogsTable";
import { db } from "../app/lib/db";

async function rollback() {
  console.log("↩️ Starting rollback...\n");

  const [rows]: any = await db.execute(
    "SELECT * FROM migrations ORDER BY id DESC LIMIT 1"
  );

  if (!rows.length) {
    console.log("⚠️ No migrations to rollback");
    process.exit(0);
  }

  const migration = rows[0];

  console.log(`↩️ Rolling back: ${migration.name}`);

  if (migration.name === "createUsersTable.ts") {
    await activityDown();
    await loginDown();
  }

  const file = await import(`./migrations/${migration.name}`);
  await file.down();

  await db.execute("DELETE FROM migrations WHERE id=?", [migration.id]);
  console.log("✅ Rollback complete");

  process.exit(0);
}

rollback();