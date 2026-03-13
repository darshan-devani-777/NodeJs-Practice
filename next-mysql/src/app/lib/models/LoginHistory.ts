import { db } from "../db";

export const LoginHistory = {

  create: async (
    userId: number | null,
    ip: string,
    userAgent: string,
    status: string
  ) => {

    await db.query(
      `INSERT INTO login_history
       (user_id, ip, user_agent, status)
       VALUES (?,?,?,?)`,
      [userId, ip, userAgent, status]
    );

  },

  getUserHistory: async (userId: number) => {

    const [rows]: any = await db.query(
      `SELECT * FROM login_history
       WHERE user_id=?
       ORDER BY createdAt DESC`,
      [userId]
    );

    return rows;
  }

};