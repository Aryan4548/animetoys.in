"use client";

import { useCallback, useEffect, useState } from "react";

interface Visitor {
  _id: string;
  visitorId: string;
  ip: string;
  path: string;
  name?: string | null;
  lastSeenAt: string;
}

const POLL_INTERVAL_MS = 8000;

function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

export default function AdminVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockingIp, setBlockingIp] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/visitors", { cache: "no-store" });
      const data = await res.json();
      setVisitors(data.visitors || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  async function handleBlock(ip: string) {
    const reason = window.prompt(`Block ${ip} from the website? Add a reason (optional):`);
    if (reason === null) return; // cancelled
    setBlockingIp(ip);
    try {
      await fetch("/api/admin/blocked-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, reason: reason.trim() || undefined }),
      });
      await load();
    } finally {
      setBlockingIp(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
        <h1 style={{ fontSize: 22 }}>Live Visitors</h1>
        <span className="badge badge-instock">{visitors.length} online now</span>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-ink-soft)", marginBottom: 16 }}>
        Anyone who has loaded a page on the site in the last minute, refreshed automatically every few seconds.
        Logged-in visitors show their name; everyone else shows as a guest.
      </p>
      <div className="card" style={{ padding: 4 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Visitor</th>
              <th>IP address</th>
              <th>Current page</th>
              <th>Last seen</th>
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
            ) : visitors.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 30, color: "var(--color-ink-soft)" }}>
                  No one is currently on the site.
                </td>
              </tr>
            ) : (
              visitors.map((v) => (
                <tr key={v.visitorId}>
                  <td>{v.name ? <strong>{v.name}</strong> : <span style={{ color: "var(--color-ink-soft)" }}>Guest</span>}</td>
                  <td>{v.ip}</td>
                  <td style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>{v.path}</td>
                  <td style={{ fontSize: 13 }}>{timeAgo(v.lastSeenAt)}</td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }}
                      onClick={() => handleBlock(v.ip)}
                      disabled={blockingIp === v.ip}
                    >
                      {blockingIp === v.ip ? "Blocking..." : "Block IP"}
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
