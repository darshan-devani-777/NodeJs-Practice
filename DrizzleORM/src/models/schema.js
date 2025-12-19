const mysql = require("mysql2/promise");
const { drizzle } = require("drizzle-orm/mysql2");
const {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  index,
} = require("drizzle-orm/mysql-core");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "drizzle_demo",
});

const db = drizzle(pool);

const users = mysqlTable(
  "users",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
    deletedAt: timestamp("deletedAt").default(null),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  })
);

const posts = mysqlTable(
  "posts",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
    deletedAt: timestamp("deletedAt").default(null),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    createdAtIdx: index("post_created_at_idx").on(table.createdAt),
  })
);

module.exports = { db, users, posts };

