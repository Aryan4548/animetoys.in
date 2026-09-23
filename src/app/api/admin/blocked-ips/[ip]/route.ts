import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BlockedIp from "@/models/BlockedIp";
import { handleApiError, isResponse, requireAdmin } from "@/lib/apiHelpers";

export async function DELETE(req: NextRequest, { params }: { params: { ip: string } }) {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const ip = decodeURIComponent(params.ip);
    await BlockedIp.deleteOne({ ip });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
