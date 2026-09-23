import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { productSchema } from "@/lib/validators";
import { handleApiError, isResponse, jsonError, requireAdmin } from "@/lib/apiHelpers";
import { uniqueSlug } from "@/lib/slug";
import { buildProductSearchOr } from "@/lib/search";
import { newArrivalSince } from "@/lib/newArrival";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(60, Math.max(1, Number(searchParams.get("limit") || 20)));
    const admin = searchParams.get("admin") === "true";

    const filter: Record<string, unknown> = {};

    if (admin) {
      const session = await requireAdmin();
      if (isResponse(session)) return session;
      if (searchParams.get("status")) filter.status = searchParams.get("status");
    } else {
      filter.status = "published";
    }

    if (searchParams.get("category")) filter.category = searchParams.get("category");
    if (searchParams.get("brand")) filter.brand = searchParams.get("brand");
    if (searchParams.get("featured") === "true") filter.featured = true;
    if (searchParams.get("bestSeller") === "true") filter.bestSeller = true;
    if (searchParams.get("isPreorder") === "true") filter.isPreorder = true;

    // Both of these are expressed as their own `$or` clause, so they're
    // collected here and combined with `$and` below rather than assigned
    // straight onto `filter` — otherwise a second `$or` key would silently
    // clobber the first when both a search term and newArrival=true are
    // active at once (e.g. searching while on the New Arrivals page).
    const andClauses: Record<string, unknown>[] = [];

    if (searchParams.get("newArrival") === "true") {
      // A product qualifies either because it's explicitly flagged, or
      // simply because it was added recently — see lib/newArrival.ts.
      andClauses.push({ $or: [{ newArrival: true }, { createdAt: { $gte: newArrivalSince() } }] });
    }

    if (searchParams.get("q")) {
      const or = await buildProductSearchOr(searchParams.get("q") as string);
      if (or.length) andClauses.push({ $or: or });
    }

    if (andClauses.length === 1) {
      Object.assign(filter, andClauses[0]);
    } else if (andClauses.length > 1) {
      filter.$and = andClauses;
    }

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      filter.price = {
        ...(minPrice ? { $gte: Number(minPrice) } : {}),
        ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
      };
    }

    const sortParam = searchParams.get("sort") || "newest";
    const sort: Record<string, 1 | -1> =
      sortParam === "price_asc"
        ? { price: 1 }
        : sortParam === "price_desc"
        ? { price: -1 }
        : sortParam === "name_asc"
        ? { name: 1 }
        : { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("brand", "name slug")
        .populate("category", "name slug")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean({ virtuals: true }),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (isResponse(session)) return session;

    await connectDB();
    const body = await req.json();
    const data = productSchema.parse(body);

    const skuExists = await Product.findOne({ sku: data.sku.toUpperCase() }).lean();
    if (skuExists) return jsonError("A product with this SKU already exists.", 409);

    const slug = await uniqueSlug(data.slug || data.name, async (s) => Product.findOne({ slug: s }).lean());

    const product = await Product.create({ ...data, slug });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
