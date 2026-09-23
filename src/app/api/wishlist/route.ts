import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import { handleApiError, isResponse, jsonError, requireUser } from "@/lib/apiHelpers";

const schema = z.object({ productId: z.string().min(1) });

export async function GET() {
  try {
    const session = await requireUser();
    if (isResponse(session)) return session;

    await connectDB();
    const wishlist = await Wishlist.findOne({ user: session.sub }).lean();
    if (!wishlist || wishlist.products.length === 0) return NextResponse.json({ products: [] });

    const products = await Product.find({ _id: { $in: wishlist.products } })
      .populate("brand", "name slug")
      .lean({ virtuals: true });

    return NextResponse.json({ products });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    if (isResponse(session)) return session;

    await connectDB();
    const body = await req.json();
    const { productId } = schema.parse(body);

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: session.sub },
      { $addToSet: { products: productId } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ productIds: wishlist.products });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireUser();
    if (isResponse(session)) return session;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) return jsonError("productId is required.", 400);

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: session.sub },
      { $pull: { products: productId } },
      { new: true }
    );

    return NextResponse.json({ productIds: wishlist?.products || [] });
  } catch (err) {
    return handleApiError(err);
  }
}
