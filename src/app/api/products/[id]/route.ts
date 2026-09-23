import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { productSchema } from "@/lib/validators";
import { handleApiError, isResponse, jsonError, requireAdmin } from "@/lib/apiHelpers";
import { uniqueSlug } from "@/lib/slug";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id)
      .populate("brand", "name slug")
      .populate("category", "name slug")
      .lean({ virtuals: true });
    if (!product) return jsonError("Product not found.", 404);
    return NextResponse.json({ product });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const data = productSchema.partial().parse(body);

    const existing = await Product.findById(id);
    if (!existing) return jsonError("Product not found.", 404);

    if (data.sku && data.sku.toUpperCase() !== existing.sku) {
      const skuExists = await Product.findOne({ sku: data.sku.toUpperCase(), _id: { $ne: id } }).lean();
      if (skuExists) return jsonError("A product with this SKU already exists.", 409);
    }

    let slug = existing.slug;
    if (data.slug || (data.name && data.name !== existing.name)) {
      slug = await uniqueSlug(data.slug || data.name || existing.name, async (s) =>
        Product.findOne({ slug: s, _id: { $ne: id } }).lean()
      );
    }

    Object.assign(existing, data, { slug });
    await existing.save();

    return NextResponse.json({ product: existing });
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
    const product = await Product.findByIdAndDelete(id);
    if (!product) return jsonError("Product not found.", 404);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
