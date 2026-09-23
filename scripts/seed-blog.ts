/**
 * SEO blog content seeder.
 *
 *   npm run seed:blog
 *
 * Publishes a small set of keyword-targeted blog posts (wholesale anime
 * toys, wholesale anime stationery, general anime figures buying guides)
 * so the site has real, indexable long-form content behind those search
 * terms — not just product/category pages. Upserts by slug, so it's safe
 * to re-run after editing the copy below; it never touches posts an admin
 * has written through the admin panel under a different slug.
 */
import { connectStandalone, disconnectStandalone } from "./db";
import BlogPost from "../src/models/BlogPost";
import { toSlug } from "../src/lib/slug";

interface SeedPost {
  title: string;
  excerpt: string;
  tags: string[];
  content: string;
}

const POSTS: SeedPost[] = [
  {
    title: "Buy Anime Figures Wholesale in India: A Guide for Retailers & Resellers",
    tags: ["wholesale", "anime figures", "anime toys", "India"],
    excerpt:
      "How retailers and online resellers in India (and worldwide) can source wholesale anime toys and figures — MOQs, pricing, and what to look for in a supplier.",
    content: `If you run a gift shop, collectibles store, or online reselling business, anime toys and figures are one of the fastest-growing categories to stock. Demand for Nendoroids, scale figures, statues, model kits and plushies has grown steadily across India as anime fandom has gone mainstream — but sourcing genuine, original stock at prices that leave room for retail margin is the hard part.

Anime & Toy Universe is a wholesale anime toys supplier based in Mumbai, India. We supply retailers, online resellers and gift shops with 100% original merchandise across every major category: action figures, Nendoroids, scale figures, statues, Gundam and other model kits, plushies, trading cards and anime stationery — all at low-margin, bulk wholesale pricing designed for resale, not collector pricing.

What to look for in a wholesale anime toys supplier

Authenticity matters most. The anime figure market has a real counterfeit problem — bootleg Nendoroids and scale figures are common, and selling them (even unknowingly) damages a retailer's reputation and can create real legal risk. Always confirm a supplier deals in 100% original, officially licensed merchandise from brands like Good Smile Company, Bandai, Kotobukiya, Banpresto, MegaHouse and Aniplex.

Minimum order quantities and pricing tiers should be clear upfront, not negotiated case-by-case. A good wholesale partner publishes (or shares on request) bulk pricing that scales with your order volume, so you can plan margins before you commit.

Range matters too. A retailer who can offer action figures, statues, plushies, trading cards and anime stationery from one supplier — instead of juggling five different vendors — saves significantly on shipping, coordination and stock management.

How to get started

Retailers and resellers — in India or internationally — can apply for a wholesale account with Anime & Toy Universe directly on our wholesale page. We review every application and respond with pricing and next steps. Whether you're opening a new collectibles corner in an existing gift shop or building a dedicated online anime toys storefront, we supply the stock to back it.`,
  },
  {
    title: "Anime Stationery Wholesale: What Retailers Should Stock in 2026",
    tags: ["wholesale", "anime stationery", "anime merchandise", "retail"],
    excerpt:
      "Anime stationery — keychains, stickers, notebooks and pen sets — sells fast and moves inventory quickly. Here's what wholesale buyers should know before stocking it.",
    content: `Anime figures get most of the attention, but anime stationery is often the higher-velocity category for retailers — lower price points mean more frequent, lower-friction purchases, and stationery is a natural add-on sale next to figures, plushies and trading cards.

Why anime stationery works for retail

Anime stationery — acrylic keychains, sticker packs, notebooks, pens and pencil sets, and small accessory bundles — typically sells in the ₹200–₹900 range, well below scale figures or statues. That makes it an easy impulse purchase for shoppers who came in for something else, and an accessible entry point for younger or budget-conscious anime fans who aren't yet buying ₹10,000+ figures.

It also turns over faster than higher-ticket items, which keeps cash flow healthier for a retail or reseller business — stationery restocks in weeks, not months.

What's worth stocking

The strongest sellers tend to follow whichever series is currently trending — Demon Slayer, One Piece, Jujutsu Kaisen and Attack on Titan stationery consistently move well — paired with evergreen sellers like Pokémon and Studio Ghibli titles that sell steadily year-round regardless of what's airing.

Sourcing wholesale anime stationery

As with figures, the real risk in anime stationery is counterfeit and unlicensed stock — it's a category flooded with knockoffs precisely because the margins tempt low-quality suppliers. Anime & Toy Universe supplies wholesale anime stationery alongside our full range of anime toys and figures, all 100% original merchandise, from our Mumbai base — so retailers can order stationery and figures together from a single wholesale account rather than sourcing them separately.

If you already stock anime figures and want to add a fast-moving, low-price-point category alongside them, or you're starting a stationery-focused storefront from scratch, apply for a wholesale account on our wholesale page and our team will get back to you with pricing.`,
  },
  {
    title: "Nendoroid vs Scale Figure vs Statue: Which Anime Figures Sell Best?",
    tags: ["anime figures", "buying guide", "Nendoroid", "scale figure"],
    excerpt:
      "A plain-language guide to the difference between Nendoroids, scale figures and statues — what they cost, who buys them, and which ones to stock first.",
    content: `New to anime toys and figures, or trying to decide which categories to stock first? Here's the difference between the three most common figure types, in plain terms.

Nendoroids

Nendoroids are small (roughly 10cm), chibi-style figures with interchangeable faces, hands and accessories — Good Smile Company's signature line. They're the most affordable and most collected figure type, usually priced from around ₹4,500–₹6,500. Because they're relatively cheap, highly customizable and instantly recognizable, Nendoroids are usually the best entry point for a new anime toys retailer — broad appeal, frequent releases, and steady demand.

Scale figures

Scale figures are built to a fixed proportion of the character's "real" height (commonly 1/7 or 1/8 scale) and aim for realistic detail and pose rather than a cute chibi style. They cost more — typically ₹8,000–₹18,000 — and appeal to more serious, established collectors rather than casual buyers. Scale figures carry a higher price tag per unit, but move more slowly and need buyers who already know the character and series well.

Statues

Statues sit at the top of the range — larger, more detailed, often limited-run pieces from brands like Kotobukiya and MegaHouse, frequently priced ₹15,000 and up. They're a lower-volume, higher-margin-per-unit category best suited to retailers with an established collector customer base rather than a general gift shop audience.

Which should you stock first?

For a retailer or reseller just getting started with anime toys, Nendoroids and mid-range action figures offer the best combination of affordability, broad appeal and manageable capital outlay. Scale figures and statues are worth adding once you have a sense of which series and characters your customers actually collect — they're a bigger bet per unit.

Anime & Toy Universe supplies all three categories — Nendoroids, scale figures and statues — plus action figures, model kits, plushies, trading cards and anime stationery, wholesale to retailers and resellers from our Mumbai base. Apply for a wholesale account on our wholesale page to get started.`,
  },
];

async function main() {
  await connectStandalone();

  console.log("Publishing SEO blog posts...");
  for (const post of POSTS) {
    const slug = toSlug(post.title);
    await BlogPost.findOneAndUpdate(
      { slug },
      {
        title: post.title,
        slug,
        excerpt: post.excerpt,
        content: post.content,
        author: "Anime & Toy Universe",
        tags: post.tags,
        status: "published",
        publishedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`  ✔ ${post.title}`);
  }

  console.log(`\n${POSTS.length} blog posts published.\n`);

  await disconnectStandalone();
  process.exit(0);
}

main().catch((err) => {
  console.error("Blog seeding failed:", err);
  process.exit(1);
});
