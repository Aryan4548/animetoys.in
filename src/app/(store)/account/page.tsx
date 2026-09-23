"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/providers/SessionProvider";
import styles from "./page.module.css";

function Chevron() {
  return (
    <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** "Aryan Yadav" -> "AY", "Aryan" -> "AR" — a text placeholder avatar, no photo upload. */
function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AccountOverviewPage() {
  const { user, logout } = useSession();
  const router = useRouter();
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

  async function handleLogout() {
    await logout();
    router.push("/");
  }

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
          <Chevron />
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
          <Chevron />
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
          <Chevron />
        </Link>

        <Link href="/account/settings" className={`card ${styles.quickCard}`}>
          <span className={`${styles.quickIcon} ${styles.quickIconPurple}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10a1.65 1.65 0 0 0 1-1.51V4a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V10a1.65 1.65 0 0 0 1.51 1H20a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className={styles.quickTitle}>Account Settings</span>
          <span className={styles.quickDesc}>Update your details</span>
          <Chevron />
        </Link>
      </div>

      <button className={`card ${styles.logoutRow}`} onClick={handleLogout}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Log Out</span>
        <Chevron />
      </button>
    </div>
  );
}
