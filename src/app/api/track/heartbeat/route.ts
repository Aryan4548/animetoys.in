import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import VisitorSession from "@/models/VisitorSession";
import { getSession } from "@/lib/auth";
import { clientIp } from "@/lib/rateLimit";

// Public, unauthenticated — called by every visitor's browser (see
// components/providers/VisitorHeartbeat.tsx, mounted in the storefront
// layout) roughly every 20s. Powers "who's currently on the site" in
// /admin/visitors. Never lets a tracking failure break the page it's
// called from — always resolves 200.
const VISITOR_COOKIE = "atu_visitor_id";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year — just an anonymous id, not sensitive

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let visitorId = req.cookies.get(VISITOR_COOKIE)?.value;
    const isNewVisitor = !visitorId;
    if (!visitorId) visitorId = crypto.randomUUID();

    const [session, body] = await Promise.all([
      getSession(),
      req.json().catch(() => ({})),
    ]);
    const ip = clientIp(req.headers);
    const path = typeof body?.path === "string" ? body.path.slice(0, 200) : "/";
    const now = new Date();

    await VisitorSession.findOneAndUpdate(
      { visitorId },
      {
        $set: {
          ip,
          path,
          userId: session?.sub || null,
          name: session?.name || null,
          lastSeenAt: now,
        },
        $setOnInsert: { firstSeenAt: now },
      },
      { upsert: true }
    );

    const res = NextResponse.json({ ok: true });
    if (isNewVisitor) {
      res.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: VISITOR_COOKIE_MAX_AGE,
        secure: process.env.NODE_ENV === "production",
      });
    }
    return res;
  } catch (err) {
    console.error("heartbeat error:", err);
    // Tracking is best-effort — never surface this as a page-breaking error.
    return NextResponse.json({ ok: false });
  }
}
