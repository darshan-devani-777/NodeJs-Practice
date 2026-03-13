import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateJWT = (id: number): string => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set");
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h", 
  });
};

export const generateRefreshToken = (): { refreshToken: string; refreshTokenExpire: Date } => {
  const refreshToken = crypto.randomBytes(40).toString("hex");
  const refreshTokenExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  return { refreshToken, refreshTokenExpire };
};