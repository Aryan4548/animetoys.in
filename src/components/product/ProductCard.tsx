"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./ProductCard.module.css";
import { formatINR } from "@/lib/format";
import { useCart } from "@/components/providers/CartProvider";
import type { ProductListItem } from "@/types";
import { useState } from "react";
import { computeInventoryStatus } from "@/lib/productStatus";
import { getDiscountPercent } from "@/lib/pricing";

export default function ProductCard({ product }: { product: ProductListItem }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const image = product.images?.[0] || "/placeholder-product.svg";
  // Computed here rather than trusted from `product.inventoryStatus` /
  // `product.discountPercent` — see lib/productStatus.ts for why those
  // Mongoose virtuals aren't reliable coming out of `.lean()` reads.
  const inventoryStatus = computeInventoryStatus(product.stock, product.reserved, product.lowStockThreshold, product.isPreorder);
  const outOfStock = inventoryStatus === "OUT_OF_STOCK";
  const discountPercent = getDiscountPercent(product.mrp, product.price);

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || adding) return;
    setAdding(true);
    try {
      await addItem(product._id, 1);
    } finally {
      setAdding(false);
    }
  }

  return (
    <Link href={`/product/${product.slug}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <Image src={image} alt={product.name} fill sizes="(max-width: 640px) 50vw, 22vw" style={{ objectFit: "cover" }} unoptimized />
        <div className={styles.badges}>
          {product.newArrival && <span className="badge badge-new">New</span>}
          {product.isPreorder && <span className="badge badge-preorder">Preorder</span>}
        </div>
      </div>
      <div className={styles.body}>
        {product.brand?.name && <span className={styles.brand}>{product.brand.name}</span>}
        <span className={styles.name}>{product.name}</span>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatINR(product.price)}</span>
          {product.mrp > product.price && <span className={styles.mrp}>{formatINR(product.mrp)}</span>}
          {!!discountPercent && <span className={styles.discount}>{discountPercent}% off</span>}
        </div>
        {!!product.wholesalePrice && !!product.wholesaleMoq && (
          <div className={styles.wholesaleRow}>
            <span className={styles.wholesalePrice}>{formatINR(product.wholesalePrice)}/pc</span>
            <span className={styles.wholesaleMoq}>wholesale · {product.wholesaleMoq}+ pcs</span>
          </div>
        )}
        <div className={styles.footerRow}>
          <span className={`badge badge-${inventoryStatus.toLowerCase().replace(/_/g, "")}`}>
            {product.isPreorder
              ? "Preorder"
              : outOfStock
              ? "Out of stock"
              : inventoryStatus === "LOW_STOCK"
              ? "Low stock"
              : "In stock"}
          </span>
          <button className={styles.cartBtn} onClick={handleAdd} disabled={outOfStock || adding} aria-label="Add to cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="21" r="1.4" />
              <circle cx="18" cy="21" r="1.4" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  if (!products.length) {
    return <p style={{ padding: "32px 0", color: "var(--color-ink-soft)" }}>No products found.</p>;
  }
  return (
    <div className={styles.grid}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}
