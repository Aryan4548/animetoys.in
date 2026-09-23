import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <div className="container section" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, marginBottom: 18 }}>Shipping Policy</h1>
      <div style={{ fontSize: 14, lineHeight: 1.8, color: "var(--color-ink-soft)", display: "flex", flexDirection: "column", gap: 14 }}>
        <p>We process orders within 1–2 business days of confirmation. Preorder items ship separately once stock arrives, close to the listed release date.</p>
        <p>Domestic orders typically arrive within 3–7 business days. International shipping times vary by destination and customs processing.</p>
        <p>You will receive tracking information as soon as your order is shipped — you can also view it anytime from My Account → Orders.</p>
        <p>Import duties and taxes, where applicable, are the responsibility of the customer.</p>
      </div>
    </div>
  );
}
