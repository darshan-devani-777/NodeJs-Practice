import { NextRequest, NextResponse } from "next/server";
import { refreshTokenFlow } from "../../../controllers/authController";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Refresh token is required." },
        { status: 400 }
      );
    }

    const result = await refreshTokenFlow(refreshToken);

    return NextResponse.json(result, { status: result.statusCode || 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error." },
      { status: 500 }
    );
  }
}