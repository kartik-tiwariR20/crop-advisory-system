import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

    const res = await fetch(`${backendUrl}/api/predict/crop/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data.error || "Prediction failed." },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error("Crop recommendation proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Could not reach the recommendation service." },
      { status: 502 }
    );
  }
}
