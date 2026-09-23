"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { useCart } from "@/components/providers/CartProvider";
import { formatINR } from "@/lib/format";

export default function CartPage() {
  const { items, subtotal, loading, updateItem, removeItem } = useCart();

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
        Loading cart...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`container ${styles.empty}`}>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>Your cart is empty</h1>
        <p style={{ color: "var(--color-ink-soft)", marginBottom: 20 }}>Browse the shop and add something you love.</p>
        <Link href="/shop" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={`container ${styles.wrap}`}>
      <div>
        <h1 style={{ fontSize: 24, marginBottom: 6 }}>Your Cart ({items.length})</h1>
        {items.map((item) => (
          <div className={styles.item} key={item.productId}>
            <div className={styles.itemImage}>
              <Image src={item.image || "/placeholder-product.svg"} alt={item.name} fill style={{ objectFit: "cover" }} unoptimized />
            </div>
            <div className={styles.itemInfo}>
              <Link href={`/product/${item.slug}`} style={{ fontWeight: 700, fontSize: 14 }}>
                {item.name}
              </Link>
              <span style={{ fontWeight: 800 }}>
                {formatINR(item.price)}
                {item.wholesaleApplied && <span style={{ fontWeight: 600, fontSize: 12 }}> /pc</span>}
              </span>
              {item.wholesaleApplied ? (
                <span className="badge badge-instock" style={{ width: "fit-content" }}>
                  Wholesale price applied
                </span>
              ) : (
                !!item.wholesalePrice &&
                !!item.wholesaleMoq && (
                  <span style={{ fontSize: 11.5, color: "var(--color-ink-soft)" }}>
                    Add {Math.max(0, item.wholesaleMoq - item.quantity)} more for {formatINR(item.wholesalePrice)}/pc
                  </span>
                )
              )}
              {item.isPreorder && <span className="badge badge-preorder" style={{ width: "fit-content" }}>Preorder</span>}
              <div className={styles.itemFooter}>
                <div className={styles.qtyControl}>
                  <button onClick={() => updateItem(item.productId, Math.max(1, item.quantity - 1))}>−</button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateItem(item.productId, item.isPreorder ? item.quantity + 1 : Math.min(item.stock, item.quantity + 1))
                    }
                  >
                    +
                  </button>
                </div>
                <button className={styles.removeBtn} onClick={() => removeItem(item.productId)}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`card ${styles.summary}`}>
        <h2 style={{ fontSize: 16 }}>Order Summary</h2>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        <div className={styles.summaryTotal}>
          <span>Total</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <Link href="/checkout" className="btn btn-primary btn-block">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
