"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./layout.module.css";
import { useSession } from "@/components/providers/SessionProvider";

const LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/wishlist", label: "Wishlist" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useSession();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className={`container ${styles.wrap}`}>
      <aside className={styles.sidebar}>
        <div style={{ padding: "8px 12px 16px", fontWeight: 700 }}>Hi, {user?.name?.split(" ")[0] || "there"}</div>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={`${styles.link} ${pathname === l.href ? styles.linkActive : ""}`}>
            {l.label}
          </Link>
        ))}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Log Out
        </button>
      </aside>
      <div>{children}</div>
    </div>
  );
}
