import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Brand from "@/models/Brand";
import { brandSchema } from "@/lib/validators";
import { handleApiError, isResponse, requireAdmin } from "@/lib/apiHelpers";
import { uniqueSlug } from "@/lib/slug";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filter: Record<string, unknown> = {};
    if (searchParams.get("admin") !== "true") filter.isActive = true;

    const brands = await Brand.find(filter).sort({ name: 1 }).lean();
    return NextResponse.json({ brands });
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
    const data = brandSchema.parse(body);

    const slug = await uniqueSlug(data.slug || data.name, async (s) => Brand.findOne({ slug: s }).lean());
    const brand = await Brand.create({ ...data, slug });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
