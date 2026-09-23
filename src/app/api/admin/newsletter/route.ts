import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";
import { handleApiError, isResponse, requireAdmin } from "@/lib/apiHelpers";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ subscribers });
  } catch (err) {
    return handleApiError(err);
  }
}
