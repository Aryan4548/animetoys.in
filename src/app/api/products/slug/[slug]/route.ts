import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { jsonError, handleApiError } from "@/lib/apiHelpers";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { slug } = await params;
    const product = await Product.findOne({ slug, status: "published" })
      .populate("brand", "name slug logo")
      .populate("category", "name slug")
      .lean({ virtuals: true });
    if (!product) return jsonError("Product not found.", 404);

    const related = await Product.find({
      status: "published",
      _id: { $ne: product._id },
      $or: [{ category: (product as any).category?._id }, { brand: (product as any).brand?._id }],
    })
      .limit(8)
      .lean({ virtuals: true });

    return NextResponse.json({ product, related });
  } catch (err) {
    return handleApiError(err);
  }
}
