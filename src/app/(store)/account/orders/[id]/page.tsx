"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatDate, formatINR } from "@/lib/format";

interface OrderDetail {
  _id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  trackingNumber?: string;
  courier?: string;
  createdAt: string;
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
  items: Array<{ product: string; name: string; sku: string; image?: string; price: number; quantity: number; isPreorder: boolean }>;
  statusHistory: Array<{ status: string; note?: string; changedAt: string }>;
}

const CANCELLABLE = ["PENDING", "CONFIRMED", "PROCESSING"];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => setOrder(data.order))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCancel() {
    if (!confirm("Cancel this order? Stock will be restored automatically.")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setOrder(data.order);
      else alert(data.error);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <p>Loading order...</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div>
      {searchParams.get("placed") === "true" && (
        <div className="card" style={{ padding: 14, marginBottom: 16, background: "#dcfce7", borderColor: "#86efac" }}>
          🎉 Order placed successfully!
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <h1 style={{ fontSize: 20 }}>{order.orderNumber}</h1>
        <span className="badge badge-instock">{order.status}</span>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-ink-soft)", marginBottom: 20 }}>Placed on {formatDate(order.createdAt)}</p>

      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, marginBottom: 12 }}>Items</h2>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)", fontSize: 13 }}>
            <span>
              {item.name} × {item.quantity} {item.isPreorder && <span className="badge badge-preorder">Preorder</span>}
            </span>
            <span>{formatINR(item.price * item.quantity)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, paddingTop: 12 }}>
          <span>Total</span>
          <span>{formatINR(order.total)}</span>
        </div>
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, marginBottom: 8 }}>Shipping Address</h2>
        <p style={{ fontSize: 13, lineHeight: 1.7 }}>
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

      {(order.trackingNumber || order.courier) && (
        <div className="card" style={{ padding: 18, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, marginBottom: 8 }}>Tracking</h2>
          {order.courier && <p style={{ fontSize: 13 }}>Courier: {order.courier}</p>}
          {order.trackingNumber && <p style={{ fontSize: 13 }}>Tracking #: {order.trackingNumber}</p>}
        </div>
      )}

      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, marginBottom: 8 }}>Status History</h2>
        {order.statusHistory.map((h, i) => (
          <div key={i} style={{ fontSize: 13, padding: "4px 0", color: "var(--color-ink-soft)" }}>
            {formatDate(h.changedAt)} — {h.status} {h.note ? `(${h.note})` : ""}
          </div>
        ))}
      </div>

      {CANCELLABLE.includes(order.status) && (
        <button className="btn btn-outline btn-sm" onClick={handleCancel} disabled={cancelling} style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }}>
          {cancelling ? "Cancelling..." : "Cancel Order"}
        </button>
      )}
    </div>
  );
}
