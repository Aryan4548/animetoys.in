"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { formatINR, formatDate } from "@/lib/format";
import { useCart } from "@/components/providers/CartProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { useRouter } from "next/navigation";
import type { ProductListItem } from "@/types";
import { getDiscountPercent, getUnitPrice, hasWholesalePricing, isWholesaleApplied } from "@/lib/pricing";

interface FullProduct extends ProductListItem {
  description?: string;
  shortDescription?: string;
  releaseDate?: string;
  preorderClosingDate?: string;
  weight?: number;
  tags?: string[];
}

interface Rating {
  avg: number;
  count: number;
}

// Small inline line icons — no icon package is installed in this project,
// and pulling one in for a dozen glyphs isn't worth the dependency.
function IconChevronLeft(props: { size?: number }) {
  const s = props.size ?? 18;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
function IconChevronRight(props: { size?: number }) {
  const s = props.size ?? 18;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
function IconExpand() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
function IconStar(props: { filled?: boolean }) {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill={props.filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 2.5l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L5.8 21.4l1.6-7-5.4-4.7 7.1-.6L12 2.5z" strokeLinejoin="round" />
    </svg>
  );
}
function IconHeart(props: { filled?: boolean }) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill={props.filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 21s-7.5-4.6-10-9.3C.4 8.2 2 4.5 5.7 4a5.4 5.4 0 0 1 6.3 3 5.4 5.4 0 0 1 6.3-3c3.7.5 5.3 4.2 3.7 7.7C19.5 16.4 12 21 12 21z" strokeLinejoin="round" />
    </svg>
  );
}
function IconShare() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12m0-12l4 4m-4-4L8 7M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}
function IconBox() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c.8-3.4 3.3-5.4 6.5-5.4s5.7 2 6.5 5.4" />
      <circle cx="17.5" cy="9" r="2.4" />
      <path d="M15.8 14.9c2.3.3 4 2 4.6 4.6" />
    </svg>
  );
}

const TRUST_ITEMS = [
  { icon: <IconShield />, label: "100% Trusted" },
  { icon: <IconLock />, label: "Secure Payments" },
  { icon: <IconGlobe />, label: "Worldwide Shipping" },
  { icon: <IconUsers />, label: "Collector Community" },
];

