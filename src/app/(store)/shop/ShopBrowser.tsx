"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { ProductGrid } from "@/components/product/ProductCard";
import type { ProductListItem, CategoryItem, BrandItem } from "@/types";

export default function ShopBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const sort = searchParams.get("sort") || "newest";
  const newArrival = searchParams.get("newArrival") === "true";
  const featured = searchParams.get("featured") === "true";
  const isPreorder = searchParams.get("isPreorder") === "true";
  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/brands").then((r) => r.json()),
    ]).then(([c, b]) => {
      setCategories(c.categories || []);
      setBrands(b.brands || []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);
    if (sort) params.set("sort", sort);
    if (newArrival) params.set("newArrival", "true");
    if (featured) params.set("featured", "true");
    if (isPreorder) params.set("isPreorder", "true");
    params.set("page", String(page));
    params.set("limit", "16");

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      })
      .finally(() => setLoading(false));
  }, [category, brand, sort, newArrival, featured, isPreorder, page]);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/shop?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const pageButtons = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= pagination.pages; i++) arr.push(i);
    return arr.slice(0, 8);
  }, [pagination.pages]);

  return (
    <div className="container">
      <div className={styles.layout}>
        <aside className={`${styles.sidebar} ${filtersOpen ? styles.open : ""}`}>
          <div className={styles.filterGroup}>
            <h4>Category</h4>
            <label className={`${styles.filterOption} ${!category ? styles.active : ""}`}>
              <input type="radio" name="category" checked={!category} onChange={() => updateParam("category", null)} />
              All
            </label>
            {categories.map((c) => (
              <label key={c._id} className={`${styles.filterOption} ${category === c._id ? styles.active : ""}`}>
                <input
                  type="radio"
                  name="category"
                  checked={category === c._id}
                  onChange={() => updateParam("category", c._id)}
                />
                {c.name}
              </label>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <h4>Brand</h4>
            <label className={`${styles.filterOption} ${!brand ? styles.active : ""}`}>
              <input type="radio" name="brand" checked={!brand} onChange={() => updateParam("brand", null)} />
              All
            </label>
            {brands.map((b) => (
              <label key={b._id} className={`${styles.filterOption} ${brand === b._id ? styles.active : ""}`}>
                <input type="radio" name="brand" checked={brand === b._id} onChange={() => updateParam("brand", b._id)} />
                {b.name}
              </label>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <h4>Show</h4>
            <label className={styles.filterOption}>
              <input
                type="checkbox"
                checked={newArrival}
                onChange={(e) => updateParam("newArrival", e.target.checked ? "true" : null)}
              />
              New Arrivals
            </label>
            <label className={styles.filterOption}>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => updateParam("featured", e.target.checked ? "true" : null)}
              />
              Featured
            </label>
            <label className={styles.filterOption}>
              <input
                type="checkbox"
                checked={isPreorder}
                onChange={(e) => updateParam("isPreorder", e.target.checked ? "true" : null)}
              />
              Preorder
            </label>
          </div>
        </aside>

        <div>
          <div className={styles.toolbar}>
            <button className={`btn btn-outline btn-sm ${styles.mobileFilterBtn}`} onClick={() => setFiltersOpen((v) => !v)}>
              Filters
            </button>
            <span style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>{pagination.total} products</span>
            <select value={sort} onChange={(e) => updateParam("sort", e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
            </select>
          </div>

          {loading ? <p style={{ padding: "40px 0" }}>Loading products...</p> : <ProductGrid products={products} />}

          {pagination.pages > 1 && (
            <div className={styles.pagination}>
              {pageButtons.map((p) => (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${p === pagination.page ? styles.pageBtnActive : ""}`}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
