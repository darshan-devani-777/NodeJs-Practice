import { db } from "../db";

export const ActivityLog = {

  create: async (
    userId: number | null,
    action: string,
    description: string,
    ip: string,
    userAgent: string,
    status: string
  ) => {

    await db.query(
      `INSERT INTO activity_logs
       (user_id, action, description, ip, user_agent, status)
       VALUES (?,?,?,?,?,?)`,
      [userId, action, description, ip, userAgent, status]
    );

  },

  getUserLogs: async (userId: number) => {

    const [rows]: any = await db.query(
      `SELECT * FROM activity_logs
       WHERE user_id=?
       ORDER BY createdAt DESC`,
      [userId]
    );

    return rows;
  }

};