import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cart, { type ICartItem } from "@/models/Cart";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { checkoutSchema } from "@/lib/validators";
import { handleApiError, isResponse, jsonError, requireAdmin, requireUser } from "@/lib/apiHelpers";
import { reserveStockForOrder } from "@/lib/inventory";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { escapeRegex } from "@/lib/regex";
import { getUnitPrice, isWholesaleApplied } from "@/lib/pricing";

const SHIPPING_FEE = 0; // flat free shipping for phase 1; wire coupons/shipping rules in phase 2

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ATU-${ts}-${rand}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser();
    if (isResponse(session)) return session;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const admin = searchParams.get("admin") === "true";

    const filter: Record<string, unknown> = {};

    if (admin) {
      const adminSession = await requireAdmin();
      if (isResponse(adminSession)) return adminSession;
      if (searchParams.get("status")) filter.status = searchParams.get("status");
      if (searchParams.get("q")) {
        filter.orderNumber = { $regex: escapeRegex(searchParams.get("q") as string), $options: "i" };
      }
    } else {
      filter.user = session.sub;
    }

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)));

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json({ orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    if (isResponse(session)) return session;

    const ip = clientIp(req.headers);
    const limited = rateLimit(`order:${session.sub}:${ip}`, 10, 10 * 60 * 1000);
    if (!limited.ok) return jsonError("Too many order attempts. Please try again shortly.", 429);

    await connectDB();
    const body = await req.json();
    const data = checkoutSchema.parse(body);

    const cart = await Cart.findOne({ user: session.sub });
    if (!cart || cart.items.length === 0) return jsonError("Your cart is empty.", 400);

    const productIds = cart.items.map((i: ICartItem) => i.product);
    const products = await Product.find({ _id: { $in: productIds } }).lean({ virtuals: true });
    const byId = new Map(products.map((p: any) => [String(p._id), p]));

    const orderItems = [];
    for (const item of cart.items) {
      const p = byId.get(String(item.product));
      if (!p || p.status !== "published") {
        return jsonError("One of the items in your cart is no longer available. Please review your cart.", 409);
      }
      const available = Math.max(0, p.stock - p.reserved);
      if (!p.isPreorder && item.quantity > available) {
        return jsonError(`"${p.name}" only has ${available} in stock. Please update your cart.`, 409);
      }
      orderItems.push({
        product: p._id,
        name: p.name,
        sku: p.sku,
        image: p.images?.[0],
        price: getUnitPrice(p, item.quantity),
        priceType: isWholesaleApplied(p, item.quantity) ? "wholesale" : "retail",
        quantity: item.quantity,
        isPreorder: p.isPreorder,
      });
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = subtotal + SHIPPING_FEE;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: session.sub,
      items: orderItems,
      subtotal,
      shippingFee: SHIPPING_FEE,
      discount: 0,
      total,
      status: "PENDING",
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === "COD" ? "PENDING" : "PENDING",
      statusHistory: [{ status: "PENDING", changedAt: new Date() }],
    });

    try {
      await reserveStockForOrder(
        orderItems.map((i) => ({ productId: i.product, quantity: i.quantity, isPreorder: i.isPreorder })),
        order._id
      );
    } catch (stockErr) {
      order.status = "CANCELLED";
      order.notes.push("Auto-cancelled: insufficient stock at fulfillment time.");
      order.statusHistory.push({ status: "CANCELLED", note: "Insufficient stock", changedAt: new Date() });
      await order.save();
      return jsonError((stockErr as Error).message || "Insufficient stock for one or more items.", 409);
    }

    order.status = "CONFIRMED";
    order.statusHistory.push({ status: "CONFIRMED", changedAt: new Date() });
    await order.save();

    cart.items = [];
    await cart.save();

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
