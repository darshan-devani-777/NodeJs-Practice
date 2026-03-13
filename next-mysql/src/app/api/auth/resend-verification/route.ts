import { NextRequest, NextResponse } from "next/server";
import { resendVerification } from "@/app/controllers/authController";

export async function POST(req: NextRequest) {
  try {

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    const response = await resendVerification(email);

    return NextResponse.json(
      {
        success: response.success,
        message: response.message,
      },
      { status: response.statusCode || 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to resend verification email." },
      { status: 500 }
    );
  }
}