import * as bcrypt from "bcryptjs"
import crypto from "crypto";
import nodemailer from "nodemailer";
import { db } from "../lib/db";
import { generateJWT, generateRefreshToken } from "../lib/jwt";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
}

/* ------------------- REGISTER USER ------------------- */
export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<ApiResponse> => {
  const [existing]: any = await db.query("SELECT id FROM users WHERE email=?", [email]);

  if (existing.length > 0) {
    return {
      success: false,
      message: "Email already exists. Please use a different email address.",
      statusCode: 409
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(20).toString("hex");
  const emailToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
  const expire = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const result: any = await db.query(
    `INSERT INTO users (name,email,password,emailVerificationToken,emailVerificationExpire)
     VALUES (?,?,?,?,?)`,
    [name, email, hashedPassword, emailToken, expire]
  );

  const insertedId = result[0].insertId;

  const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email/${verificationToken}`;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  const message = `
    <h2>Welcome ${name}!</h2>
    <p>Your account has been created successfully.</p>
    <p>Please verify your email address to activate your account:</p>
    <a href="${verificationUrl}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Your Email</a>
    <p><small>This link will expire in 24 hours.</small></p>
  `;

  await transporter.sendMail({
    from: `"Admin Dashboard" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Please Verify Your Email Address",
    html: message,
  });

  return {
    success: true,
    message: `Registration successful! Please check your email (${email}) to verify your account.`,
    data: { user: { id: insertedId, name, email } },
    statusCode: 201
  };
};

/* ------------------- LOGIN USER ------------------- */
export const loginUser = async (email: string, password: string): Promise<ApiResponse> => {
  const [rows]: any = await db.query("SELECT * FROM users WHERE email=?", [email]);

  if (rows.length === 0) {
    return { success: false, message: "Invalid email or password", statusCode: 401 };
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return { success: false, message: "Invalid email or password", statusCode: 401 };
  }

  if (!user.isEmailVerified) {
    return { success: false, message: "Please verify your email first", statusCode: 403 };
  }

  if (!user.isActive) {
    return { success: false, message: "Your account has been deactivated", statusCode: 403 };
  }

  const token = generateJWT(user.id);
  const { refreshToken, refreshTokenExpire } = generateRefreshToken();

  await db.query(
    `UPDATE users SET refreshToken=?, refreshTokenExpire=? WHERE id=?`,
    [refreshToken, refreshTokenExpire, user.id]
  );

  return {
    success: true,
    message: "User login successfully...",
    data: {
      user: { id: user.id, name: user.name, email: user.email },
      token,
      refreshToken
    },
    statusCode: 200
  };
};

/* ------------------- FORGOT PASSWORD ------------------- */
export const forgotPassword = async (email: string): Promise<ApiResponse> => {
  const [rows]: any = await db.query("SELECT * FROM users WHERE email=?", [email]);
  const user = rows[0] || { id: null, name: "User", email };

  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetHash = crypto.createHash("sha256").update(resetToken).digest("hex");
  const expire = new Date(Date.now() + 10 * 60 * 1000);

  if (user.id) {
    await db.query(
      `UPDATE users SET resetPasswordToken=?, resetPasswordExpire=? WHERE id=?`,
      [resetHash, expire, user.id]
    );
  }

  const resetUrl = `${process.env.APP_URL}/auth/reset-password/${resetToken}`;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  const message = `
    <h2>Reset Your Password</h2>
    <p>Hello ${user.name},</p>
    <p>You requested a password reset. Click the button below to create a new password:</p>
    <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
    <p><small>This link will expire in 10 minutes.</small></p>
  `;

  await transporter.sendMail({
    from: `"Admin Dashboard" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: message,
  });

  return {
    success: true,
    message: "If an account exists with this email, a password reset link has been sent.",
    data: { user: { id: user.id, name: user.name, email: user.email } },
    statusCode: 200
  };
};

/* ------------------- RESET PASSWORD ------------------- */
export const resetPassword = async (
  token: string,
  password: string,
  confirmPassword: string
): Promise<ApiResponse> => {
  if (!password || !confirmPassword) {
    return { success: false, message: "Password and confirm password are required.", statusCode: 400 };
  }

  if (password !== confirmPassword) {
    return { success: false, message: "Password and confirmPassword do not match.", statusCode: 400 };
  }

  if (password.length < 8) {
    return { success: false, message: "Password must be at least 8 characters long.", statusCode: 400 };
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const [rows]: any = await db.query(
    `SELECT * FROM users WHERE resetPasswordToken=? AND resetPasswordExpire > NOW()`,
    [hashedToken]
  );

  if (rows.length === 0) {
    return { success: false, message: "Invalid or expired reset token.", statusCode: 400 };
  }

  const user = rows[0];
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.query(
    `UPDATE users SET password=?, resetPasswordToken=NULL, resetPasswordExpire=NULL WHERE id=?`,
    [hashedPassword, user.id]
  );

  return {
    success: true,
    message: "Password updated successfully! You can now login with your new password.",
    data: { user: { id: user.id, name: user.name, email: user.email } },
    statusCode: 200
  };
};

/* ------------------- RESEND VERIFICATION EMAIL ------------------- */
export const resendVerification = async (email: string): Promise<ApiResponse> => {
  const [rows]: any = await db.query("SELECT * FROM users WHERE email=?", [email]);

  if (rows.length === 0) {
    return { success: true, message: "If an account exists with this email, a verification email has been sent.", statusCode: 200 };
  }

  const user = rows[0];
  if (user.isEmailVerified) {
    return { success: false, message: "Email already verified. Please login.", statusCode: 400 };
  }

  const verificationToken = crypto.randomBytes(20).toString("hex");
  const emailToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
  const expire = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.query(
    `UPDATE users SET emailVerificationToken=?, emailVerificationExpire=? WHERE id=?`,
    [emailToken, expire, user.id]
  );

  const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email/${verificationToken}`;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  const message = `
    <h2>Email Verification</h2>
    <p>Hello ${user.name},</p>
    <p>Please verify your email address:</p>
    <a href="${verificationUrl}" style="background:#007bff;color:white;padding:15px 30px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Verify Email</a>
    <p><small>This link will expire in 24 hours.</small></p>
  `;

  await transporter.sendMail({
    from: `"Admin Dashboard" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Resend Email Verification",
    html: message,
  });

  return {
    success: true,
    message: "Verification email sent again. Please check your inbox.",
    data: { user: { id: user.id, name: user.name, email: user.email } },
    statusCode: 200
  };
};

/* ------------------- REFRESH TOKEN FLOW ------------------- */
export const refreshTokenFlow = async (oldRefreshToken: string): Promise<ApiResponse> => {
  const [rows]: any = await db.query(
    `SELECT * FROM users WHERE refreshToken=? AND refreshTokenExpire > NOW()`,
    [oldRefreshToken]
  );

  if (rows.length === 0) {
    return { success: false, message: "Invalid or expired refresh token. Please login again.", statusCode: 401 };
  }

  const user = rows[0];
  const newAccessToken = generateJWT(user.id);
  const { refreshToken: newRefreshToken, refreshTokenExpire } = generateRefreshToken();

  await db.query(
    `UPDATE users SET refreshToken=?, refreshTokenExpire=? WHERE id=?`,
    [newRefreshToken, refreshTokenExpire, user.id]
  );

  return {
    success: true,
    message: "Token refreshed successfully",
    data: {
      user: { id: user.id, name: user.name, email: user.email },
      token: newAccessToken,
      refreshToken: newRefreshToken
    },
    statusCode: 200
  };
};