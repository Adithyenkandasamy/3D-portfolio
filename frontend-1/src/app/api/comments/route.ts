import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import {
  getDbApprovedComments,
  createVisitorComment,
  getVisitorCommentCount,
} from "@/lib/db";

const commentSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60, "Name cannot exceed 60 characters"),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(1000, "Message cannot exceed 1000 characters"),
});

const COOKIE_SECRET = process.env.ADMIN_PASSWORD || "adithyen_comments_sig_salt_928";
const VISITOR_COOKIE_NAME = "visitor_comment_id";

function getIpHash(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const rawIp = forwarded ? forwarded.split(",")[0].trim() : realIp || "127.0.0.1";
  return crypto.createHash("sha256").update(rawIp + COOKIE_SECRET).digest("hex");
}

function getOrGenerateVisitorId(req: NextRequest): { id: string; isNew: boolean } {
  const existingCookie = req.cookies.get(VISITOR_COOKIE_NAME)?.value;
  if (existingCookie && existingCookie.includes(".")) {
    const [id, sig] = existingCookie.split(".");
    const expectedSig = crypto.createHmac("sha256", COOKIE_SECRET).update(id).digest("hex").slice(0, 16);
    if (sig === expectedSig) {
      return { id, isNew: false };
    }
  }

  const newId = crypto.randomUUID();
  return { id: newId, isNew: true };
}

function signVisitorId(id: string): string {
  const sig = crypto.createHmac("sha256", COOKIE_SECRET).update(id).digest("hex").slice(0, 16);
  return `${id}.${sig}`;
}

export async function GET() {
  try {
    const comments = await getDbApprovedComments();
    return NextResponse.json({ ok: true, comments }, { status: 200 });
  } catch (err) {
    console.error("[Comments API] GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = commentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const ipHash = getIpHash(req);
    const { id: visitorId, isNew } = getOrGenerateVisitorId(req);

    // Enforce 2-comment limit policy
    const existingCount = await getVisitorCommentCount(visitorId, ipHash);
    if (existingCount >= 2) {
      return NextResponse.json(
        {
          ok: false,
          error: "You have reached the maximum limit of 2 comments. Thank you for connecting!",
          code: "LIMIT_REACHED",
        },
        { status: 429 }
      );
    }

    // Save as pending moderation
    const saved = await createVisitorComment({
      name: result.data.name,
      message: result.data.message,
      visitorId,
      ipHash,
    });

    if (!saved) {
      return NextResponse.json(
        { ok: false, error: "Database unavailable, please try again shortly." },
        { status: 500 }
      );
    }

    const response = NextResponse.json(
      {
        ok: true,
        message: "Thank you! Your note has been submitted for review and will appear once approved.",
      },
      { status: 201 }
    );

    // Set signed visitor cookie with 1 year expiration
    if (isNew) {
      response.cookies.set(VISITOR_COOKIE_NAME, signVisitorId(visitorId), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60,
        path: "/",
      });
    }

    return response;
  } catch (err) {
    console.error("[Comments API] POST error:", err);
    return NextResponse.json(
      { ok: false, error: "An unexpected error occurred while saving your note." },
      { status: 500 }
    );
  }
}
