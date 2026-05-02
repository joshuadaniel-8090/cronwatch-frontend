import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Mock pings history
  const pings = Array.from({ length: 20 }).map((_, i) => ({
    id: `ping_${i}`,
    monitor_id: params.id,
    status: i === 5 ? "recovery" : i > 5 ? (Math.random() > 0.8 ? "late" : "success") : "success",
    received_at: new Date(Date.now() - i * 60000).toISOString(),
    source_ip: "127.0.0.1",
    user_agent: "Cronwatch/1.0",
  }));

  return NextResponse.json(pings);
}
