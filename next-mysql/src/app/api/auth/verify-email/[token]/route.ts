import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/app/lib/db";
import { ActivityLog } from "@/app/lib/models/ActivityLog";

export async function GET(
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

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification token is missing. Please use the link sent to your email."
        },
        { status: 400 }
      );
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const [rows]: any = await db.query(
      `SELECT * FROM users 
       WHERE emailVerificationToken = ? 
       AND emailVerificationExpire > NOW()`,
      [hashedToken]
    );

    if (rows.length === 0) {

      await ActivityLog.create(
        null,
        "EMAIL_VERIFY",
        "Invalid or expired verification token",
        ip,
        userAgent,
        "FAILED"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "This verification link is invalid or has expired. Please request a new verification email to activate your account."
        },
        { status: 400 }
      );
    }

    const user = rows[0];

    await db.query(
      `UPDATE users 
       SET isEmailVerified = 1,
       emailVerificationToken = NULL,
       emailVerificationExpire = NULL
       WHERE id = ?`,
      [user.id]
    );

    await ActivityLog.create(
      user.id,
      "EMAIL_VERIFY",
      `Email verified successfully for ${user.email}`,
      ip,
      userAgent,
      "SUCCESS"
    );

    return NextResponse.json({
      success: true,
      message:
        "Your email address has been verified successfully. You can now log in to your account."
    });

  } catch (error: any) {

    await ActivityLog.create(
      null,
      "EMAIL_VERIFY",
      "Email verification failed due to server error",
      ip,
      userAgent,
      "FAILED"
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while verifying your email. Please try again later or request a new verification link."
      },
      { status: 500 }
    );
  }
}