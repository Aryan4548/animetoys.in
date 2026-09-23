import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { safeJsonLd } from "@/lib/jsonLd";
import { SITE_INFO } from "@/lib/siteInfo";

// A bold, rounded display face for the logo wordmark, nav and headings —
// matches the friendly/premium collector-brand look. Loaded only for the
// weights actually used, with `display: "swap"` so text never blocks on the
// font. Requires network access at build/dev time to fetch from Google
// Fonts — fine on a normal machine or VPS, just not inside network-locked
// CI sandboxes. Body copy stays on the fast system font stack (below) for
// readability and to keep most of the page's text weight-free.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Anime & Toy Universe — Good Toys, Brighter Days",
    template: "%s | Anime & Toy Universe",
  },
  description:
    "Anime & Toy Universe (by NemeIndia) is a leading wholesale supplier of anime figures, gifts and toys, operating from Mumbai. 100% original merchandise, low-margin pricing for retailers and resellers, and worldwide shipping.",
  openGraph: {
    type: "website",
    siteName: "Anime & Toy Universe",
    title: "Anime & Toy Universe — Good Toys, Brighter Days",
    description:
      "Wholesale supplier of anime figures, gifts and toys, operating from Mumbai. 100% original merchandise at low-margin, competitive pricing.",
  },
  // Proves ownership of animetoys.in to Google Search Console (renders as
  // <meta name="google-site-verification" content="..." /> in <head>) so
  // the sitemap can be submitted and indexing can be requested.
  verification: {
    google: "RXu63xU2Ybv7qUd4-094QRLYV_2Rf2CrriEVuert2W4",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_INFO.brandName,
  alternateName: SITE_INFO.legalName,
  description:
    "Wholesale supplier of anime figures, gifts and toys operating from Mumbai, India — supplying retailers and resellers with 100% original merchandise at competitive, low-margin pricing.",
  url: siteUrl,
  logo: `${siteUrl}/logo-mark.svg`,
  email: SITE_INFO.email,
  telephone: SITE_INFO.phoneHref,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${SITE_INFO.address.line1}, ${SITE_INFO.address.line2}`,
    addressLocality: SITE_INFO.address.city,
    addressRegion: SITE_INFO.address.state,
    postalCode: SITE_INFO.address.postalCode,
    addressCountry: "IN",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: SITE_INFO.phoneHref,
      email: SITE_INFO.email,
      areaServed: "IN",
    },
  ],
  sameAs: [SITE_INFO.instagramUrl],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        {/* eslint-disable-next-line react/no-danger */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
