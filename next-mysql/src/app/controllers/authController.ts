import * as bcrypt from "bcryptjs"
import crypto from "crypto";
import nodemailer from "nodemailer";
import { db } from "../lib/db";
import { generateJWT, generateRefreshToken } from "../lib/jwt";

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  token?: string;
  confirmPassword?: string;
  refreshToken?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationErrors;
  statusCode?: number;
}

/* ------------------- REGISTER USER ------------------- */
export const registerUser = async (
  name: string | undefined,
  email: string | undefined,
  password: string | undefined
): Promise<ApiResponse> => {
  const errors: ValidationErrors = {};

  if (typeof name !== 'string' || !name) {
    errors.name = "Name is required";
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      errors.name = "Name must be at least 2 characters long";
    } else if (trimmedName.length > 50) {
      errors.name = "Name cannot exceed 50 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      errors.name = "Name can only contain letters and spaces";
    }
  }

  if (typeof email !== 'string' || !email) {
    errors.email = "Email is required";
  } else {
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }
  }

  if (typeof password !== 'string' || !password) {
    errors.password = "Password is required";
  } else {
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(password)) {
      errors.password = "Password must contain uppercase, lowercase, number, and special character (@$!%*?&)";
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Validation failed. Please check the errors below.",
      errors,
      statusCode: 400
    };
  }

  const trimmedName = name!.trim();
  const trimmedEmail = email!.toLowerCase().trim();

  const [existing]: any = await db.query("SELECT id FROM users WHERE email=?", [trimmedEmail]);

  if (existing.length > 0) {
    return {
      success: false,
      message: "Email already exists. Please use a different email address.",
      errors: { email: "This email is already registered" },
      statusCode: 409
    };
  }

  const hashedPassword = await bcrypt.hash(password!, 10);
  const verificationToken = crypto.randomBytes(20).toString("hex");
  const emailToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
  const expire = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const result: any = await db.query(
    `INSERT INTO users (name,email,password,emailVerificationToken,emailVerificationExpire)
     VALUES (?,?,?,?,?)`,
    [trimmedName, trimmedEmail, hashedPassword, emailToken, expire]
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
    <h2>Welcome ${trimmedName}!</h2>
    <p>Your account has been created successfully.</p>
    <p>Please verify your email address to activate your account:</p>
    <a href="${verificationUrl}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Your Email</a>
    <p><small>This link will expire in 24 hours.</small></p>
  `;

  await transporter.sendMail({
    from: `"Admin Dashboard" <${process.env.EMAIL_USER}>`,
    to: trimmedEmail,
    subject: "Please Verify Your Email Address",
    html: message,
  });

  return {
    success: true,
    message: `Registration successful! Please check your email (${trimmedEmail}) to verify your account.`,
    data: { user: { id: insertedId, name: trimmedName, email: trimmedEmail } },
    statusCode: 201
  };
};

/* ------------------- LOGIN USER ------------------- */
export const loginUser = async (
  email: string | undefined,
  password: string | undefined
): Promise<ApiResponse> => {
  const errors: ValidationErrors = {};

  if (typeof email !== 'string' || !email) {
    errors.email = "Email is required";
  } else {
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }
  }

  if (typeof password !== 'string' || !password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Validation failed. Please check the errors below.",
      errors,
      statusCode: 400
    };
  }

  const trimmedEmail = email!.trim().toLowerCase();

  const [rows]: any = await db.query("SELECT * FROM users WHERE email=?", [trimmedEmail]);

  if (rows.length === 0) {
    return {
      success: false,
      message: "Invalid email or password",
      errors: { email: "No account found with this email" },
      statusCode: 401
    };
  }

  const user = rows[0];
  
  const match = await bcrypt.compare(password!, user.password);
  if (!match) {
    return {
      success: false,
      message: "Invalid email or password",
      errors: { password: "Incorrect password" },
      statusCode: 401
    };
  }

  if (!user.isEmailVerified) {
    return {
      success: false,
      message: "Please verify your email first",
      errors: { email: "Please verify your email address first" },
      statusCode: 403
    };
  }

  if (!user.isActive) {
    return {
      success: false,
      message: "Your account has been deactivated",
      errors: { email: "Your account has been deactivated" },
      statusCode: 403
    };
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
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      },
      token,
      refreshToken
    },
    statusCode: 200
  };
};

/* ------------------- FORGOT PASSWORD ------------------- */
export const forgotPassword = async (
  email: string | undefined
): Promise<ApiResponse> => {
  const errors: ValidationErrors = {};

  if (typeof email !== 'string' || !email) {
    errors.email = "Email is required";
  } else {
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Validation failed. Please check the errors below.",
      errors,
      statusCode: 400
    };
  }

  const trimmedEmail = email!.trim().toLowerCase();

  const [rows]: any = await db.query("SELECT id, name FROM users WHERE email=?", [trimmedEmail]);
  
  if (rows.length === 0) {
    return {
      success: false,
      message: "No account found with this email address",
      errors: { email: "This email is not registered" },
      statusCode: 404
    };
  }

  const user = rows[0];

  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetHash = crypto.createHash("sha256").update(resetToken).digest("hex");
  const expire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.query(
    `UPDATE users SET resetPasswordToken=?, resetPasswordExpire=? WHERE id=?`,
    [resetHash, expire, user.id]
  );

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
    to: trimmedEmail,
    subject: "Password Reset Request",
    html: message,
  });

  return {
    success: true,
    message: `Password reset link sent to ${trimmedEmail}`,
    data: { user: { id: user.id, name: user.name, email: trimmedEmail } },
    statusCode: 200
  };
};

/* ------------------- RESET PASSWORD ------------------- */
export const resetPassword = async (
  token: string | undefined,
  password: string | undefined,
  confirmPassword: string | undefined
): Promise<ApiResponse> => {
  const errors: ValidationErrors = {};

  if (typeof token !== 'string' || !token) {
    errors.token = "Reset token is required";
  }

  if (typeof password !== 'string' || !password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(password)) {
    errors.password = "Password must contain uppercase, lowercase, number, and special character (@$!%*?&)";
  }

  if (typeof confirmPassword !== 'string' || !confirmPassword) {
    errors.confirmPassword = "Confirm password is required";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Validation failed. Please check the errors below.",
      errors,
      statusCode: 400
    };
  }

  const trimmedPassword = password!.trim();

  const hashedToken = crypto.createHash("sha256").update(token!).digest("hex");
  const [rows]: any = await db.query(
    `SELECT id, name, email FROM users WHERE resetPasswordToken=? AND resetPasswordExpire > NOW()`,
    [hashedToken]
  );

  if (rows.length === 0) {
    return {
      success: false,
      message: "Invalid or expired reset token",
      errors: { token: "Invalid or expired reset token" },
      statusCode: 400
    };
  }

  const user = rows[0];

  const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
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
export const resendVerification = async (
  email: string | undefined
): Promise<ApiResponse> => {
  const errors: ValidationErrors = {};

  if (typeof email !== 'string' || !email) {
    errors.email = "Email is required";
  } else {
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Validation failed. Please check the errors below.",
      errors,
      statusCode: 400
    };
  }

  const trimmedEmail = email!.trim().toLowerCase();

  const [rows]: any = await db.query("SELECT id, name, isEmailVerified FROM users WHERE email=?", [trimmedEmail]);
  
  if (rows.length === 0) {
    return {
      success: false,
      message: "No account found with this email address",
      errors: { email: "This email is not registered" },
      statusCode: 404
    };
  }

  const user = rows[0];

  if (user.isEmailVerified) {
    return {
      success: false,
      message: "Email already verified. Please login.",
      errors: { email: "This email is already verified" },
      statusCode: 400
    };
  }

  const verificationToken = crypto.randomBytes(20).toString("hex");
  const emailToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
  const expire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

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
    to: trimmedEmail,
    subject: "Resend Email Verification",
    html: message,
  });

  return {
    success: true,
    message: "Verification email sent again. Please check your inbox.",
    data: { user: { id: user.id, name: user.name, email: trimmedEmail } },
    statusCode: 200
  };
};

/* ------------------- REFRESH TOKEN FLOW ------------------- */
export const refreshTokenFlow = async (
  oldRefreshToken: string | undefined
): Promise<ApiResponse> => {
  const errors: ValidationErrors = {};

  if (typeof oldRefreshToken !== 'string' || !oldRefreshToken) {
    errors.refreshToken = "Refresh token is required";
  } else if (oldRefreshToken.trim().length < 10) {
    errors.refreshToken = "Invalid refresh token format";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Validation failed. Please check the errors below.",
      errors,
      statusCode: 400
    };
  }

  const trimmedRefreshToken = oldRefreshToken!.trim();

  const [rows]: any = await db.query(
    `SELECT id, name, email FROM users WHERE refreshToken=? AND refreshTokenExpire > NOW()`,
    [trimmedRefreshToken]
  );

  if (rows.length === 0) {
    return {
      success: false,
      message: "Invalid or expired refresh token. Please login again.",
      errors: { refreshToken: "Invalid or expired refresh token" },
      statusCode: 401
    };
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
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      },
      token: newAccessToken,
      refreshToken: newRefreshToken
    },
    statusCode: 200
  };
};