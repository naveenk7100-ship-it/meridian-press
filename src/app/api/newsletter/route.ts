import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/repositories/newsletter-repo";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, frequency = "monthly", interests = [] } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "An email address is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const validFrequency = frequency === "quarterly" ? "quarterly" : "monthly";
    const validInterests = Array.isArray(interests) ? interests : [];

    const { subscriber, isNew } = await addSubscriber(
      email.trim(),
      validFrequency,
      validInterests
    );

    const message = isNew
      ? "You are now subscribed to the Meridian Literary & Technical Dispatches. No spam, only deliberate monographs."
      : "Your subscription preference has been recognized. You will continue receiving our dispatches.";

    return NextResponse.json({
      success: true,
      message,
      subscriber: {
        email: subscriber.email,
        frequency: subscriber.frequency,
        subscribedAt: subscriber.createdAt,
      },
    });
  } catch (error) {
    console.error("API /api/newsletter POST error:", error);
    return NextResponse.json(
      { success: false, error: "Subscription could not be processed. Please try again." },
      { status: 500 }
    );
  }
}
