import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  // In a real app we'd fetch from DB. For now, mock it.
  return NextResponse.json({
    id,
    name: "Production API",
    slug: "prod-api",
    status: "healthy",
    interval_seconds: 60,
    grace_seconds: 30,
    last_ping_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    token: "tok_abc123",
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ message: "Monitor deleted" });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  return NextResponse.json({ ...body, id: params.id });
}
