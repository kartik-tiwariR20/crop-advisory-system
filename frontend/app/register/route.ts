import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, location } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required." },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    const res = await fetch(`${backendUrl}/api/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, location }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "Registration failed." },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error("Register proxy error:", error);
    return NextResponse.json(
      { error: "Could not reach the backend. Please try again shortly." },
      { status: 502 }
    );
  }
}
