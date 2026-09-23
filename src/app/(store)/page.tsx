import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import styles from "./page.module.css";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { ProductGrid } from "@/components/product/ProductCard";
import type { ProductListItem, CategoryItem } from "@/types";
import { SITE_INFO } from "@/lib/siteInfo";

export const metadata: Metadata = {
  title: "Home",
};

// Rendered per-request (not statically prerendered at build time): stock
// status and new products need to reflect admin changes immediately, and
// this also means `npm run build` never needs a live MongoDB connection.
export const dynamic = "force-dynamic";

async function getHomeData() {
  await connectDB();
  const [newArrivals, featured, categories] = await Promise.all([
    Product.find({ status: "published" }).sort({ createdAt: -1 }).limit(8).lean({ virtuals: true }),
    Product.find({ status: "published", featured: true }).sort({ createdAt: -1 }).limit(8).lean({ virtuals: true }),
    Category.find({ isActive: true }).sort({ sortOrder: 1 }).limit(8).lean(),
  ]);

  return {
    newArrivals: JSON.parse(JSON.stringify(newArrivals)) as ProductListItem[],
    featured: JSON.parse(JSON.stringify(featured)) as ProductListItem[],
    categories: JSON.parse(JSON.stringify(categories)) as CategoryItem[],
  };
}

export default async function HomePage() {
  const { newArrivals, featured, categories } = await getHomeData();

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBanner}>
          <Image
            src="/hero-banner.jpg"
            alt="One Piece collection now in stock — Anime & Toy Universe"
            fill
            style={{ objectFit: "cover" }}
            unoptimized
            priority
          />
        </div>
      </section>

      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <div className={styles.categoryRow}>
              {categories.map((c) => (
                <Link key={c._id} href={`/shop?category=${c._id}`} className={styles.categoryTile}>
                  <div className={styles.categoryCircle}>
                    <Image
                      src={c.image || "/placeholder-product.svg"}
                      alt={c.name}
                      width={120}
                      height={120}
                      unoptimized
                    />
                  </div>
                  <span>{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.stripRow}>
            <div className={`${styles.stripCard} ${styles.stripPreorder}`}>
              <h3>Preorder</h3>
              <p>Secure upcoming releases before they sell out.</p>
              <Link href="/preorder" className="btn btn-accent btn-sm" style={{ alignSelf: "flex-start" }}>
                View Preorders →
              </Link>
            </div>
            <div className={`${styles.stripCard} ${styles.stripWholesale}`}>
              <h3>Wholesale</h3>
              <p>Join our WhatsApp community built for wholesalers for best deals.</p>
              <a
                href={SITE_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ alignSelf: "flex-start", background: "#fff", color: "#14141a" }}
              >
                Join Now →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">Fresh drops, straight from Japan</div>
              <h2 style={{ fontSize: 26 }}>New Arrivals ✦</h2>
            </div>
            <Link href="/shop?newArrival=true" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <div>
                <div className="section-eyebrow">Handpicked for collectors</div>
                <h2 style={{ fontSize: 26 }}>Featured Products</h2>
              </div>
              <Link href="/shop?featured=true" className="btn btn-outline btn-sm">
                View All
              </Link>
            </div>
            <ProductGrid products={featured} />
          </div>
        </section>
      )}

      <section className={styles.communityStrip}>
        <div className="container">
          <h2>Join Our WhatsApp Community</h2>
          <p>Daily new products, daily new deals.</p>
          <a
            href={SITE_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ marginTop: 18, background: "#fff", color: "#14141a" }}
          >
            Join Now →
          </a>
        </div>
      </section>
    </>
  );
}
