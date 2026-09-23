import type { Metadata } from "next";
import ShopBrowser from "./ShopBrowser";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import Product from "@/models/Product";
import { newArrivalSince } from "@/lib/newArrival";
import type { ProductListItem, CategoryItem, BrandItem } from "@/types";

interface SearchParams {
  category?: string;
  brand?: string;
  sort?: string;
  newArrival?: string;
  featured?: string;
  isPreorder?: string;
  page?: string;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

// Query-string category filters (/shop?category=<id>) all shared one
// generic "Shop All Products" title before this, so a search for e.g.
// "wholesale nendoroid figures" had no matching, unique page title to
// rank with. This looks up the selected category (when present) and
// builds a keyword-specific title/description for that filtered view,
// while the unfiltered /shop keeps the general title.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category } = await searchParams;
  if (!category) {
    return {
      title: "Shop All Products",
      description:
        "Browse anime figures, Nendoroids, scale figures, statues, model kits, plushies, trading cards and anime stationery. 100% original merchandise, retail and wholesale.",
      alternates: { canonical: "/shop" },
    };
  }

  try {
    await connectDB();
    const cat = await Category.findById(category).select("name").lean();
    if (cat?.name) {
      return {
        title: `${cat.name} — Shop Anime Toys`,
        description: `Shop ${cat.name} at Anime & Toy Universe — 100% original anime merchandise, available at retail and wholesale pricing for resellers.`,
      };
    }
  } catch {
    // Fall through to the generic title below if the id doesn't resolve.
  }

  return {
    title: "Shop All Products",
    description:
      "Browse anime figures, Nendoroids, scale figures, statues, model kits, plushies, trading cards and anime stationery.",
  };
}

// Mirrors the filtering/sorting logic in /api/products (and the
// category/brand lists from /api/categories, /api/brands) so the first
// server-rendered response already contains real product data — not just
// an empty grid with a "Loading products..." placeholder. ShopBrowser
// previously fetched everything client-side after mount, which meant
// Googlebot's initial fetch of /shop saw zero products; Search Console
// was flagging the page as a soft 404 as a result. The client-side
// fetching in ShopBrowser still runs for in-page filter/sort/pagination
// changes — this only fixes the first paint.
async function getShopData(sp: SearchParams) {
  await connectDB();

  const filter: Record<string, unknown> = { status: "published" };
  if (sp.category) filter.category = sp.category;
  if (sp.brand) filter.brand = sp.brand;
  if (sp.featured === "true") filter.featured = true;
  if (sp.isPreorder === "true") filter.isPreorder = true;
  if (sp.newArrival === "true") {
    filter.$or = [{ newArrival: true }, { createdAt: { $gte: newArrivalSince() } }];
  }

  const sortParam = sp.sort || "newest";
  const sort: Record<string, 1 | -1> =
    sortParam === "price_asc"
      ? { price: 1 }
      : sortParam === "price_desc"
      ? { price: -1 }
      : sortParam === "name_asc"
      ? { name: 1 }
      : { createdAt: -1 };

  const page = Math.max(1, Number(sp.page || 1));
  const limit = 16;

  const [products, total, categories, brands] = await Promise.all([
    Product.find(filter)
      .populate("brand", "name slug")
      .populate("category", "name slug")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean({ virtuals: true }),
    Product.countDocuments(filter),
    Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean(),
    Brand.find({ isActive: true }).sort({ name: 1 }).lean(),
  ]);

  return {
    products: JSON.parse(JSON.stringify(products)) as ProductListItem[],
    categories: JSON.parse(JSON.stringify(categories)) as CategoryItem[],
    brands: JSON.parse(JSON.stringify(brands)) as BrandItem[],
    pagination: { page, pages: Math.max(1, Math.ceil(total / limit)), total },
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams;
  const { products, categories, brands, pagination } = await getShopData(sp);

  return (
    <ShopBrowser
      initialProducts={products}
      initialCategories={categories}
      initialBrands={brands}
      initialPagination={pagination}
    />
  );
}
