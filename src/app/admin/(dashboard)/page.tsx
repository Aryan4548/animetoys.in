"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate, formatINR } from "@/lib/format";

interface Stats {
  totalProducts: number;
  publishedProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  pendingWholesale: number;
  unreadMessages: number;
  totalRevenue: number;
  onlineVisitorCount: number;
  recentOrders: Array<{ _id: string; orderNumber: string; status: string; total: number; createdAt: string }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const cards = stats
    ? [
        { label: "Online Now", value: stats.onlineVisitorCount, sub: "live visitors", href: "/admin/visitors" },
        { label: "Total Revenue", value: formatINR(stats.totalRevenue), href: "/admin/orders" },
        { label: "Total Orders", value: stats.totalOrders, sub: `${stats.pendingOrders} pending`, href: "/admin/orders" },
        { label: "Products", value: stats.publishedProducts, sub: `${stats.totalProducts} total`, href: "/admin/products" },
        { label: "Low Stock", value: stats.lowStockCount, sub: `${stats.outOfStockCount} out of stock`, href: "/admin/inventory" },
        { label: "Customers", value: stats.totalCustomers, href: "/admin/customers" },
        { label: "Wholesale Applications", value: stats.pendingWholesale, sub: "pending review", href: "/admin/wholesale" },
        { label: "Unread Messages", value: stats.unreadMessages, href: "/admin/contact" },
      ]
    : [];

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Dashboard</h1>

      {!stats ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
            {cards.map((c) => (
              <Link key={c.label} href={c.href} className="card" style={{ padding: 18 }}>
                <span style={{ fontSize: 12, color: "var(--color-ink-soft)", fontWeight: 600 }}>{c.label}</span>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>{c.value}</div>
                {c.sub && <span style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>{c.sub}</span>}
              </Link>
            ))}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 15, marginBottom: 14 }}>Recent Orders</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <Link href={`/admin/orders/${o._id}`}>{o.orderNumber}</Link>
                    </td>
                    <td>
                      <span className="badge badge-instock">{o.status}</span>
                    </td>
                    <td>{formatINR(o.total)}</td>
                    <td>{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
