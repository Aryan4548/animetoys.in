import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { handleApiError, isResponse, jsonError, requireAdmin } from "@/lib/apiHelpers";
import { uniqueSlug } from "@/lib/slug";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const { id } = await params;
    const original = await Product.findById(id).lean();
    if (!original) return jsonError("Product not found.", 404);

    const { _id: _origId, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = original as any;

    const name = `${rest.name} (Copy)`;
    const slug = await uniqueSlug(name, async (s) => Product.findOne({ slug: s }).lean());

    let sku = `${rest.sku}-COPY`;
    let n = 2;
    while (await Product.findOne({ sku }).lean()) {
      sku = `${rest.sku}-COPY-${n}`;
      n += 1;
    }

    const duplicate = await Product.create({
      ...rest,
      name,
      slug,
      sku,
      status: "draft",
      stock: 0,
      reserved: 0,
    });

    return NextResponse.json({ product: duplicate }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
