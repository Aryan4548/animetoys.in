"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./MobileBottomNav.module.css";
import { useSession } from "@/components/providers/SessionProvider";

const ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: (
      <path d="M4 11.5 12 4l8 7.5M6 10v9h5v-5h2v5h5v-9" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    href: "/shop",
    label: "Shop",
    icon: <path d="M4 8h16l-1.5 11.5a1 1 0 0 1-1 .5H6.5a1 1 0 0 1-1-.5L4 8ZM8 8a4 4 0 0 1 8 0" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    href: "/preorder",
    label: "Preorder",
    icon: <path d="M12 7v5l3 3M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" strokeLinecap="round" strokeLinejoin="round" />,
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useSession();
  const items = [...ITEMS, { href: user ? "/account" : "/login", label: "Account", icon: <path d="M12 21s-7.5-4.9-10-9.3C0.3 7.8 2.3 4 6 4c2.2 0 3.7 1.2 6 3.5C14.3 5.2 15.8 4 18 4c3.7 0 5.7 3.8 4 7.7-2.5 4.4-10 9.3-10 9.3Z" /> }];

  return (
    <nav className={styles.nav}>
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} className={`${styles.item} ${active ? styles.itemActive : ""}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {item.icon}
            </svg>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
