import { SITE_INFO } from "@/lib/siteInfo";

/**
 * Rendered in place of the normal page content by src/app/(store)/layout.tsx
 * when the visitor's IP matches a BlockedIp record — every storefront route
 * shows this instead of its usual content, while the header/footer chrome
 * stays intact.
 */
export default function BlockedNotice({ reason }: { reason?: string | null }) {
  return (
    <div style={{ minHeight: "55vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px" }}>
      <div className="card" style={{ maxWidth: 440, padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">
          🚫
        </div>
        <h1 style={{ fontSize: 20, marginBottom: 8, textTransform: "none" }}>You&apos;ve been blocked</h1>
        <p style={{ fontSize: 14, color: "var(--color-ink-soft)", marginBottom: reason ? 6 : 16 }}>
          Access to {SITE_INFO.brandName} has been restricted from your network.
        </p>
        {reason && (
          <p style={{ fontSize: 13, color: "var(--color-ink-soft)", marginBottom: 16 }}>
            <strong>Reason:</strong> {reason}
          </p>
        )}
        <p style={{ fontSize: 14 }}>
          Think this is a mistake?{" "}
          <a href={`mailto:${SITE_INFO.email}`} style={{ color: "var(--color-accent-blue)", fontWeight: 700 }}>
            Contact support
          </a>{" "}
          to request an unblock.
        </p>
      </div>
    </div>
  );
}
