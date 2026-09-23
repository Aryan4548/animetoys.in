"use client";

import { useCallback, useEffect, useState } from "react";

interface BlockedIpRow {
  _id: string;
  ip: string;
  reason?: string;
  blockedByName?: string;
  createdAt: string;
}

export default function BlockedIpsPage() {
  const [items, setItems] = useState<BlockedIpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [ipInput, setIpInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/blocked-ips", { cache: "no-store" });
    const data = await res.json();
    setItems(data.blockedIps || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!ipInput.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blocked-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: ipInput.trim(), reason: reasonInput.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not block this IP.");
        return;
      }
      setIpInput("");
      setReasonInput("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleUnblock(ip: string) {
    await fetch(`/api/admin/blocked-ips/${encodeURIComponent(ip)}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Blocked IPs</h1>
      <p style={{ fontSize: 13, color: "var(--color-ink-soft)", marginBottom: 16 }}>
        A blocked visitor sees a &quot;you&apos;ve been blocked&quot; page on every part of the storefront until
        you unblock them here.
      </p>

      <form
        onSubmit={handleAdd}
        className="card"
        style={{ padding: 16, marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}
      >
        <div className="form-field" style={{ marginBottom: 0 }}>
          <label htmlFor="block-ip">IP address</label>
          <input id="block-ip" value={ipInput} onChange={(e) => setIpInput(e.target.value)} placeholder="203.0.113.42" required />
        </div>
        <div className="form-field" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
          <label htmlFor="block-reason">Reason (optional)</label>
          <input
            id="block-reason"
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            placeholder="Spam, abuse, etc."
          />
        </div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
          {saving ? "Blocking..." : "Block IP"}
        </button>
      </form>
      {error && (
        <p className="form-error" style={{ marginBottom: 16 }}>
          {error}
        </p>
      )}

      <div className="card" style={{ padding: 4 }}>
        <table className="table">
          <thead>
            <tr>
              <th>IP address</th>
              <th>Reason</th>
              <th>Blocked by</th>
              <th>Blocked on</th>
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
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 30, color: "var(--color-ink-soft)" }}>
                  No IPs are currently blocked.
                </td>
              </tr>
            ) : (
              items.map((b) => (
                <tr key={b._id}>
                  <td>
                    <strong>{b.ip}</strong>
                  </td>
                  <td style={{ color: "var(--color-ink-soft)" }}>{b.reason || "—"}</td>
                  <td style={{ fontSize: 13 }}>{b.blockedByName || "—"}</td>
                  <td style={{ fontSize: 13 }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => handleUnblock(b.ip)}>
                      Unblock
                    </button>
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
