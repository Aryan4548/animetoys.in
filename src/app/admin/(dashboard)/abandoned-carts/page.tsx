"use client";

import { useCallback, useEffect, useState } from "react";
import { formatINR } from "@/lib/format";

interface CartItemRow {
  name: string;
  slug: string;
  image?: string;
  quantity: number;
  priceAtAdd: number;
}

interface AbandonedCart {
  _id: string;
  user: { name: string; email: string; phone?: string } | null;
  guestId?: string;
  updatedAt: string;
  items: CartItemRow[];
  itemCount: number;
  value: number;
}

const HOUR_OPTIONS = [
  { label: "1+ hour", hours: 1 },
  { label: "6+ hours", hours: 6 },
  { label: "24+ hours", hours: 24 },
  { label: "3+ days", hours: 72 },
];

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours < 1) return "under an hour ago";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState(1);

  const load = useCallback(async (h: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/abandoned-carts?hours=${h}`, { cache: "no-store" });
      const data = await res.json();
      setCarts(data.carts || []);
      setTotalValue(data.totalValue || 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(hours);
  }, [load, hours]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
        <h1 style={{ fontSize: 22 }}>Abandoned Carts</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="badge badge-lowstock">{carts.length} carts</span>
          <span className="badge badge-instock">{formatINR(totalValue)} at stake</span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-ink-soft)", marginBottom: 16 }}>
        Carts with items that haven&apos;t been touched or checked out in a while. A cart drops off this list the
        moment it&apos;s emptied or turned into an order.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {HOUR_OPTIONS.map((opt) => (
          <button
            key={opt.hours}
            className={hours === opt.hours ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
            onClick={() => setHours(opt.hours)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 4 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Items</th>
              <th>Value</th>
              <th>Last activity</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 30, color: "var(--color-ink-soft)" }}>
                  Loading...
                </td>
              </tr>
            ) : carts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 30, color: "var(--color-ink-soft)" }}>
                  No abandoned carts in this window.
                </td>
              </tr>
            ) : (
              carts.map((cart) => (
                <tr key={cart._id}>
                  <td>
                    {cart.user ? (
                      <div>
                        <strong>{cart.user.name}</strong>
                        <div style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>{cart.user.email}</div>
                      </div>
                    ) : (
                      <span style={{ color: "var(--color-ink-soft)" }}>Guest</span>
                    )}
                  </td>
                  <td style={{ fontSize: 13, maxWidth: 320 }}>
                    {cart.items
                      .slice(0, 3)
                      .map((i) => `${i.name} ×${i.quantity}`)
                      .join(", ")}
                    {cart.items.length > 3 && `, +${cart.items.length - 3} more`}
                  </td>
                  <td style={{ fontWeight: 700 }}>{formatINR(cart.value)}</td>
                  <td style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>{timeAgo(cart.updatedAt)}</td>
                  <td>
                    {cart.user?.email ? (
                      <a
                        className="btn btn-outline btn-sm"
                        href={`mailto:${cart.user.email}?subject=${encodeURIComponent("You left something in your cart!")}`}
                      >
                        Email
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>No contact</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
