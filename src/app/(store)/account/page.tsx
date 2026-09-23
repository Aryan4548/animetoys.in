"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/components/providers/SessionProvider";
import styles from "./page.module.css";

/** "Aryan Yadav" -> "AY", "Aryan" -> "AR" — a text placeholder avatar, no photo upload. */
function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AccountOverviewPage() {
  const { user } = useSession();
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [wishlistCount, setWishlistCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrderCount((data.orders || []).length))
      .catch(() => setOrderCount(0));
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => setWishlistCount((data.products || []).length))
      .catch(() => setWishlistCount(0));
  }, []);

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div>
      <div className={styles.eyebrow}>My Account</div>
      <h1 className={styles.greeting}>Hi, {firstName} 👋</h1>
      <p className={styles.sub}>Manage your orders, addresses, wishlist and more — all in one place.</p>

      <div className={`card ${styles.profileCard}`}>
        <div className={styles.avatar}>{getInitials(user?.name)}</div>
        <div className={styles.profileInfo}>
          <strong className={styles.profileName}>{user?.name}</strong>
          <span className={styles.profileEmail}>{user?.email}</span>
          <span className={`badge ${styles.profileBadge}`}>{user?.isWholesaleApproved ? "✓ Wholesale Approved" : "Anime Fan"}</span>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={`card ${styles.statCard}`}>
          <strong>{orderCount ?? "—"}</strong>
          <span>Total Orders</span>
        </div>
        <div className={`card ${styles.statCard}`}>
          <strong>{wishlistCount ?? "—"}</strong>
          <span>Wishlist Items</span>
        </div>
      </div>

      <div className={styles.quickGrid}>
        <Link href="/account/orders" className={`card ${styles.quickCard}`}>
          <span className={`${styles.quickIcon} ${styles.quickIconBlue}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 8h16l-1.5 11.5a1 1 0 0 1-1 .5H6.5a1 1 0 0 1-1-.5L4 8ZM8 8a4 4 0 0 1 8 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className={styles.quickTitle}>My Orders</span>
          <span className={styles.quickDesc}>Track &amp; view your orders</span>
        </Link>

        <Link href="/account/addresses" className={`card ${styles.quickCard}`}>
          <span className={`${styles.quickIcon} ${styles.quickIconPink}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="9.5" r="2.4" />
            </svg>
          </span>
          <span className={styles.quickTitle}>Addresses</span>
          <span className={styles.quickDesc}>Manage delivery addresses</span>
        </Link>

        <Link href="/wishlist" className={`card ${styles.quickCard}`}>
          <span className={`${styles.quickIcon} ${styles.quickIconGreen}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                d="M12 20.3s-7.5-4.5-9.8-9a5.2 5.2 0 0 1 9.8-4 5.2 5.2 0 0 1 9.8 4c-2.3 4.5-9.8 9-9.8 9Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className={styles.quickTitle}>My Wishlist</span>
          <span className={styles.quickDesc}>Your saved favorites</span>
        </Link>
      </div>
    </div>
  );
}
