import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { inventoryAdjustSchema } from "@/lib/validators";
import { adjustStock } from "@/lib/inventory";
import { handleApiError, isResponse, jsonError, requireAdmin } from "@/lib/apiHelpers";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const body = await req.json();
    const data = inventoryAdjustSchema.parse(body);

    try {
      const product = await adjustStock({
        productId: data.productId,
        type: data.type,
        quantityChange: data.quantityChange,
        note: data.note,
        performedBy: session.sub,
      });
      return NextResponse.json({ product });
    } catch (stockErr) {
      return jsonError((stockErr as Error).message, 409);
    }
  } catch (err) {
    return handleApiError(err);
  }
}