export default function ProductDetailClient({ product, rating }: { product: FullProduct; rating: Rating }) {
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"description" | "details" | "shipping">("description");
  const [adding, setAdding] = useState(false);
  const [wished, setWished] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbRowRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { user } = useSession();
  const router = useRouter();

  const images = product.images?.length ? product.images : ["/placeholder-product.svg"];
  const available = Math.max(0, product.stock - product.reserved);
  const outOfStock = !product.isPreorder && available <= 0;
  const showsWholesale = hasWholesalePricing(product);
  const wholesaleActive = isWholesaleApplied(product, qty);
  const unitPrice = getUnitPrice(product, qty);
  const roundedRating = Math.round(rating.avg);
  // Computed here rather than trusted from `product.discountPercent` — see
  // lib/productStatus.ts for why that Mongoose virtual isn't reliable
  // coming out of `.lean()` reads.
  const discountPercent = getDiscountPercent(product.mrp, product.price);

  function scrollThumbs(dir: -1 | 1) {
    thumbRowRef.current?.scrollBy({ left: dir * 88, behavior: "smooth" });
  }

  function showImage(dir: -1 | 1) {
    setActiveImage((i) => (i + dir + images.length) % images.length);
  }

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addItem(product._id, qty);
    } finally {
      setAdding(false);
    }
  }

  async function handleBuyNow() {
    await handleAddToCart();
    router.push("/cart");
  }

  async function toggleWishlist() {
    if (!user) {
      router.push(`/login?next=/product/${product.slug}`);
      return;
    }
    if (wished) {
      await fetch(`/api/wishlist?productId=${product._id}`, { method: "DELETE" });
      setWished(false);
    } else {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });
      setWished(true);
    }
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
        return;
      } catch {
        // user cancelled the native share sheet — fall through to copy
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <div className={styles.grid}>
      <div className={styles.gallery}>
        <div className={styles.mainImage}>
          <Image src={images[activeImage]} alt={product.name} fill style={{ objectFit: "contain" }} unoptimized priority />
          <button type="button" className={styles.expandBtn} onClick={() => setLightboxOpen(true)} aria-label="View full size image">
            <IconExpand />
          </button>
        </div>

        {images.length > 1 && (
          <div className={styles.thumbRowWrap}>
            <button type="button" className={styles.thumbScrollBtn} onClick={() => scrollThumbs(-1)} aria-label="Scroll thumbnails left">
              <IconChevronLeft size={16} />
            </button>
            <div className={styles.thumbRow} ref={thumbRowRef}>
              {images.map((img, i) => (
                <button
                  key={img + i}
                  type="button"
                  className={`${styles.thumb} ${i === activeImage ? styles.thumbActive : ""}`}
                  onClick={() => setActiveImage(i)}
                >
                  <Image src={img} alt="" width={64} height={64} unoptimized style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                </button>
              ))}
            </div>
            <button type="button" className={styles.thumbScrollBtn} onClick={() => scrollThumbs(1)} aria-label="Scroll thumbnails right">
              <IconChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <div className={styles.info}>
        {(product.isPreorder || product.newArrival) && (
          <div className={styles.badgeRow}>
            {product.isPreorder && <span className="badge badge-preorder">Preorder</span>}
            {product.newArrival && <span className="badge badge-new">New</span>}
          </div>
        )}

        {product.brand?.name && (
          <Link href={`/shop?brand=${product.brand._id}`} className={styles.brandLine}>
            {product.brand.name}
          </Link>
        )}
        <h1>{product.name}</h1>
        {product.shortDescription && <p className={styles.brandLine}>{product.shortDescription}</p>}

        {rating.count > 0 && (
          <div className={styles.ratingRow}>
            <span className={styles.stars}>
              {[0, 1, 2, 3, 4].map((i) => (
                <IconStar key={i} filled={i < roundedRating} />
              ))}
            </span>
            <span className={styles.reviewCount}>({rating.count} review{rating.count === 1 ? "" : "s"})</span>
          </div>
        )}

        <div className={styles.priceRow}>
          <span className={styles.price}>{formatINR(product.price)}</span>
          {product.mrp > product.price && <span className={styles.mrp}>{formatINR(product.mrp)}</span>}
          {!!discountPercent && <span className="badge badge-discount">{discountPercent}% off</span>}
        </div>

        <div className={styles.statusRow}>
          {outOfStock ? (
            <span className="badge badge-outofstock">Out of stock</span>
          ) : available <= product.lowStockThreshold ? (
            <>
              <span className="badge badge-lowstock">Low stock</span>
              <span className={styles.availableText}>Only {available} left</span>
            </>
          ) : (
            <>
              <span className="badge badge-instock">In Stock</span>
              <span className={styles.availableText}>{available} available</span>
            </>
          )}
          {product.isPreorder && product.releaseDate && (
            <span className={styles.availableText}>Releases {formatDate(product.releaseDate)}</span>
          )}
        </div>

        {showsWholesale && (
          <div className={`${styles.wholesaleBox} ${wholesaleActive ? styles.wholesaleBoxActive : ""}`}>
            <div className={styles.wholesaleLeft}>
              <span className={styles.wholesaleIcon}>
                <IconBox />
              </span>
              <div>
                <div className={styles.wholesaleBoxLabel}>
                  {wholesaleActive ? "✓ Wholesale price applied" : `Wholesale · ${product.wholesaleMoq}+ pcs`}
                </div>
                <div className={styles.wholesaleSubtitle}>
                  {wholesaleActive
                    ? "You're getting the bulk rate on this order"
                    : "Get special pricing for bulk orders"}
                </div>
              </div>
            </div>
            <span className={styles.wholesaleBoxPrice}>{formatINR(product.wholesalePrice!)}/pc</span>
          </div>
        )}

        {!outOfStock && (
          <div className={styles.qtyAddRow}>
            <div className={styles.qtyControl}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                −
              </button>
              <span>{qty}</span>
              <button
                onClick={() => setQty((q) => (product.isPreorder ? q + 1 : Math.min(available, q + 1)))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddToCart} disabled={adding}>
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        )}

        <div className={styles.actionRow}>
          <button className="btn btn-blue btn-block" onClick={handleBuyNow} disabled={outOfStock || adding}>
            {product.isPreorder ? "Preorder Now" : "Buy Now"}
          </button>
        </div>

        {!outOfStock && (
          <div className={styles.totalRow}>
            <span>
              {qty} × {formatINR(unitPrice)}
            </span>
            <strong>{formatINR(unitPrice * qty)}</strong>
            {showsWholesale && !wholesaleActive && (
              <span>
                — add {Math.max(0, (product.wholesaleMoq as number) - qty)} more for {formatINR(product.wholesalePrice!)}/pc
              </span>
            )}
          </div>
        )}

        <div className={styles.secondaryRow}>
          <button type="button" onClick={toggleWishlist} className={styles.secondaryLink}>
            <IconHeart filled={wished} /> {wished ? "Wishlisted" : "Add to Wishlist"}
          </button>
          <button type="button" onClick={handleShare} className={styles.secondaryLink}>
            <IconShare /> Share
          </button>
        </div>

        <div className={styles.trustRow}>
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} className={styles.trustItem}>
              <span className={styles.trustIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.metaCard}>
          <span>
            SKU: <strong>{product.sku}</strong>
          </span>
          {product.category?.name && (
            <span>
              Category: <strong>{product.category.name}</strong>
            </span>
          )}
          {product.brand?.name && (
            <span>
              Brand: <strong>{product.brand.name}</strong>
            </span>
          )}
          {product.series && (
            <span>
              Series: <strong>{product.series}</strong>
            </span>
          )}
          {product.character && (
            <span>
              Character: <strong>{product.character}</strong>
            </span>
          )}
          {product.isPreorder && product.releaseDate && (
            <span>
              Estimated Release: <strong>{formatDate(product.releaseDate)}</strong>
            </span>
          )}
        </div>

        <div className={styles.tabs}>
          <div className={styles.tabList}>
            <button
              className={`${styles.tabBtn} ${tab === "description" ? styles.tabBtnActive : ""}`}
              onClick={() => setTab("description")}
            >
              Description
            </button>
            <button className={`${styles.tabBtn} ${tab === "details" ? styles.tabBtnActive : ""}`} onClick={() => setTab("details")}>
              Details
            </button>
            <button
              className={`${styles.tabBtn} ${tab === "shipping" ? styles.tabBtnActive : ""}`}
              onClick={() => setTab("shipping")}
            >
              Shipping
            </button>
          </div>
          {tab === "description" && <p style={{ fontSize: 14, lineHeight: 1.7 }}>{product.description || "No description available."}</p>}
          {tab === "details" && (
            <ul style={{ fontSize: 14, lineHeight: 1.9, paddingLeft: 18 }}>
              <li>SKU: {product.sku}</li>
              {product.weight && <li>Weight: {product.weight}g</li>}
              {product.tags?.length ? <li>Tags: {product.tags.join(", ")}</li> : null}
            </ul>
          )}
          {tab === "shipping" && (
            <p style={{ fontSize: 14, lineHeight: 1.7 }}>
              Ships worldwide in 3–7 business days from dispatch. See our{" "}
              <Link href="/policies/shipping" style={{ textDecoration: "underline" }}>
                Shipping Policy
              </Link>{" "}
              for details.
            </p>
          )}
        </div>
      </div>

      {lightboxOpen && (
        <div className={styles.lightbox} onClick={() => setLightboxOpen(false)}>
          <button type="button" className={styles.lightboxClose} onClick={() => setLightboxOpen(false)} aria-label="Close">
            <IconClose />
          </button>
          {images.length > 1 && (
            <button
              type="button"
              className={`${styles.lightboxNav} ${styles.lightboxNavLeft}`}
              onClick={(e) => {
                e.stopPropagation();
                showImage(-1);
              }}
              aria-label="Previous image"
            >
              <IconChevronLeft size={26} />
            </button>
          )}
          <div className={styles.lightboxImageWrap} onClick={(e) => e.stopPropagation()}>
            <Image src={images[activeImage]} alt={product.name} fill style={{ objectFit: "contain" }} unoptimized />
          </div>
          {images.length > 1 && (
            <button
              type="button"
              className={`${styles.lightboxNav} ${styles.lightboxNavRight}`}
              onClick={(e) => {
                e.stopPropagation();
                showImage(1);
              }}
              aria-label="Next image"
            >
              <IconChevronRight size={26} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
