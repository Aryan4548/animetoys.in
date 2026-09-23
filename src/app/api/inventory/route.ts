import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { handleApiError, isResponse, requireAdmin } from "@/lib/apiHelpers";
import { escapeRegex } from "@/lib/regex";
import { computeInventoryStatus } from "@/lib/productStatus";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const statusFilter = searchParams.get("status");

    const filter: Record<string, unknown> = { status: { $ne: "archived" } };
    if (q) {
      const safe = escapeRegex(q);
      filter.$or = [{ name: { $regex: safe, $options: "i" } }, { sku: { $regex: safe, $options: "i" } }];
    }

    const rawProducts = await Product.find(filter).sort({ name: 1 }).lean();

    // `inventoryStatus`/`available` are Mongoose virtuals that don't come
    // through `.lean({ virtuals: true })` reliably in this Mongoose
    // version, which was silently breaking both the status filter below
    // and the admin inventory table's status column. Compute them here
    // instead of trusting the virtual.
    let products = rawProducts.map((p: any) => ({
      ...p,
      available: Math.max(0, p.stock - p.reserved),
      inventoryStatus: computeInventoryStatus(p.stock, p.reserved, p.lowStockThreshold, p.isPreorder),
    }));

    if (statusFilter) {
      products = products.filter((p) => p.inventoryStatus === statusFilter);
    }

    return NextResponse.json({ products });
  } catch (err) {
    return handleApiError(err);
  }
}
