import type { Metadata } from "next";
import { safeJsonLd } from "@/lib/jsonLd";
import WholesaleForm from "./WholesaleForm";

export const metadata: Metadata = {
  title: "Wholesale Anime Toys & Stationery Supplier in India",
  description:
    "Anime & Toy Universe is a wholesale supplier of anime toys, figures and anime stationery based in Mumbai, India. Bulk pricing, 100% original merchandise and worldwide shipping for retailers and resellers — apply for a wholesale account.",
  alternates: { canonical: "/wholesale" },
};

// FAQPage structured data: search engines can surface these directly as
// rich results, and the questions themselves double as extra on-page
// keyword coverage for "wholesale anime toys" / "wholesale anime
// stationery" style searches.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do you supply anime toys and figures wholesale in India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — Anime & Toy Universe is a Mumbai-based wholesale supplier of anime toys, action figures, Nendoroids, scale figures, statues, model kits and plushies, with 100% original merchandise and low-margin pricing for retailers and resellers.",
      },
    },
    {
      "@type": "Question",
      name: "Do you also do wholesale anime stationery?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — alongside figures and toys, we supply wholesale anime stationery and accessories such as keychains, stickers and other everyday anime merchandise, sold under the same bulk pricing terms.",
      },
    },
    {
      "@type": "Question",
      name: "Who can apply for a wholesale account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Retail stores, online resellers and gift shops anywhere in the world can apply. Submit the wholesale application with your business details and expected monthly order volume, and our team will review it.",
      },
    },
  ],
};

export default function WholesalePage() {
  return (
    <div className="container section" style={{ maxWidth: 620 }}>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />

      <div className="section-eyebrow">For Retailers &amp; Resellers</div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Wholesale Anime Toys &amp; Stationery Supplier</h1>
      <p style={{ color: "var(--color-ink-soft)", marginBottom: 16 }}>
        Anime &amp; Toy Universe is a wholesale supplier of anime toys, figures and anime stationery, operating out
        of Mumbai, India. We supply retailers and online resellers worldwide with 100% original merchandise —
        action figures, Nendoroids, scale figures, statues, model kits, plushies, trading cards and anime
        stationery — at low-margin, bulk wholesale pricing.
      </p>
      <p style={{ color: "var(--color-ink-soft)", marginBottom: 24 }}>
        Partner with us for bulk pricing, a wide product range across anime toys and anime stationery, reliable
        supply and dedicated support. Apply below and our team will review your wholesale application.
      </p>

      <WholesaleForm />
    </div>
  );
}
