"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Footer.module.css";
import { SITE_INFO, SITE_ADDRESS_ONE_LINE } from "@/lib/siteInfo";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <div className={styles.brand}>
              <span className={styles.mark}>AT</span>
              Anime &amp; Toy Universe
            </div>
            <p className={styles.tagline}>
              The ultimate destination for anime figures, collectibles and toys. From Japan to your shelf.
            </p>
            <p className={styles.tagline} style={{ marginTop: 8 }}>
              A wholesale supplier of anime figures, gifts &amp; toys — we run on low margins so retailers and
              resellers get competitive pricing on every order.
            </p>
            <div className={styles.contactInfo}>
              <a href={`tel:${SITE_INFO.phoneHref}`}>{SITE_INFO.phoneDisplay}</a>
              <a href={`mailto:${SITE_INFO.email}`}>{SITE_INFO.email}</a>
              <span>{SITE_ADDRESS_ONE_LINE}</span>
            </div>
            <div className={styles.social}>
              <a href={SITE_INFO.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href={SITE_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 1 3.5 7.1L3 20l0.9-3.4A9 9 0 0 1 3 12Z" strokeLinejoin="round" />
                  <path d="M8.5 9.5c0 3.5 3 6.5 6.5 6.5" strokeLinecap="round" />
                </svg>
              </a>
              <a href={`tel:${SITE_INFO.phoneHref}`} aria-label="Call us">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11 11 0 0 0 3.4.55 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .55 3.4 1 1 0 0 1-.25 1Z"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <div className={styles.heading}>Quick Links</div>
            <div className={styles.linkList}>
              <Link href="/">Home</Link>
              <Link href="/shop">Shop</Link>
              <Link href="/preorder">Preorder</Link>
              <Link href="/wholesale">Wholesale</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>

          <div>
            <div className={styles.heading}>Help</div>
            <div className={styles.linkList}>
              <Link href="/policies/shipping">Shipping Policy</Link>
              <Link href="/policies/returns">Return &amp; Refund</Link>
              <Link href="/faq">FAQs</Link>
              <Link href="/account/orders">Track Order</Link>
              <Link href="/wholesale">Wholesale Enquiries</Link>
            </div>
          </div>

          <div>
            <div className={styles.heading}>Subscribe to our newsletter</div>
            <p style={{ fontSize: 13, color: "#9a9aa4" }}>Get updates on new arrivals, preorders and exclusive deals.</p>
            <form className={styles.newsletterForm} onSubmit={subscribe}>
              <input
                type="email"
                required
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" disabled={status === "loading"}>
                {status === "loading" ? "..." : "Join"}
              </button>
            </form>
            {status === "done" && <p style={{ fontSize: 12, color: "#4ade80", marginTop: 6 }}>Subscribed!</p>}
            {status === "error" && <p style={{ fontSize: 12, color: "#f87171", marginTop: 6 }}>Something went wrong.</p>}
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} Anime &amp; Toy Universe. All rights reserved.</span>
          <span>#GoodToysBrighterDays</span>
        </div>
      </div>
    </footer>
  );
}
