"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate, formatINR } from "@/lib/format";

interface AdminOrder {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  user?: { name: string; email: string };
}

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
  "REFUNDED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ admin: "true", limit: "50" });
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    const res = await fetch(`/api/orders?${params.toString()}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Orders</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <input
          placeholder="Search order number..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          style={{ flex: 1, maxWidth: 280, padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--color-border)" }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--color-border)" }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 4 }}>
        {loading ? (
          <p style={{ padding: 20 }}>Loading...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <Link href={`/admin/orders/${o._id}`} style={{ fontWeight: 700 }}>
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td>{o.user ? `${o.user.name} (${o.user.email})` : "—"}</td>
                  <td>{o.paymentMethod}</td>
                  <td>{formatINR(o.total)}</td>
                  <td>
                    <span className="badge badge-instock">{o.status}</span>
                  </td>
                  <td>{formatDate(o.createdAt)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 30, color: "var(--color-ink-soft)" }}>
                    No orders found.
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
