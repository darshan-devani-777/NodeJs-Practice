import { NextRequest, NextResponse } from "next/server";
import { forgotPassword } from "@/app/controllers/authController";
import { ActivityLog } from "@/app/lib/models/ActivityLog";

export async function POST(req: NextRequest) {
  const ip =
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("x-real-ip") ||
  "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    const { email } = await req.json();
    const result = await forgotPassword(email);

    await ActivityLog.create(null, "FORGOT_PASSWORD", `Password reset email sent to ${email}`, ip, userAgent, "SUCCESS");

    return NextResponse.json(result, { status: result.statusCode || 200 });
  } catch (error: any) {
    await ActivityLog.create(null, "FORGOT_PASSWORD", error.message || "Forgot password failed", ip, userAgent, "FAILED");
    return NextResponse.json(
      { success: false, message: error.message || "Request failed" },
      { status: 400 }
    );
  }
}
