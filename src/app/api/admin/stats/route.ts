import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";
import WholesaleApplication from "@/models/WholesaleApplication";
import ContactMessage from "@/models/ContactMessage";
import { handleApiError, isResponse, requireAdmin } from "@/lib/apiHelpers";

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
    });
  } catch (err) {
    return handleApiError(err);
  }
}
