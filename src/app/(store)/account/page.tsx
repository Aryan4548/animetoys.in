"use client";

import Link from "next/link";
import { useSession } from "@/components/providers/SessionProvider";

export default function AccountOverviewPage() {
  const { user } = useSession();

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>My Account</h1>
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <p style={{ fontSize: 14, marginBottom: 6 }}>
          <strong>Name:</strong> {user?.name}
        </p>
        <p style={{ fontSize: 14, marginBottom: 6 }}>
          <strong>Email:</strong> {user?.email}
        </p>
        {user?.phone && (
          <p style={{ fontSize: 14 }}>
            <strong>Phone:</strong> {user.phone}
          </p>
        )}
        {user?.isWholesaleApproved && <p style={{ fontSize: 13, marginTop: 8, color: "var(--color-accent-green)" }}>✓ Approved wholesale account</p>}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/account/orders" className="btn btn-outline btn-sm">
          View Orders
        </Link>
        <Link href="/account/addresses" className="btn btn-outline btn-sm">
          Manage Addresses
        </Link>
        <Link href="/wishlist" className="btn btn-outline btn-sm">
          My Wishlist
        </Link>
      </div>
    </div>
  );
}
