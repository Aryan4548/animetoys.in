import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";
import { SITE_INFO, SITE_ADDRESS_ONE_LINE } from "@/lib/siteInfo";

export const metadata: Metadata = {
  title: "About Us",
  description: `${SITE_INFO.brandName} (${SITE_INFO.legalName}) is a Mumbai-based wholesale supplier of anime figures, gifts and toys. We operate on low margins to offer retailers and resellers across India genuinely competitive, wholesale-first pricing on 100% original merchandise.`,
};

export default function AboutPage() {
  return (
    <div className="container section">
      <div className="section-eyebrow">Our Story</div>
      <h1 style={{ fontSize: 32, marginBottom: 18 }}>About Anime &amp; Toy Universe</h1>

      <div className={styles.layout}>
        <div>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--color-ink-soft)", marginBottom: 16 }}>
            Anime &amp; Toy Universe, run by {SITE_INFO.legalName}, is a main wholesale supplier of anime figures,
            gifts and toys, operating out of {SITE_ADDRESS_ONE_LINE}. We supply retailers, gift shops, online
            resellers and collectors across India with a curated range of Nendoroids, scale figures, statues, model
            kits, plushies, trading cards and anime merchandise — sourced through trusted channels and backed by
            our word that every piece is 100% original.
          </p>

          <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--color-ink-soft)", marginBottom: 16 }}>
            We built our business on one simple idea: keep our margins low so the people who buy from us — whether
            that&apos;s a shopkeeper stocking up for the festive season, an online reseller building a storefront,
            or a collector treating themselves — get honest, wholesale-level pricing every single time. No inflated
            MRPs, no middlemen markups. Just competitive pricing, real stock, and reliable supply, order after
            order.
          </p>

          <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--color-ink-soft)", marginBottom: 32 }}>
            From our base in Mumbai, we ship pan-India and work with growing brands, gift stores and toy retailers
            who need a dependable wholesale partner — not just a one-time supplier. Today, we&apos;re proud to be
            the go-to wholesale source for anime figures, gifts and toys for businesses and collectors who value
            authenticity, fair pricing and a partner who ships on time.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            {[
              ["Wholesale First", "Low margins, straight-up wholesale pricing for retailers & resellers."],
              ["Authentic Products", "100% original, licensed merchandise — every order, every time."],
              ["Pan-India Reach", "Shipping nationwide from our Mumbai facility, plus dropshipping support."],
              ["Reliable Supply", "Real stock and consistent restocks so your shelves never run dry."],
            ].map(([title, desc]) => (
              <div className="card" key={title} style={{ padding: 18 }}>
                <strong style={{ fontSize: 14 }}>{title}</strong>
                <p style={{ fontSize: 13, color: "var(--color-ink-soft)", marginTop: 6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className="card" style={{ padding: 20 }}>
            <strong style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-ink-soft)" }}>
              Visit / Reach Us
            </strong>
            <p style={{ fontSize: 14, marginTop: 10 }}>
              <a href={`tel:${SITE_INFO.phoneHref}`}>{SITE_INFO.phoneDisplay}</a>
            </p>
            <p style={{ fontSize: 14, marginTop: 4 }}>
              <a href={`mailto:${SITE_INFO.email}`}>{SITE_INFO.email}</a>
            </p>
            <p style={{ fontSize: 14, marginTop: 4, lineHeight: 1.6, color: "var(--color-ink-soft)" }}>
              {SITE_INFO.address.line1}, {SITE_INFO.address.line2}
              <br />
              {SITE_INFO.address.city} - {SITE_INFO.address.postalCode}, {SITE_INFO.address.state}, {SITE_INFO.address.country}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
              <Link href="/wholesale" className="btn btn-primary btn-sm">
                Apply for Wholesale
              </Link>
              <Link href="/contact" className="btn btn-outline btn-sm">
                Contact Us
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
