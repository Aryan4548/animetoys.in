"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./AdminSidebar.module.css";

const NAV = [
  { section: "Overview", links: [{ href: "/admin", label: "Dashboard" }] },
  {
    section: "Catalog",
    links: [
      { href: "/admin/products", label: "Products" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/brands", label: "Brands" },
      { href: "/admin/inventory", label: "Inventory" },
    ],
  },
  {
    section: "Sales",
    links: [
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/abandoned-carts", label: "Abandoned Carts" },
      { href: "/admin/customers", label: "Customers" },
      { href: "/admin/preorders", label: "Preorders" },
      { href: "/admin/wholesale", label: "Wholesale" },
      { href: "/admin/coupons", label: "Coupons" },
    ],
  },
  {
    section: "Content",
    links: [
      { href: "/admin/homepage", label: "Homepage CMS" },
      { href: "/admin/banners", label: "Banners" },
      { href: "/admin/blog", label: "Blog" },
    ],
  },
  {
    section: "Communication",
    links: [
      { href: "/admin/contact", label: "Contact Messages" },
      { href: "/admin/newsletter", label: "Newsletter" },
    ],
  },
  {
    section: "Monitoring",
    links: [
      { href: "/admin/visitors", label: "Live Visitors" },
      { href: "/admin/blocked-ips", label: "Blocked IPs" },
    ],
  },
  { section: "System", links: [{ href: "/admin/settings", label: "Settings" }] },
];

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  // Sidebar is a static column on desktop; below ~900px (see
  // AdminSidebar.module.css) it becomes a fixed slide-in drawer toggled by
  // the mobile topbar's hamburger button, since a 232px-wide fixed sidebar
  // has no way to coexist with a phone-width viewport otherwise.
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes (i.e. after tapping a nav
  // link on mobile) rather than leaving it open over the new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <>
      <div className={styles.mobileTopbar}>
        <button
          type="button"
          className={styles.hamburgerBtn}
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
        <span className={styles.mobileTopbarTitle}>Admin Panel</span>
        <span style={{ width: 22 }} />
      </div>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <div className={styles.logo}>
          <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#fff", color: "#14141a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
            AT
          </span>
          <span style={{ flex: 1 }}>Admin Panel</span>
          <button
            type="button"
            className={styles.drawerCloseBtn}
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>
        {NAV.map((group) => (
          <div key={group.section}>
            <div className={styles.section}>{group.section}</div>
            {group.links.map((link) => {
              const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href} className={`${styles.link} ${active ? styles.linkActive : ""}`}>
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: "10px", fontSize: 12, color: "#9a9aa4" }}>{adminName}</div>
        <button
          onClick={handleLogout}
          style={{ margin: "0 10px", background: "transparent", border: "1px solid #33333d", color: "#fff", borderRadius: 8, padding: "8px", cursor: "pointer", fontSize: 13 }}
        >
          Log Out
        </button>
      </aside>
    </>
  );
}
