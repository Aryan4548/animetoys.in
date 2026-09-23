import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { handleApiError, isResponse, requireAdmin } from "@/lib/apiHelpers";
import { escapeRegex } from "@/lib/regex";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    const filter: Record<string, unknown> = { role: "customer" };
    if (q) {
      const safe = escapeRegex(q);
      filter.$or = [{ name: { $regex: safe, $options: "i" } }, { email: { $regex: safe, $options: "i" } }];
    }

    const customers = await User.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    return NextResponse.json({ customers });
  } catch (err) {
    return handleApiError(err);
  }
}
