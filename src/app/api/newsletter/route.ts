import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";
import { handleApiError, jsonError } from "@/lib/apiHelpers";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    const limited = rateLimit(`newsletter:${ip}`, 8, 60 * 60 * 1000);
    if (!limited.ok) return jsonError("Too many attempts. Please try again later.", 429);

    const body = await req.json();
    const { email } = schema.parse(body);

    await connectDB();
    await NewsletterSubscriber.updateOne(
      { email },
      { $setOnInsert: { email, isActive: true } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
