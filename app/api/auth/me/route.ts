import { NextResponse } from "next/server";

export async function GET() {
  // Mock authenticated user
  return NextResponse.json({
    id: "user_123",
    email: "jjoshuadaniel1234@gmail.com",
    name: "Joshua Daniel",
    created_at: new Date().toISOString(),
  });
}
