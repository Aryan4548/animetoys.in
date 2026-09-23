"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isWholesaleApproved: boolean;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((data) => setCustomers(data.customers || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Customers</h1>
      <div className="card" style={{ padding: 4 }}>
        {loading ? (
          <p style={{ padding: 20 }}>Loading...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Wholesale</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone || "—"}</td>
                  <td>{c.isWholesaleApproved ? <span className="badge badge-instock">Approved</span> : "—"}</td>
                  <td>{formatDate(c.createdAt)}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 30, color: "var(--color-ink-soft)" }}>
                    No customers yet.
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
