"use client";

import { useEffect, useState } from "react";

interface InventoryProduct {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  isPreorder: boolean;
  inventoryStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER";
}

interface Txn {
  _id: string;
  type: string;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  note?: string;
  createdAt: string;
  performedBy?: { name: string };
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [adjustFor, setAdjustFor] = useState<InventoryProduct | null>(null);
  const [adjustType, setAdjustType] = useState<"RESTOCK" | "DAMAGED" | "MANUAL_ADJUSTMENT">("RESTOCK");
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustNote, setAdjustNote] = useState("");
  const [history, setHistory] = useState<Txn[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/inventory?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function openAdjust(p: InventoryProduct) {
    setAdjustFor(p);
    setAdjustType("RESTOCK");
    setAdjustQty(1);
    setAdjustNote("");
    setError("");
    const res = await fetch(`/api/inventory/${p._id}/transactions`);
    const data = await res.json();
    setHistory(data.transactions || []);
  }

  async function submitAdjust() {
    if (!adjustFor) return;
    setSaving(true);
    setError("");
    const signedQty = adjustType === "DAMAGED" ? -Math.abs(adjustQty) : adjustType === "RESTOCK" ? Math.abs(adjustQty) : adjustQty;
    const res = await fetch("/api/inventory/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: adjustFor._id, type: adjustType, quantityChange: signedQty, note: adjustNote }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setAdjustFor(null);
    load();
  }

  const statusLabel: Record<string, string> = { IN_STOCK: "In Stock", LOW_STOCK: "Low Stock", OUT_OF_STOCK: "Out of Stock", PREORDER: "Preorder" };
  const statusBadge: Record<string, string> = { IN_STOCK: "badge-instock", LOW_STOCK: "badge-lowstock", OUT_OF_STOCK: "badge-outofstock", PREORDER: "badge-preorder" };

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Inventory</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <input
          placeholder="Search product or SKU..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          style={{ flex: 1, maxWidth: 320, padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--color-border)" }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--color-border)" }}>
          <option value="">All statuses</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
          <option value="PREORDER">Preorder</option>
        </select>
      </div>

      <div className="card" style={{ padding: 4 }}>
        {loading ? (
          <p style={{ padding: 20 }}>Loading...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>{p.stock}</td>
                  <td>{p.reserved}</td>
                  <td>{p.available}</td>
                  <td>
                    <span className={`badge ${statusBadge[p.inventoryStatus]}`}>{statusLabel[p.inventoryStatus]}</span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => openAdjust(p)}>
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {adjustFor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 100 }}>
          <div className="card" style={{ padding: 24, width: "min(460px, 100%)", maxHeight: "85vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 16, marginBottom: 4 }}>Adjust Stock — {adjustFor.name}</h2>
            <p style={{ fontSize: 12, color: "var(--color-ink-soft)", marginBottom: 16 }}>Current stock: {adjustFor.stock}</p>

            <div className="form-field">
              <label>Adjustment Type</label>
              <select value={adjustType} onChange={(e) => setAdjustType(e.target.value as any)}>
                <option value="RESTOCK">Restock (add stock)</option>
                <option value="DAMAGED">Damaged (remove stock)</option>
                <option value="MANUAL_ADJUSTMENT">Manual Adjustment (+/-)</option>
              </select>
            </div>
            <div className="form-field">
              <label>{adjustType === "MANUAL_ADJUSTMENT" ? "Quantity Change (use negative to reduce)" : "Quantity"}</label>
              <input type="number" value={adjustQty} onChange={(e) => setAdjustQty(Number(e.target.value))} />
            </div>
            <div className="form-field">
              <label>Note (optional)</label>
              <input value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} />
            </div>
            {error && <p className="form-error" style={{ marginBottom: 10 }}>{error}</p>}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <button className="btn btn-primary btn-sm" onClick={submitAdjust} disabled={saving}>
                {saving ? "Saving..." : "Apply Adjustment"}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setAdjustFor(null)}>
                Cancel
              </button>
            </div>

            <h3 style={{ fontSize: 13, marginBottom: 8 }}>Recent Transactions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
              {history.length === 0 && <p style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>No transactions yet.</p>}
              {history.map((h) => (
                <div key={h._id} style={{ fontSize: 12, borderBottom: "1px solid var(--color-border)", paddingBottom: 6 }}>
                  <strong>{h.type}</strong> {h.quantityChange > 0 ? "+" : ""}
                  {h.quantityChange} ({h.previousStock} → {h.newStock})
                  {h.note ? ` — ${h.note}` : ""}
                  <br />
                  <span style={{ color: "var(--color-ink-soft)" }}>
                    {new Date(h.createdAt).toLocaleString()} {h.performedBy ? `· ${h.performedBy.name}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
