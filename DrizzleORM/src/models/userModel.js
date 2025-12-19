const mysql = require("mysql2/promise");
const { drizzle } = require("drizzle-orm/mysql2");
const {
  mysqlTable,
  int,
  varchar,
  timestamp,
} = require("drizzle-orm/mysql-core");
const { eq, and, or, like, isNull, sql, desc, asc } = require("drizzle-orm");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "drizzle_demo",
});

const db = drizzle(pool);

const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
  deletedAt: timestamp("deletedAt").default(null),
});

class UserModel {
  async findAll({ page, limit, search, sortBy, order, fields } = {}) {
    const baseWhere = isNull(users.deletedAt);

    let whereClause = baseWhere;
    if (search) {
      const pattern = `%${search}%`;
      whereClause = and(
        baseWhere,
        or(like(users.name, pattern), like(users.email, pattern))
      );
    }

    let selectQuery;
    if (fields && Array.isArray(fields) && fields.length > 0) {
      const selectObj = {};
      const allowedFields = ["id", "name", "email", "createdAt", "updatedAt"];
      fields.forEach((field) => {
        if (allowedFields.includes(field)) {
          selectObj[field] = users[field];
        }
      });
      if (Object.keys(selectObj).length === 0) {
        selectQuery = db.select().from(users);
      } else {
        selectQuery = db.select(selectObj).from(users);
      }
    } else {
      selectQuery = db.select().from(users);
    }

    let query = selectQuery.where(whereClause);

    if (sortBy) {
      const allowedSortFields = [
        "id",
        "name",
        "email",
        "createdAt",
        "updatedAt",
      ];
      if (allowedSortFields.includes(sortBy)) {
        const orderDirection =
          order === "desc" ? desc(users[sortBy]) : asc(users[sortBy]);
        query = query.orderBy(orderDirection);
      }
    } else {
      query = query.orderBy(desc(users.createdAt));
    }

    if (limit && Number(limit) > 0) {
      const pageNum = Number(page) > 0 ? Number(page) : 1;
      const lim = Number(limit);
      const offset = (pageNum - 1) * lim;
      query = query.limit(lim).offset(offset);
    }

    return query;
  }

  async findOne(id) {
    const rows = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)));
    return rows[0] || null;
  }

  async findByEmail(email) {
    const rows = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)));
    return rows[0] || null;
  }

  async create({ name, email, password }) {
    const [result] = await db
      .insert(users)
      .values({ name, email, password })
      .execute();

    const id = result.insertId;
    return { id, name, email };
  }

  async update(id, { name, email }) {
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    if (Object.keys(updateData).length === 0) {
      throw new Error("No fields to update");
    }

    await db
      .update(users)
      .set(updateData)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .execute();

    return this.findOne(id);
  }

  async softDelete(id) {
    await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, id))
      .execute();
  }

  async getStats() {
    const [row] = await db
      .select({
        total: sql`COUNT(*)`,
        active: sql`SUM(CASE WHEN ${users.deletedAt} IS NULL THEN 1 ELSE 0 END)`,
      })
      .from(users);

    return row;
  }
}

module.exports = new UserModel();
