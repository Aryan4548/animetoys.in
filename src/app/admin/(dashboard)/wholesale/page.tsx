"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";

interface Application {
  _id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  businessType: string;
  monthlyOrderVolume: string;
  message?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function AdminWholesalePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/wholesale");
    const data = await res.json();
    setApplications(data.applications || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    await fetch(`/api/wholesale/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Wholesale Applications</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {applications.map((a) => (
          <div key={a._id} className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <strong style={{ fontSize: 15 }}>{a.businessName}</strong>
                <p style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>
                  {a.contactName} · {a.email} · {a.phone}
                </p>
                <p style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>
                  {a.city}, {a.country} · {a.businessType} · ~{a.monthlyOrderVolume}/mo
                </p>
                {a.message && <p style={{ fontSize: 13, marginTop: 6 }}>{a.message}</p>}
                <p style={{ fontSize: 11, color: "var(--color-ink-soft)", marginTop: 6 }}>{formatDate(a.createdAt)}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  className={`badge ${a.status === "APPROVED" ? "badge-instock" : a.status === "REJECTED" ? "badge-outofstock" : "badge-lowstock"}`}
                  style={{ marginBottom: 8, display: "inline-block" }}
                >
                  {a.status}
                </span>
                {a.status === "PENDING" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(a._id, "APPROVED")}>
                      Approve
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => updateStatus(a._id, "REJECTED")}>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {!loading && applications.length === 0 && <p style={{ color: "var(--color-ink-soft)" }}>No applications yet.</p>}
      </div>
    </div>
  );
}
