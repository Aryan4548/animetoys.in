import { Suspense } from "react";
import type { Metadata } from "next";
import ShopBrowser from "./ShopBrowser";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";

interface Props {
  searchParams: Promise<{ category?: string }>;
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

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>Loading...</div>}>
      <ShopBrowser />
    </Suspense>
  );
}
