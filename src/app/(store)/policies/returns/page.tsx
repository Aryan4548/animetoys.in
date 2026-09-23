import type { Metadata } from "next";

export const metadata: Metadata = { title: "Return & Refund Policy" };

export default function ReturnsPolicyPage() {
  return (
    <div className="container section" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, marginBottom: 18 }}>Return &amp; Refund Policy</h1>
      <div style={{ fontSize: 14, lineHeight: 1.8, color: "var(--color-ink-soft)", display: "flex", flexDirection: "column", gap: 14 }}>
        <p>If your item arrives damaged or defective, contact us within 48 hours of delivery with photos of the item and packaging.</p>
        <p>Returns are accepted for eligible items within 7 days of delivery, provided the item is unused and in its original packaging.</p>
        <p>Preorder deposits are generally non-refundable once production/allocation has been confirmed, except where the item itself is defective.</p>
        <p>Approved refunds are processed to the original payment method within 5–10 business days.</p>
      </div>
    </div>
  );
}
