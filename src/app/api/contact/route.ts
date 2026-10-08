import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, topic, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required." },
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

    // Process inquiry (e.g. logging, queueing or sending notification)
    console.log(`[Meridian Contact] From: ${name} <${email}> | Topic: ${topic || "General"} | Subject: ${subject || "No Subject"}`);
    console.log(`[Message]: ${message}`);

    return NextResponse.json({
      success: true,
      message: "Your inquiry has been received by the editorial team. We typically respond within two business days.",
      referenceId: `INQ-${Date.now().toString(36).toUpperCase()}`,
    });
  } catch (error) {
    console.error("API /api/contact POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process inquiry. Please try again." },
      { status: 500 }
    );
  }
}
