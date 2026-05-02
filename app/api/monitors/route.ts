import { NextResponse } from "next/server";

// Mock database in memory (will reset on server restart)
let monitors = [
  {
    id: "mon_1",
    name: "Production API",
    slug: "prod-api",
    status: "healthy",
    interval_seconds: 60,
    grace_seconds: 30,
    last_ping_at: new Date().toISOString(),
    last_ping_status: "success",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    token: "tok_abc123",
  },
  {
    id: "mon_2",
    name: "Backup Worker",
    slug: "backup-worker",
    status: "failing",
    interval_seconds: 3600,
    grace_seconds: 600,
    last_ping_at: new Date(Date.now() - 7200000).toISOString(),
    last_ping_status: "late",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    token: "tok_xyz789",
  },
  {
    id: "mon_3",
    name: "Database Sync",
    slug: "db-sync",
    status: "recovered",
    interval_seconds: 300,
    grace_seconds: 60,
    last_ping_at: new Date(Date.now() - 120000).toISOString(),
    last_ping_status: "recovery",
    created_at: new Date(Date.now() - 432000000).toISOString(),
    token: "tok_db123",
  }
];

export async function GET() {
  return NextResponse.json(monitors);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newMonitor = {
      id: `mon_${Math.random().toString(36).substr(2, 9)}`,
      name: body.name || "Untitled Monitor",
      slug: (body.name || "untitled").toLowerCase().replace(/\s+/g, '-'),
      status: "pending",
      interval_seconds: body.interval_seconds || 300,
      grace_seconds: body.grace_seconds || 60,
      last_ping_at: null,
      created_at: new Date().toISOString(),
      token: `tok_${Math.random().toString(36).substr(2, 12)}`,
      ...body
    };
    monitors.push(newMonitor);
    return NextResponse.json(newMonitor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create monitor" }, { status: 400 });
  }
}
