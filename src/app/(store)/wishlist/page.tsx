"use client";

import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/product/ProductCard";
import type { ProductListItem } from "@/types";

export default function WishlistPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>My Wishlist</h1>
      {loading ? <p>Loading...</p> : <ProductGrid products={products} />}
    </div>
  );
}
