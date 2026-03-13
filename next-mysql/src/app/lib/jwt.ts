import jwt from "jsonwebtoken";

export const generateJWT = (id: number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};