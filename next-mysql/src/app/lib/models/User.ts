import { db } from "../db";

export const User = {
  findByEmail: async (email: string) => {
    const [rows]: any = await db.query("SELECT * FROM users WHERE email=?", [email]);
    return rows[0];
  },

  findById: async (id: number) => {
    const [rows]: any = await db.query("SELECT * FROM users WHERE id=?", [id]);
    return rows[0];
  },

  create: async (name: string, email: string, password: string, token: string, expire: Date) => {
    const [result]: any = await db.query(
      `INSERT INTO users (name,email,password,emailVerificationToken,emailVerificationExpire)
       VALUES (?,?,?,?,?)`,
      [name, email, password, token, expire]
    );
    return result.insertId;
  },

  // NEW: Reset token validation
  findByResetToken: async (tokenHash: string) => {
    const [rows]: any = await db.query(
      `SELECT id, name, email FROM users 
       WHERE resetPasswordToken=? AND resetPasswordExpire > NOW()`,
      [tokenHash]
    );
    return rows[0];
  },

  // NEW: Email verification token update
  updateEmailVerificationToken: async (userId: number, token: string, expire: Date) => {
    await db.query(
      `UPDATE users SET emailVerificationToken=?, emailVerificationExpire=? WHERE id=?`,
      [token, expire, userId]
    );
  },

  verifyEmail: async (userId: number) => {
    await db.query(
      `UPDATE users 
       SET isEmailVerified=1, emailVerificationToken=NULL, emailVerificationExpire=NULL
       WHERE id=?`,
      [userId]
    );
  },

  updateResetToken: async (userId: number, token: string, expire: Date) => {
    await db.query(
      `UPDATE users SET resetPasswordToken=?, resetPasswordExpire=? WHERE id=?`,
      [token, expire, userId]
    );
  },

  updatePassword: async (userId: number, password: string) => {
    await db.query(
      `UPDATE users SET password=?, resetPasswordToken=NULL, resetPasswordExpire=NULL WHERE id=?`,
      [password, userId]
    );
  },

  updateRefreshToken: async (userId: number, token: string, expire: Date) => {
    await db.query(
      `UPDATE users SET refreshToken=?, refreshTokenExpire=? WHERE id=?`,
      [token, expire, userId]
    );
  },

  findByRefreshToken: async (token: string) => {
    const [rows]: any = await db.query(
      `SELECT id,name,email FROM users 
       WHERE refreshToken=? AND refreshTokenExpire > NOW()`,
      [token]
    );
    return rows[0];
  }
};
