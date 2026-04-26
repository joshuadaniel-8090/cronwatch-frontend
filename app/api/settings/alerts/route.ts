import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log("Saving alert settings:", body);
    
    // In a real implementation:
    // Update user preferences in database (e.g. Supabase)
    
    return NextResponse.json({ message: "Settings saved successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
