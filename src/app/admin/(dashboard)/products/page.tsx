"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatINR } from "@/lib/format";

interface AdminProduct {
  _id: string;
  name: string;
  sku: string;
  images: string[];
  price: number;
  stock: number;
  reserved: number;
  status: "draft" | "published" | "archived";
  isPreorder: boolean;
  category?: { name: string } | null;
  brand?: { name: string } | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ admin: "true", limit: "50" });
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function handleAction(action: "publish" | "unpublish" | "archive" | "delete" | "duplicate", product: AdminProduct) {
    if (action === "delete") {
      if (!confirm(`Delete "${product.name}" permanently? This cannot be undone.`)) return;
      await fetch(`/api/products/${product._id}`, { method: "DELETE" });
    } else if (action === "duplicate") {
      await fetch(`/api/products/${product._id}/duplicate`, { method: "POST" });
    } else {
      const nextStatus = action === "publish" ? "published" : action === "unpublish" ? "draft" : "archived";
      await fetch(`/api/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    }
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22 }}>Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary btn-sm">
          + Add Product
        </Link>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <input
          placeholder="Search by name/description..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          style={{ flex: 1, maxWidth: 320, padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--color-border)" }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--color-border)" }}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="card" style={{ padding: 4 }}>
        {loading ? (
          <p style={{ padding: 20 }}>Loading...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ width: 40, height: 40, borderRadius: 6, overflow: "hidden", background: "#f1f0ec", position: "relative" }}>
                      <Image src={p.images?.[0] || "/placeholder-product.svg"} alt="" fill style={{ objectFit: "cover" }} unoptimized />
                    </div>
                  </td>
                  <td>
                    <Link href={`/admin/products/${p._id}/edit`} style={{ fontWeight: 700 }}>
                      {p.name}
                    </Link>
                    <div style={{ fontSize: 11, color: "var(--color-ink-soft)" }}>
                      {p.category?.name || "—"} {p.brand?.name ? `· ${p.brand.name}` : ""}
                    </div>
                  </td>
                  <td>{p.sku}</td>
                  <td>{formatINR(p.price)}</td>
                  <td>
                    {p.stock} {p.reserved ? `(${p.reserved} reserved)` : ""}
                  </td>
                  <td>
                    <span className={`badge ${p.status === "published" ? "badge-instock" : p.status === "archived" ? "badge-outofstock" : "badge-lowstock"}`}>
                      {p.status}
                    </span>
                    {p.isPreorder && <span className="badge badge-preorder" style={{ marginLeft: 6 }}>Preorder</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Link href={`/admin/products/${p._id}/edit`} className="btn btn-outline btn-sm">
                        Edit
                      </Link>
                      <button className="btn btn-outline btn-sm" onClick={() => handleAction("duplicate", p)}>
                        Duplicate
                      </button>
                      {p.status === "published" ? (
                        <button className="btn btn-outline btn-sm" onClick={() => handleAction("unpublish", p)}>
                          Unpublish
                        </button>
                      ) : (
                        <button className="btn btn-outline btn-sm" onClick={() => handleAction("publish", p)}>
                          Publish
                        </button>
                      )}
                      <button className="btn btn-outline btn-sm" onClick={() => handleAction("archive", p)}>
                        Archive
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleAction("delete", p)} style={{ color: "var(--color-danger)" }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 30, color: "var(--color-ink-soft)" }}>
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
