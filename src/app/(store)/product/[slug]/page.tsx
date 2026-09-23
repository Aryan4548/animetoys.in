import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import styles from "./page.module.css";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";
import ProductDetailClient from "./ProductDetailClient";
import { ProductGrid } from "@/components/product/ProductCard";
import type { ProductListItem } from "@/types";
import { safeJsonLd } from "@/lib/jsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  await connectDB();
  const product = await Product.findOne({ slug, status: "published" })
    .populate("brand", "name slug")
    .populate("category", "name slug")
    .lean({ virtuals: true });
  if (!product) return null;

  const related = await Product.find({
    status: "published",
    _id: { $ne: product._id },
    $or: [{ category: (product as any).category?._id }, { brand: (product as any).brand?._id }],
  })
    .limit(8)
    .lean({ virtuals: true });

  // Only approved reviews count toward the public average/count — this is
  // real data (or honestly absent), never a placeholder number.
  const [ratingAgg] = await Review.aggregate([
    { $match: { product: product._id, isApproved: true } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const rating = { avg: ratingAgg?.avg || 0, count: ratingAgg?.count || 0 };

  return {
    product: JSON.parse(JSON.stringify(product)),
    related: JSON.parse(JSON.stringify(related)) as ProductListItem[],
    rating,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) return { title: "Product not found" };
  const { product } = data;
  return {
    title: product.name,
    description: product.shortDescription || product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) notFound();
  const { product, related, rating } = data;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.shortDescription || product.description,
    sku: product.sku,
    brand: product.brand?.name ? { "@type": "Brand", name: product.brand.name } : undefined,
    aggregateRating:
      rating.count > 0
        ? { "@type": "AggregateRating", ratingValue: rating.avg.toFixed(1), reviewCount: rating.count }
        : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.isPreorder || product.stock - product.reserved > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const breadcrumbItems = [
    { name: "Home", url: siteUrl },
    { name: "Shop", url: `${siteUrl}/shop` },
    ...(product.category?.name ? [{ name: product.category.name, url: `${siteUrl}/shop?category=${product.category._id}` }] : []),
    { name: product.name, url: `${siteUrl}/product/${product.slug}` },
  ];
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <div className={`container ${styles.wrap}`}>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }} />

      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link> / <Link href="/shop">Shop</Link>
        {product.category?.name && (
          <>
            {" "}
            / <Link href={`/shop?category=${product.category._id}`}>{product.category.name}</Link>
          </>
        )}{" "}
        / {product.name}
      </div>

      <ProductDetailClient product={product} rating={rating} />

      {related.length > 0 && (
        <div className={styles.relatedSection}>
          <div className="section-head">
            <h2 style={{ fontSize: 22 }}>You may also like</h2>
          </div>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
