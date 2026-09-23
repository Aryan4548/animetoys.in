"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";

interface PreorderProduct {
  _id: string;
  name: string;
  sku: string;
  releaseDate?: string;
  preorderClosingDate?: string;
  stock: number;
  reserved: number;
}

export default function AdminPreordersPage() {
  const [products, setProducts] = useState<PreorderProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?admin=true&isPreorder=true&limit=50")
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 6 }}>Preorders</h1>
      <p style={{ fontSize: 13, color: "var(--color-ink-soft)", marginBottom: 20 }}>
        Preorder products, driven by the product&apos;s Preorder flag, release date and closing date. Dedicated
        allocation/deposit management (the <code>Preorder</code> model) is on the phase 2 roadmap — for now, manage
        release dates and stock from the product editor.
      </p>
      <div className="card" style={{ padding: 4 }}>
        {loading ? (
          <p style={{ padding: 20 }}>Loading...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Release Date</th>
                <th>Closing Date</th>
                <th>Reserved</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>{p.releaseDate ? formatDate(p.releaseDate) : "—"}</td>
                  <td>{p.preorderClosingDate ? formatDate(p.preorderClosingDate) : "—"}</td>
                  <td>{p.reserved}</td>
                  <td>
                    <Link href={`/admin/products/${p._id}/edit`} className="btn btn-outline btn-sm">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 30, color: "var(--color-ink-soft)" }}>
                    No preorder products yet.
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
