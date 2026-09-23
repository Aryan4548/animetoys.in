import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { SITE_INFO, SITE_ADDRESS_ONE_LINE } from "@/lib/siteInfo";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${SITE_INFO.brandName} (${SITE_INFO.legalName}), a wholesale supplier of anime figures, gifts and toys based in Mumbai. Call ${SITE_INFO.phoneDisplay}, email ${SITE_INFO.email}, or visit us at ${SITE_ADDRESS_ONE_LINE}.`,
};

export default function ContactPage() {
  return (
    <div className="container section" style={{ maxWidth: 560 }}>
      <div className="section-eyebrow">Get in Touch</div>
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>Contact Us</h1>
      <p style={{ fontSize: 14, color: "var(--color-ink-soft)", lineHeight: 1.7, marginBottom: 24 }}>
        Have a question about an order, a product, or want to talk wholesale pricing? Reach us directly, or send a
        message below and our team will get back to you shortly.
      </p>

      <div className="card" style={{ padding: 20, marginBottom: 28, display: "grid", gap: 14 }}>
        <div>
          <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-ink-soft)" }}>
            Phone
          </strong>
          <p style={{ fontSize: 15, marginTop: 2 }}>
            <a href={`tel:${SITE_INFO.phoneHref}`}>{SITE_INFO.phoneDisplay}</a>
          </p>
        </div>
        <div>
          <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-ink-soft)" }}>
            Email
          </strong>
          <p style={{ fontSize: 15, marginTop: 2 }}>
            <a href={`mailto:${SITE_INFO.email}`}>{SITE_INFO.email}</a>
          </p>
        </div>
        <div>
          <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-ink-soft)" }}>
            Address
          </strong>
          <p style={{ fontSize: 15, marginTop: 2, lineHeight: 1.6 }}>
            {SITE_INFO.address.line1}, {SITE_INFO.address.line2}
            <br />
            {SITE_INFO.address.city} - {SITE_INFO.address.postalCode}, {SITE_INFO.address.state}, {SITE_INFO.address.country}
          </p>
        </div>
      </div>

      <ContactForm />
    </div>
  );
}
