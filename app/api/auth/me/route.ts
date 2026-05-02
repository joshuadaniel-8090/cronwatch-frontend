import { NextResponse } from "next/server";

export async function GET() {
  // Mock authenticated user
  return NextResponse.json({
    id: "user_123",
    email: "jjoshuadaniel1234@gmail.com",
    name: "Joshua Daniel",
    plan: "free",
    telegram_chat_id: "123456789",
    alert_email: "alerts@example.com",
    notify_on_recovery_telegram: true,
    notify_on_recovery_email: true,
    created_at: new Date().toISOString(),
  });
}
