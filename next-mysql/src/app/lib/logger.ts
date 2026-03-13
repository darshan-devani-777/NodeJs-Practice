import { db } from "./db";

export const logActivity = async ({
  user,
  action,
  description,
  req,
  status,
}: any) => {
  const ip =
    req.headers.get("x-forwarded-for") ||
    "unknown";

  const userAgent = req.headers.get("user-agent") || "unknown";

  await db.query(
    `INSERT INTO activity_logs
     (user_id,action,description,ip,user_agent,status)
     VALUES (?,?,?,?,?,?)`,
    [user, action, description, ip, userAgent, status]
  );
};