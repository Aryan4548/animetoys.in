import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import { handleApiError, isResponse, requireAdmin } from "@/lib/apiHelpers";

// A cart counts as "abandoned" once it has items but hasn't been touched
// (added to, or checked out from) in this long. Checkout empties `items`
// on success (see /api/orders POST), so anything non-empty here is, by
// definition, not yet converted to an order — just possibly still being
// actively shopped if it's very recent, which the default 1-hour window
// filters out.
const DEFAULT_ABANDONED_AFTER_HOURS = 1;

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const hours = Math.max(0, Number(searchParams.get("hours")) || DEFAULT_ABANDONED_AFTER_HOURS);
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const carts = await Cart.find({
      "items.0": { $exists: true },
      updatedAt: { $lte: since },
    })
      .populate("user", "name email phone")
      .populate("items.product", "name slug images price")
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();

    const rows = carts.map((cart: any) => ({
      _id: cart._id,
      user: cart.user ? { name: cart.user.name, email: cart.user.email, phone: cart.user.phone } : null,
      guestId: cart.guestId,
      updatedAt: cart.updatedAt,
      items: cart.items
        .filter((i: any) => i.product)
        .map((i: any) => ({
          name: i.product.name,
          slug: i.product.slug,
          image: i.product.images?.[0],
          quantity: i.quantity,
          priceAtAdd: i.priceAtAdd,
        })),
      itemCount: cart.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
      value: cart.items.reduce((sum: number, i: any) => sum + i.priceAtAdd * i.quantity, 0),
    }));

    const totalValue = rows.reduce((sum, r) => sum + r.value, 0);

    return NextResponse.json({ carts: rows, count: rows.length, totalValue });
  } catch (err) {
    return handleApiError(err);
  }
}
