"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";

// Subscribers are captured today via the footer newsletter form (NewsletterSubscriber
// collection). Export/campaign tooling is phase 2 — this lists what's captured so far.
interface Subscriber {
  _id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/newsletter")
      .then((r) => r.json())
      .then((data) => setSubscribers(data.subscribers || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Newsletter Subscribers</h1>
      <div className="card" style={{ padding: 4 }}>
        {loading ? (
          <p style={{ padding: 20 }}>Loading...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s._id}>
                  <td>{s.email}</td>
                  <td>{formatDate(s.createdAt)}</td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center", padding: 30, color: "var(--color-ink-soft)" }}>
                    No subscribers yet.
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
