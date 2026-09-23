import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";
import WholesaleApplication from "@/models/WholesaleApplication";
import ContactMessage from "@/models/ContactMessage";
import VisitorSession from "@/models/VisitorSession";
import Cart from "@/models/Cart";
import { handleApiError, isResponse, requireAdmin } from "@/lib/apiHelpers";

// Kept in sync with /api/admin/visitors' definition of "online now".
const ONLINE_WINDOW_MS = 60 * 1000;
// Kept in sync with /api/admin/abandoned-carts' default window.
const ABANDONED_CART_WINDOW_MS = 60 * 60 * 1000;

export async function GET() {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();

    const [
      totalProducts,
      publishedProducts,
      lowStockCount,
      outOfStockCount,
      totalOrders,
      pendingOrders,
      totalCustomers,
      pendingWholesale,
      unreadMessages,
      revenueAgg,
      recentOrders,
      onlineVisitorCount,
      abandonedCartCount,
    ] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ status: "published" }),
      Product.countDocuments({
        status: "published",
        isPreorder: false,
        $expr: { $and: [{ $gt: [{ $subtract: ["$stock", "$reserved"] }, 0] }, { $lte: [{ $subtract: ["$stock", "$reserved"] }, "$lowStockThreshold"] }] },
      }),
      Product.countDocuments({ status: "published", isPreorder: false, $expr: { $lte: [{ $subtract: ["$stock", "$reserved"] }, 0] } }),
      Order.countDocuments({}),
      Order.countDocuments({ status: { $in: ["PENDING", "CONFIRMED", "PROCESSING"] } }),
      User.countDocuments({ role: "customer" }),
      WholesaleApplication.countDocuments({ status: "PENDING" }),
      ContactMessage.countDocuments({ isRead: false }),
      Order.aggregate([
        { $match: { status: { $nin: ["CANCELLED", "REFUNDED"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find({}).sort({ createdAt: -1 }).limit(5).select("orderNumber status total createdAt").lean(),
      VisitorSession.countDocuments({ lastSeenAt: { $gte: new Date(Date.now() - ONLINE_WINDOW_MS) } }),
      Cart.countDocuments({
        "items.0": { $exists: true },
        updatedAt: { $lte: new Date(Date.now() - ABANDONED_CART_WINDOW_MS) },
      }),
    ]);

    return NextResponse.json({
      totalProducts,
      publishedProducts,
      lowStockCount,
      outOfStockCount,
      totalOrders,
      pendingOrders,
      totalCustomers,
      pendingWholesale,
      unreadMessages,
      totalRevenue: revenueAgg[0]?.total || 0,
      recentOrders,
      onlineVisitorCount,
      abandonedCartCount,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
