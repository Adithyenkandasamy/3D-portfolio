import { NextRequest, NextResponse } from "next/server";
import { saveContactMessage } from "@/lib/db";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().optional().default(""),
  message: z.string().min(1, "Message is required"),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = ContactSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid contact form submission", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const saved = await saveContactMessage(parsed.data);

    return NextResponse.json({
      success: true,
      message: "Message received successfully",
      savedToDatabase: saved,
    });
  } catch (err) {
    console.error("Failed to process contact form submission:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
