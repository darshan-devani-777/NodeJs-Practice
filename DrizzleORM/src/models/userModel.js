const { eq, and, or, like, isNull, sql, desc, asc } = require("drizzle-orm");
const { db, users } = require("./schema");

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

  async count({ search } = {}) {
    const baseWhere = isNull(users.deletedAt);

    let whereClause = baseWhere;
    if (search) {
      const pattern = `%${search}%`;
      whereClause = and(
        baseWhere,
        or(like(users.name, pattern), like(users.email, pattern))
      );
    }

    const [row] = await db
      .select({
        count: sql`COUNT(*)`,
      })
      .from(users)
      .where(whereClause);

    return row.count;
  }

  async batchCreate(usersData) {
    const [results] = await db.insert(users).values(usersData).execute();

    return results;
  }

  async createWithTransaction({
    name,
    email,
    password,
    createDefaultPost = false,
  }) {
    return db.transaction(async (tx) => {
      const [userResult] = await tx
        .insert(users)
        .values({ name, email, password })
        .execute();

      const userId = userResult.insertId;

      if (createDefaultPost) {
        const { posts } = require("./schema");
        await tx
          .insert(posts)
          .values({
            userId,
            title: "Welcome Post",
            content: "This is your first post!",
          })
          .execute();
      }

      return { id: userId, name, email };
    });
  }

  async getUsersGroupedByCreationDate() {
    return db
      .select({
        date: sql`DATE(${users.createdAt})`.as("date"),
        userCount: sql`COUNT(${users.id})`.as("userCount"),
        userIds: sql`GROUP_CONCAT(${users.id})`.as("userIds"),
        userNames: sql`GROUP_CONCAT(${users.name})`.as("userNames"),
        userEmails: sql`GROUP_CONCAT(${users.email})`.as("userEmails"),
      })
      .from(users)
      .where(isNull(users.deletedAt))
      .groupBy(sql`DATE(${users.createdAt})`)
      .having(sql`COUNT(${users.id}) > 0`)
      .orderBy(desc(sql`DATE(${users.createdAt})`));
  }
}

module.exports = new UserModel();
