import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order, { type IOrderItem } from "@/models/Order";
import { handleApiError, isResponse, jsonError, requireUser } from "@/lib/apiHelpers";
import { restoreStockForOrder } from "@/lib/inventory";

interface Params {
  params: Promise<{ id: string }>;
}

const CANCELLABLE_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING"];

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireUser();
    if (isResponse(session)) return session;

    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id);
    if (!order) return jsonError("Order not found.", 404);

    if (session.role !== "admin" && String(order.user) !== session.sub) {
      return jsonError("You do not have access to this order.", 403);
    }

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return jsonError(`Orders in "${order.status}" status can no longer be cancelled by the customer. Please contact support.`, 409);
    }

    if (!order.stockRestored) {
      await restoreStockForOrder(
        order.items.map((i: IOrderItem) => ({ productId: i.product, quantity: i.quantity, isPreorder: i.isPreorder })),
        order._id,
        "CANCELLATION"
      );
      order.stockRestored = true;
    }

    order.status = "CANCELLED";
    order.cancelledAt = new Date();
    order.statusHistory.push({ status: "CANCELLED", note: "Cancelled by customer", changedAt: new Date() });
    await order.save();

    return NextResponse.json({ order });
  } catch (err) {
    return handleApiError(err);
  }
}
