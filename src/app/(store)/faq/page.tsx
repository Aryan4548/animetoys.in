import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ" };

const FAQS = [
  { q: "Are all products 100% original?", a: "Yes, every item we sell is authentic and sourced through licensed/trusted channels." },
  { q: "Do you ship internationally?", a: "Yes, we ship worldwide. Shipping fees and times vary by destination." },
  { q: "How do preorders work?", a: "Preorder items are charged at checkout and shipped once stock arrives from Japan, around the listed release date." },
  { q: "What is your return policy?", a: "See our Return & Refund Policy page for full details on eligibility and process." },
  { q: "How can I track my order?", a: "Once shipped, tracking details appear on your Orders page in My Account." },
  { q: "Can I become a wholesale partner?", a: "Yes — apply on our Wholesale page and our team will review your application." },
];

export default function FaqPage() {
  return (
    <div className="container section" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>Frequently Asked Questions</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {FAQS.map((f) => (
          <details key={f.q} className="card" style={{ padding: 16 }}>
            <summary style={{ fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{f.q}</summary>
            <p style={{ fontSize: 13, color: "var(--color-ink-soft)", marginTop: 10, lineHeight: 1.7 }}>{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
