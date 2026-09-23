"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./Header.module.css";
import { useCart } from "@/components/providers/CartProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { formatINR } from "@/lib/format";
import type { ProductListItem } from "@/types";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/preorder", label: "Preorder" },
  { href: "/wholesale", label: "Wholesale" },
  { href: "/shop?newArrival=true", label: "New Arrivals" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const { count } = useCart();
  const { user } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductListItem[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Live "recommended products" dropdown: as soon as the visitor has typed
  // a couple of characters, fetch a handful of matching products (debounced
  // so we're not hitting the API on every keystroke) so they can jump
  // straight to a product instead of only finding out on the results page
  // whether the search "worked".
  useEffect(() => {
    const term = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (term.length < 2) {
      setSuggestions([]);
      setSuggestOpen(false);
      setSuggestLoading(false);
      return;
    }
    setSuggestLoading(true);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/products?q=${encodeURIComponent(term)}&limit=6`)
        .then((r) => r.json())
        .then((data) => {
          setSuggestions(data.products || []);
          setSuggestOpen(true);
        })
        .catch(() => {})
        .finally(() => setSuggestLoading(false));
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function goToSearch() {
    if (!query.trim()) return;
    setSuggestOpen(false);
    setDrawerOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function goToProduct(slug: string) {
    setSuggestOpen(false);
    setDrawerOpen(false);
    setQuery("");
    router.push(`/product/${slug}`);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    goToSearch();
  }

  function renderSuggestions() {
    if (!suggestOpen || query.trim().length < 2) return null;
    return (
      <div className={styles.suggestions} role="listbox">
        {suggestions.map((p) => (
          <button
            key={p._id}
            type="button"
            className={styles.suggestionItem}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => goToProduct(p.slug)}
          >
            <Image
              src={p.images?.[0] || "/placeholder-product.svg"}
              alt=""
              width={36}
              height={36}
              unoptimized
              className={styles.suggestionImg}
            />
            <span className={styles.suggestionInfo}>
              <span className={styles.suggestionName}>{p.name}</span>
              <span className={styles.suggestionPrice}>{formatINR(p.price)}</span>
            </span>
          </button>
        ))}
        {!suggestLoading && suggestions.length === 0 && (
          <p className={styles.suggestionEmpty}>No quick matches for &ldquo;{query.trim()}&rdquo;. Press Enter to search everything.</p>
        )}
        {suggestions.length > 0 && (
          <button
            type="button"
            className={styles.suggestionSeeAll}
            onMouseDown={(e) => e.preventDefault()}
            onClick={goToSearch}
          >
            See all results for &ldquo;{query.trim()}&rdquo;
          </button>
        )}
      </div>
    );
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.topBar}`}>
        <button
          className={styles.hamburger}
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>

        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>
            <Image src="/logo-icon.png" alt="" width={26} height={20} />
          </span>
          <span className={styles.logoText}>
            <span className={styles.logoTitle}>Anime &amp; Toy Universe</span>
            <small>Good Toys, Brighter Days</small>
          </span>
        </Link>

        <div className={styles.searchWrap}>
          <form className={styles.search} onSubmit={submitSearch}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              placeholder="Search anime figures, toys, brands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length >= 2 && setSuggestOpen(true)}
              onBlur={() => setSuggestOpen(false)}
            />
            <button type="submit" className={styles.searchBtn} aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" strokeLinecap="round" />
              </svg>
            </button>
          </form>
          {renderSuggestions()}
        </div>

        <div className={styles.iconRow}>
          <Link href={user ? "/account" : "/login"} className={styles.iconBtn} aria-label="Account">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" strokeLinecap="round" />
            </svg>
          </Link>
          <Link href="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7.5-4.9-10-9.3C0.3 7.8 2.3 4 6 4c2.2 0 3.7 1.2 6 3.5C14.3 5.2 15.8 4 18 4c3.7 0 5.7 3.8 4 7.7-2.5 4.4-10 9.3-10 9.3Z" />
            </svg>
          </Link>
          <Link href="/cart" className={styles.iconBtn} aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="21" r="1.4" />
              <circle cx="18" cy="21" r="1.4" />
            </svg>
            {count > 0 && <span className={styles.iconCount}>{count}</span>}
          </Link>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={`container ${styles.navList}`}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {drawerOpen && (
        <div className={styles.drawer}>
          <div className={styles.drawerPanel}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className={styles.logo}>
                <span className={styles.logoMark}>
                  <Image src="/logo-icon.png" alt="" width={26} height={20} />
                </span>
                <span className={styles.logoText}>
                  <span className={styles.logoTitle}>Anime &amp; Toy Universe</span>
                </span>
              </span>
              <button
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
                style={{ background: "transparent", border: "none", color: "#fff" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className={styles.mobileSearchWrap}>
              <form onSubmit={submitSearch} className={styles.mobileSearchBar}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                </svg>
                <input
                  type="search"
                  placeholder="Search anime figures, toys, brands..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query.trim().length >= 2 && setSuggestOpen(true)}
                  onBlur={() => setSuggestOpen(false)}
                />
                <button type="submit" className={styles.searchBtn} aria-label="Search">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                  </svg>
                </button>
              </form>
              {renderSuggestions()}
            </div>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.drawerLink}
                onClick={() => setDrawerOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href={user ? "/account" : "/login"} className={styles.drawerLink} onClick={() => setDrawerOpen(false)}>
              {user ? "My Account" : "Login / Register"}
            </Link>
          </div>
          <div className={styles.drawerBackdrop} onClick={() => setDrawerOpen(false)} />
        </div>
      )}
    </header>
  );
}
