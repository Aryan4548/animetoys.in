import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import VisitorSession from "@/models/VisitorSession";
import { handleApiError, isResponse, requireAdmin } from "@/lib/apiHelpers";

// "Online now" = pinged within this window. Comfortably above the ~20s
// heartbeat interval (see VisitorHeartbeat.tsx) so a visitor doesn't flicker
// offline between pings, but tight enough that someone who closed the tab
// drops off within a minute.
const ONLINE_WINDOW_MS = 60 * 1000;

export async function GET() {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const since = new Date(Date.now() - ONLINE_WINDOW_MS);
    const visitors = await VisitorSession.find({ lastSeenAt: { $gte: since } })
      .sort({ lastSeenAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({ count: visitors.length, visitors });
  } catch (err) {
    return handleApiError(err);
  }
}
