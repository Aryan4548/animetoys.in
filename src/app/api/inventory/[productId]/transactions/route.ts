import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import InventoryTransaction from "@/models/InventoryTransaction";
import { handleApiError, isResponse, requireAdmin } from "@/lib/apiHelpers";

interface Params {
  params: Promise<{ productId: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const { productId } = await params;
    const transactions = await InventoryTransaction.find({ product: productId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("performedBy", "name")
      .lean();

    return NextResponse.json({ transactions });
  } catch (err) {
    return handleApiError(err);
  }
}
