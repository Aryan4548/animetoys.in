// Single source of truth for the business's real-world contact details
// (its "NAP" — Name, Address, Phone — in SEO terms). Keeping this in one
// place and importing it everywhere (footer, contact page, about page,
// structured data) keeps those details consistent site-wide, which search
// engines weight when deciding whether a local/wholesale business listing
// is trustworthy.
export const SITE_INFO = {
  legalName: "NemeIndia",
  brandName: "Anime & Toy Universe",
  tagline: "Wholesale, Gifts & Toys",
  phoneDisplay: "+91 70212 22062",
  phoneHref: "+917021222062",
  email: "NemeIndia@gmail.com",
  instagramUrl: "https://www.instagram.com/anime_toy_universe?utm_source=qr&stkn=Z3I2ejU1NWJ6d21x",
  whatsappUrl: "https://chat.whatsapp.com/GLImAypoKmzGiD0TvuDsRw",
  address: {
    line1: "404, Super Shopping Complex",
    line2: "249 Abdul Rehman Street, Ground Floor",
    city: "Mumbai",
    postalCode: "400003",
    state: "Maharashtra",
    country: "India",
  },
} as const;

export const SITE_ADDRESS_ONE_LINE = `${SITE_INFO.address.line1}, ${SITE_INFO.address.line2}, ${SITE_INFO.address.city} - ${SITE_INFO.address.postalCode}`;
