import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "@/app/controllers/authController";
import { ActivityLog } from "@/app/lib/models/ActivityLog";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const ip =
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("x-real-ip") ||
  "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    const { token } = await params;
    const { password, confirmPassword } = await req.json();

    const result = await resetPassword(token, password, confirmPassword);

    let userId = null;
    let logMessage = "Password reset failed";

    if (result.success) {
      const hashedToken = require("crypto").createHash("sha256").update(token).digest("hex");
      const [rows]: any = await require("@/app/lib/db").db.query(
        `SELECT id, email FROM users WHERE resetPasswordToken=? AND resetPasswordExpire > NOW()`,
        [hashedToken]
      );
      
      userId = rows[0]?.id || null;
      logMessage = `Password reset successful for ${rows[0]?.email || 'user'}`;
    }

    await ActivityLog.create(
      userId,                    
      "RESET_PASSWORD",          
      logMessage,                
      ip,                        
      userAgent,                
      result.success ? "SUCCESS" : "FAILED" 
    );

    return NextResponse.json(result, { status: result.statusCode || 200 });
  } catch (error: any) {
    await ActivityLog.create(
      null,
      "RESET_PASSWORD",
      error.message || "Password reset failed",
      ip,
      userAgent,
      "FAILED"
    );
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Password reset failed. Please try again." 
      },
      { status: 400 }
    );
  }
}
