const { eq, and, isNull, desc, asc, sql } = require("drizzle-orm");
const { db, posts, users } = require("./schema");

class PostModel {
  async create({ userId, title, content }) {
    const [result] = await db
      .insert(posts)
      .values({ userId, title, content })
      .execute();

    const id = result.insertId;
    return this.findOne(id);
  }

  async findOne(id) {
    const rows = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        userId: posts.userId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)));

    return rows[0] || null;
  }

  async findByUserId(userId, { page, limit, sortBy, order } = {}) {
    let query = db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        userId: posts.userId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(and(eq(posts.userId, userId), isNull(posts.deletedAt)));

    if (sortBy) {
      const allowedSortFields = ["id", "title", "createdAt", "updatedAt"];
      if (allowedSortFields.includes(sortBy)) {
        const orderDirection =
          order === "desc" ? desc(posts[sortBy]) : asc(posts[sortBy]);
        query = query.orderBy(orderDirection);
      }
    } else {
      query = query.orderBy(desc(posts.createdAt));
    }

    if (limit && Number(limit) > 0) {
      const pageNum = Number(page) > 0 ? Number(page) : 1;
      const lim = Number(limit);
      const offset = (pageNum - 1) * lim;
      query = query.limit(lim).offset(offset);
    }

    return query;
  }

  async getPostsGroupedByUser() {
    return db
      .select({
        userId: posts.userId,
        userName: users.name,
        userEmail: users.email,
        postCount: sql`COUNT(${posts.id})`,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(isNull(posts.deletedAt))
      .groupBy(posts.userId, users.name, users.email)
      .having(sql`COUNT(${posts.id}) > 0`);
  }

  async batchCreate(postsData) {
    const [results] = await db
      .insert(posts)
      .values(postsData)
      .execute();

    return results;
  }
}

module.exports = new PostModel();

