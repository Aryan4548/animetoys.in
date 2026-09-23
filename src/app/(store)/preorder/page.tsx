import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { ProductGrid } from "@/components/product/ProductCard";
import type { ProductListItem } from "@/types";

export const metadata: Metadata = {
  title: "Preorders",
  description: "Secure upcoming anime figure and toy releases before they sell out.",
};

export const dynamic = "force-dynamic";

export default async function PreorderPage() {
  await connectDB();
  const products = await Product.find({ status: "published", isPreorder: true })
    .sort({ releaseDate: 1 })
    .lean({ virtuals: true });

  return (
    <div className="container section">
      <div className="section-eyebrow">Upcoming Releases</div>
      <h1 style={{ fontSize: 30, marginBottom: 6 }}>Preorders</h1>
      <p style={{ color: "var(--color-ink-soft)", marginBottom: 28 }}>Secure your favourites before they sell out.</p>
      <ProductGrid products={JSON.parse(JSON.stringify(products)) as ProductListItem[]} />
    </div>
  );
}
