"use client";

import { use, useEffect, useState } from "react";
import { formatDate, formatINR } from "@/lib/format";

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

interface OrderDetail {
  _id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  trackingNumber?: string;
  courier?: string;
  notes: string[];
  createdAt: string;
  user?: { name: string; email: string };
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{ name: string; sku: string; price: number; priceType?: "retail" | "wholesale"; quantity: number; isPreorder: boolean }>;
  statusHistory: Array<{ status: string; note?: string; changedAt: string }>;
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [status, setStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [courier, setCourier] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch(`/api/orders/${id}?admin=true`);
    const data = await res.json();
    setOrder(data.order);
    if (data.order) {
      setStatus(data.order.status);
      setTracking(data.order.trackingNumber || "");
      setCourier(data.order.courier || "");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function saveChanges() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, trackingNumber: tracking, courier, note: note || undefined }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setNote("");
    load();
  }

  if (!order) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22 }}>{order.orderNumber}</h1>
        <span className="badge badge-instock">{order.status}</span>
      </div>

      <div className="grid-2to1">
        <div>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, marginBottom: 12 }}>Items</h2>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--color-border)", fontSize: 13 }}>
                <span>
                  {item.name} ({item.sku}) × {item.quantity} {item.isPreorder && <span className="badge badge-preorder">Preorder</span>}{" "}
                  {item.priceType === "wholesale" && <span className="badge badge-instock">Wholesale</span>}
                </span>
                <span>{formatINR(item.price * item.quantity)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, paddingTop: 12 }}>
              <span>Total</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, marginBottom: 8 }}>Customer &amp; Shipping</h2>
            <p style={{ fontSize: 13 }}>{order.user ? `${order.user.name} (${order.user.email})` : "Guest"}</p>
            <p style={{ fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country} · {order.shippingAddress.phone}
            </p>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 14, marginBottom: 8 }}>Status History</h2>
            {order.statusHistory.map((h, i) => (
              <div key={i} style={{ fontSize: 13, padding: "4px 0", color: "var(--color-ink-soft)" }}>
                {formatDate(h.changedAt)} — {h.status} {h.note ? `(${h.note})` : ""}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, marginBottom: 14 }}>Manage Order</h2>
          <div className="form-field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Courier</label>
            <input value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="e.g. Delhivery, BlueDart" />
          </div>
          <div className="form-field">
            <label>Tracking Number</label>
            <input value={tracking} onChange={(e) => setTracking(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Add Note (optional)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {error && <p className="form-error" style={{ marginBottom: 10 }}>{error}</p>}
          <button className="btn btn-primary btn-block" onClick={saveChanges} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <p style={{ fontSize: 11, color: "var(--color-ink-soft)", marginTop: 10 }}>
            Payment: {order.paymentMethod} · {order.paymentStatus}
          </p>
        </div>
      </div>
    </div>
  );
}
