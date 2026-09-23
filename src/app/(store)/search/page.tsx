import { Suspense } from "react";
import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { ProductGrid } from "@/components/product/ProductCard";
import type { ProductListItem } from "@/types";
import { buildProductSearchOr } from "@/lib/search";

export const metadata: Metadata = { title: "Search" };

async function SearchResults({ q }: { q: string }) {
  await connectDB();

  const or = q ? await buildProductSearchOr(q) : [];
  const products = or.length
    ? await Product.find({ status: "published", $or: or })
        .sort({ createdAt: -1 })
        .lean({ virtuals: true })
    : [];

  // When nothing matches, don't leave the visitor at a dead end — surface
  // a handful of popular products they might still be interested in.
  const recommended =
    q && products.length === 0
      ? await Product.find({ status: "published" })
          .sort({ bestSeller: -1, featured: -1, createdAt: -1 })
          .limit(8)
          .lean({ virtuals: true })
      : [];

  return (
    <>
      <p style={{ color: "var(--color-ink-soft)", marginBottom: 20 }}>
        {products.length} result(s) for &ldquo;{q}&rdquo;
      </p>
      <ProductGrid products={JSON.parse(JSON.stringify(products)) as ProductListItem[]} />
      {recommended.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>You might like</h2>
          <ProductGrid products={JSON.parse(JSON.stringify(recommended)) as ProductListItem[]} />
        </div>
      )}
    </>
  );
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

  return (
    <div className="container section">
      <h1 style={{ fontSize: 26, marginBottom: 12 }}>Search</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <SearchResults q={q || ""} />
      </Suspense>
    </div>
  );
}
