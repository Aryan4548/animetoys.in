import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import BlockedIp from "@/models/BlockedIp";
import { handleApiError, isResponse, requireAdmin } from "@/lib/apiHelpers";

const blockSchema = z.object({
  ip: z.string().trim().min(3, "Enter an IP address").max(64),
  reason: z.string().trim().max(200).optional(),
});

export async function GET() {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const blockedIps = await BlockedIp.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ blockedIps });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const body = await req.json();
    const data = blockSchema.parse(body);

    // Upsert — blocking an already-blocked IP again just updates the
    // reason/blocker instead of erroring on the unique index.
    const blocked = await BlockedIp.findOneAndUpdate(
      { ip: data.ip },
      { ip: data.ip, reason: data.reason, blockedByName: session.name },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ blockedIp: blocked }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
