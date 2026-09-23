import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { handleApiError, isResponse, requireAdmin } from "@/lib/apiHelpers";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5).max(3000),
});

export async function GET() {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ messages });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    const limited = rateLimit(`contact:${ip}`, 8, 60 * 60 * 1000);
    if (!limited.ok) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });

    await connectDB();
    const body = await req.json();
    const data = schema.parse(body);

    const message = await ContactMessage.create(data);
    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
