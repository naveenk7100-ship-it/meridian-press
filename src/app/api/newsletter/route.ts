import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, frequency = "monthly", interests = [] } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "An email address is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    console.log(`[Meridian Dispatch] Subscribed: ${email} | Frequency: ${frequency} | Topics: ${interests.join(", ") || "All"}`);

    return NextResponse.json({
      success: true,
      message: "You are now subscribed to the Meridian Literary & Technical Dispatches. No spam, only deliberate monographs.",
      subscriber: {
        email,
        subscribedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("API /api/newsletter POST error:", error);
    return NextResponse.json(
      { success: false, error: "Subscription could not be processed." },
      { status: 500 }
    );
  }
}
