import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/app/controllers/authController";
import { ActivityLog } from "@/app/lib/models/ActivityLog";
import { LoginHistory } from "@/app/lib/models/LoginHistory";

export async function POST(req: NextRequest) {
  const ip =
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("x-real-ip") ||
  "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    const { email, password } = await req.json();
    const result = await loginUser(email, password);

    const userId = result.data?.user?.id ?? null;
    await ActivityLog.create(userId, "LOGIN", "User logged in successfully", ip, userAgent, "SUCCESS");
    await LoginHistory.create(userId, ip, userAgent, "SUCCESS");

    return NextResponse.json(result, { status: result.statusCode || 200 });
  } catch (error: any) {
    await ActivityLog.create(null, "LOGIN", error.message || "Login failed", ip, userAgent, "FAILED");
    await LoginHistory.create(null, ip, userAgent, "FAILED");

    return NextResponse.json(
      { success: false, message: error.message || "Login failed" },
      { status: 400 }
    );
  }
}
