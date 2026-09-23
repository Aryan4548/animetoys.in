import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order, { type IOrderItem } from "@/models/Order";
import { orderStatusUpdateSchema } from "@/lib/validators";
import { handleApiError, isResponse, jsonError, requireAdmin, requireUser } from "@/lib/apiHelpers";
import { restoreStockForOrder } from "@/lib/inventory";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireUser();
    if (isResponse(session)) return session;

    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id).populate("user", "name email").lean();
    if (!order) return jsonError("Order not found.", 404);

    if (session.role !== "admin" && String((order as any).user?._id || (order as any).user) !== session.sub) {
      return jsonError("You do not have access to this order.", 403);
    }

    return NextResponse.json({ order });
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
    const data = orderStatusUpdateSchema.parse(body);

    const order = await Order.findById(id);
    if (!order) return jsonError("Order not found.", 404);

    const terminalStatuses = ["CANCELLED", "REFUNDED", "RETURNED"];
    const restockStatuses = ["CANCELLED", "RETURNED"];

    if (data.status && data.status !== order.status) {
      if (terminalStatuses.includes(order.status)) {
        return jsonError(`This order is already ${order.status.toLowerCase()} and cannot be changed further.`, 409);
      }

      if (restockStatuses.includes(data.status) && !order.stockRestored) {
        await restoreStockForOrder(
          order.items.map((i: IOrderItem) => ({ productId: i.product, quantity: i.quantity, isPreorder: i.isPreorder })),
          order._id,
          data.status === "RETURNED" ? "RETURN" : "CANCELLATION"
        );
        order.stockRestored = true;
        if (data.status === "CANCELLED") order.cancelledAt = new Date();
      }

      order.status = data.status;
      order.statusHistory.push({ status: data.status, note: data.note, changedAt: new Date() });

      if (data.status === "DELIVERED") order.paymentStatus = order.paymentStatus === "PENDING" && order.paymentMethod === "COD" ? "PAID" : order.paymentStatus;
      if (data.status === "REFUNDED") order.paymentStatus = "REFUNDED";
    }

    if (data.trackingNumber !== undefined) order.trackingNumber = data.trackingNumber;
    if (data.courier !== undefined) order.courier = data.courier;
    if (data.note && !data.status) order.notes.push(data.note);

    await order.save();

    return NextResponse.json({ order });
  } catch (err) {
    return handleApiError(err);
  }
}
