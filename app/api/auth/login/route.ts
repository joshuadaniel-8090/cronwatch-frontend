import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Login attempt:", body.email);
    
    // Mock login - always succeeds for any email/password
    return NextResponse.json({
      access_token: "mock_token_" + Math.random().toString(36).substr(2),
      user: {
        id: "user_123",
        email: body.email,
        name: body.email.split('@')[0],
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
