import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { categorySchema } from "@/lib/validators";
import { handleApiError, isResponse, requireAdmin } from "@/lib/apiHelpers";
import { uniqueSlug } from "@/lib/slug";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filter: Record<string, unknown> = {};
    if (searchParams.get("admin") !== "true") filter.isActive = true;
    if (searchParams.get("featured") === "true") filter.featured = true;

    const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
    return NextResponse.json({ categories });
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
    const data = categorySchema.parse(body);

    const slug = await uniqueSlug(data.slug || data.name, async (s) => Category.findOne({ slug: s }).lean());
    const category = await Category.create({ ...data, slug });

    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
