"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate, formatINR } from "@/lib/format";

interface OrderRow {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{ name: string; quantity: number }>;
}

export default function OrdersListPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading orders...</p>;

  if (orders.length === 0) {
    return (
      <div>
        <h1 style={{ fontSize: 22, marginBottom: 16 }}>My Orders</h1>
        <p style={{ color: "var(--color-ink-soft)" }}>You haven&apos;t placed any orders yet.</p>
        <Link href="/shop" className="btn btn-primary btn-sm" style={{ marginTop: 12, display: "inline-flex" }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>My Orders</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {orders.map((o) => (
          <Link key={o._id} href={`/account/orders/${o._id}`} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <strong style={{ fontSize: 14 }}>{o.orderNumber}</strong>
              <p style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>
                {formatDate(o.createdAt)} · {o.items.length} item(s)
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="badge badge-instock">{o.status}</span>
              <p style={{ fontWeight: 700, marginTop: 4 }}>{formatINR(o.total)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
