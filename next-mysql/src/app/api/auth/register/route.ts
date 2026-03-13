import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/app/controllers/authController";
import { ActivityLog } from "@/app/lib/models/ActivityLog";

export async function POST(req: NextRequest) {
  const ip =
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("x-real-ip") ||
  "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    const { name, email, password } = await req.json();
    const result = await registerUser(name, email, password);

    await ActivityLog.create(null, "REGISTER", `User registered: ${email}`, ip, userAgent, "SUCCESS");

    return NextResponse.json(result, { status: result.statusCode || 201 });
  } catch (error: any) {
    await ActivityLog.create(null, "REGISTER", error.message || "Registration failed", ip, userAgent, "FAILED");
    return NextResponse.json(
      { success: false, message: error.message || "Registration failed" },
      { status: 400 }
    );
  }
}
