import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Cart, { type ICartItem } from "@/models/Cart";
import Product from "@/models/Product";
import { getSession } from "@/lib/auth";
import { getOrCreateGuestId, GUEST_CART_COOKIE } from "@/lib/guestCart";
import { handleApiError, jsonError } from "@/lib/apiHelpers";
import { getUnitPrice, isWholesaleApplied } from "@/lib/pricing";

const addSchema = z.object({ productId: z.string().min(1), quantity: z.coerce.number().int().min(1).max(20).default(1) });
const updateSchema = z.object({ productId: z.string().min(1), quantity: z.coerce.number().int().min(0).max(20) });

async function findOrCreateCart() {
  const session = await getSession();
  if (session) {
    let cart = await Cart.findOne({ user: session.sub });
    if (!cart) cart = await Cart.create({ user: session.sub, items: [] });
    return { cart, guestId: null as string | null, isNewGuest: false };
  }

  const { guestId, isNew } = await getOrCreateGuestId();
  let cart = await Cart.findOne({ guestId });
  if (!cart) cart = await Cart.create({ guestId, items: [] });
  return { cart, guestId, isNewGuest: isNew };
}

async function serializeCart(cart: InstanceType<typeof Cart>) {
  const productIds = cart.items.map((i: ICartItem) => i.product);
  const products = await Product.find({ _id: { $in: productIds } }).lean({ virtuals: true });
  const byId = new Map(products.map((p: any) => [String(p._id), p]));

  const items = cart.items
    .map((item: ICartItem) => {
      const p = byId.get(String(item.product));
      if (!p) return null;
      return {
        productId: String(p._id),
        name: p.name,
        slug: p.slug,
        image: p.images?.[0],
        price: getUnitPrice(p, item.quantity),
        regularPrice: p.price,
        wholesalePrice: p.wholesalePrice,
        wholesaleMoq: p.wholesaleMoq,
        wholesaleApplied: isWholesaleApplied(p, item.quantity),
        quantity: item.quantity,
        stock: Math.max(0, p.stock - p.reserved),
        isPreorder: p.isPreorder,
      };
    })
    .filter(Boolean);

  return items;
}

export async function GET() {
  try {
    await connectDB();
    const { cart } = await findOrCreateCart();
    const items = await serializeCart(cart);
    return NextResponse.json({ items });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { productId, quantity } = addSchema.parse(body);

    const product = await Product.findById(productId).lean({ virtuals: true });
    if (!product || product.status !== "published") return jsonError("Product not available.", 404);

    const available = Math.max(0, product.stock - product.reserved);
    if (!product.isPreorder && available <= 0) return jsonError("This product is out of stock.", 409);

    const { cart, guestId } = await findOrCreateCart();
    const existing = cart.items.find((i: ICartItem) => String(i.product) === String(productId));

    if (existing) {
      const nextQty = existing.quantity + quantity;
      if (!product.isPreorder && nextQty > available) {
        return jsonError(`Only ${available} left in stock.`, 409);
      }
      existing.quantity = nextQty;
    } else {
      if (!product.isPreorder && quantity > available) {
        return jsonError(`Only ${available} left in stock.`, 409);
      }
      cart.items.push({ product: product._id, quantity, priceAtAdd: getUnitPrice(product, quantity) });
    }

    await cart.save();
    const items = await serializeCart(cart);

    const res = NextResponse.json({ items });
    if (guestId) {
      res.cookies.set(GUEST_CART_COOKIE, guestId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 60,
      });
    }
    return res;
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { productId, quantity } = updateSchema.parse(body);

    const { cart } = await findOrCreateCart();
    const existing = cart.items.find((i: ICartItem) => String(i.product) === String(productId));
    if (!existing) return jsonError("Item not in cart.", 404);

    if (quantity === 0) {
      cart.items = cart.items.filter((i: ICartItem) => String(i.product) !== String(productId)) as typeof cart.items;
    } else {
      const product = await Product.findById(productId).lean({ virtuals: true });
      if (product && !product.isPreorder) {
        const available = Math.max(0, product.stock - product.reserved);
        if (quantity > available) return jsonError(`Only ${available} left in stock.`, 409);
      }
      existing.quantity = quantity;
    }

    await cart.save();
    const items = await serializeCart(cart);
    return NextResponse.json({ items });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) return jsonError("productId is required.", 400);

    const { cart } = await findOrCreateCart();
    cart.items = cart.items.filter((i: ICartItem) => String(i.product) !== String(productId)) as typeof cart.items;
    await cart.save();

    const items = await serializeCart(cart);
    return NextResponse.json({ items });
  } catch (err) {
    return handleApiError(err);
  }
}
