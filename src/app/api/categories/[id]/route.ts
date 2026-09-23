import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { categorySchema } from "@/lib/validators";
import { handleApiError, isResponse, jsonError, requireAdmin } from "@/lib/apiHelpers";
import { uniqueSlug } from "@/lib/slug";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const data = categorySchema.partial().parse(body);

    const existing = await Category.findById(id);
    if (!existing) return jsonError("Category not found.", 404);

    let slug = existing.slug;
    if (data.slug || (data.name && data.name !== existing.name)) {
      slug = await uniqueSlug(data.slug || data.name || existing.name, async (s) =>
        Category.findOne({ slug: s, _id: { $ne: id } }).lean()
      );
    }

    Object.assign(existing, data, { slug });
    await existing.save();

    return NextResponse.json({ category: existing });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const { id } = await params;

    const inUse = await Product.countDocuments({ category: id });
    if (inUse > 0) {
      return jsonError(`Cannot delete: ${inUse} product(s) still use this category.`, 409);
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) return jsonError("Category not found.", 404);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
