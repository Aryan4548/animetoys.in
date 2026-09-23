"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";

interface Message {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminContactPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/contact");
    const data = await res.json();
    setMessages(data.messages || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: string, isRead: boolean) {
    await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead }),
    });
    load();
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Contact Messages</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m) => (
          <div key={m._id} className="card" style={{ padding: 16, opacity: m.isRead ? 0.7 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong style={{ fontSize: 14 }}>
                {m.name} {!m.isRead && <span className="badge badge-preorder">New</span>}
              </strong>
              <span style={{ fontSize: 11, color: "var(--color-ink-soft)" }}>{formatDate(m.createdAt)}</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>{m.email}</p>
            {m.subject && <p style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>{m.subject}</p>}
            <p style={{ fontSize: 13, marginTop: 4 }}>{m.message}</p>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 10 }} onClick={() => markRead(m._id, !m.isRead)}>
              {m.isRead ? "Mark Unread" : "Mark Read"}
            </button>
          </div>
        ))}
        {!loading && messages.length === 0 && <p style={{ color: "var(--color-ink-soft)" }}>No messages yet.</p>}
      </div>
    </div>
  );
}
