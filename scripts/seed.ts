/**
 * Demo data seeder.
 *
 *   npm run seed
 *
 * Populates 8 categories, 9 brands and ~28 demo products (all flagged
 * isDemo: true) so the storefront and admin panel have something to look
 * at immediately after deployment. Safe to re-run — it clears out prior
 * demo records (isDemo: true) before reseeding, and never touches real
 * data an admin has since created.
 */
import { connectStandalone, disconnectStandalone } from "./db";
import Category from "../src/models/Category";
import Brand from "../src/models/Brand";
import Product from "../src/models/Product";
import { toSlug } from "../src/lib/slug";

const CATEGORIES = [
  "Action Figures",
  "Nendoroid",
  "Scale Figures",
  "Statues",
  "Model Kits",
  "Plushies",
  "Trading Cards",
  "Accessories",
  "Anime Stationery",
];

const BRANDS = [
  "Good Smile Company",
  "Bandai",
  "Kotobukiya",
  "Banpresto",
  "MegaHouse",
  "Aniplex",
  "Sega",
  "Union Creative",
  "Taito",
];

interface DemoProduct {
  name: string;
  category: string;
  brand: string;
  series: string;
  character: string;
  price: number;
  mrp: number;
  stock: number;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  isPreorder?: boolean;
  daysUntilRelease?: number;
}

const PRODUCTS: DemoProduct[] = [
  { name: "Satoru Gojo — Scale Figure", category: "Scale Figures", brand: "Good Smile Company", series: "Jujutsu Kaisen", character: "Satoru Gojo", price: 12999, mrp: 15999, stock: 14, featured: true, newArrival: true },
  { name: "Luffy Gear 5 — Figure", category: "Scale Figures", brand: "Bandai", series: "One Piece", character: "Monkey D. Luffy", price: 8999, mrp: 10999, stock: 0, newArrival: true, isPreorder: true, daysUntilRelease: 60 },
  { name: "Tanjiro Kamado — Figure", category: "Action Figures", brand: "Banpresto", series: "Demon Slayer", character: "Tanjiro Kamado", price: 7499, mrp: 8999, stock: 20, newArrival: true },
  { name: "Pikachu — Cute Figure", category: "Plushies", brand: "Sega", series: "Pokémon", character: "Pikachu", price: 4999, mrp: 5999, stock: 32, bestSeller: true },
  { name: "Chainsaw Man — Statue", category: "Statues", brand: "Union Creative", series: "Chainsaw Man", character: "Denji", price: 11999, mrp: 13999, stock: 6, newArrival: true, featured: true },
  { name: "Nezuko Kamado — Nendoroid", category: "Nendoroid", brand: "Good Smile Company", series: "Demon Slayer", character: "Nezuko Kamado", price: 5499, mrp: 6499, stock: 25, bestSeller: true },
  { name: "Zenitsu Agatsuma — Figure", category: "Action Figures", brand: "Banpresto", series: "Demon Slayer", character: "Zenitsu Agatsuma", price: 6499, mrp: 7499, stock: 18 },
  { name: "Itadori Yuji — Scale Figure", category: "Scale Figures", brand: "Good Smile Company", series: "Jujutsu Kaisen", character: "Yuji Itadori", price: 13999, mrp: 16999, stock: 9, featured: true },
  { name: "Eren Yeager — Statue", category: "Statues", brand: "Kotobukiya", series: "Attack on Titan", character: "Eren Yeager", price: 15999, mrp: 18999, stock: 5 },
  { name: "Levi Ackerman — Figure", category: "Action Figures", brand: "Bandai", series: "Attack on Titan", character: "Levi Ackerman", price: 8499, mrp: 9999, stock: 12, bestSeller: true },
  { name: "Izuku Midoriya — Nendoroid", category: "Nendoroid", brand: "Good Smile Company", series: "My Hero Academia", character: "Izuku Midoriya", price: 5299, mrp: 6299, stock: 22 },
  { name: "Katsuki Bakugo — Figure", category: "Action Figures", brand: "Banpresto", series: "My Hero Academia", character: "Katsuki Bakugo", price: 6999, mrp: 7999, stock: 15 },
  { name: "Sasuke Uchiha — Scale Figure", category: "Scale Figures", brand: "MegaHouse", series: "Naruto Shippuden", character: "Sasuke Uchiha", price: 14999, mrp: 17999, stock: 0, isPreorder: true, daysUntilRelease: 90 },
  { name: "Naruto Uzumaki — Statue", category: "Statues", brand: "MegaHouse", series: "Naruto Shippuden", character: "Naruto Uzumaki", price: 16999, mrp: 19999, stock: 4, featured: true },
  { name: "Son Goku — Scale Figure", category: "Scale Figures", brand: "Bandai", series: "Dragon Ball Z", character: "Son Goku", price: 13499, mrp: 15999, stock: 11, bestSeller: true },
  { name: "Vegeta — Statue", category: "Statues", brand: "MegaHouse", series: "Dragon Ball Z", character: "Vegeta", price: 17999, mrp: 20999, stock: 3 },
  { name: "Hatsune Miku — Nendoroid", category: "Nendoroid", brand: "Good Smile Company", series: "Vocaloid", character: "Hatsune Miku", price: 4999, mrp: 5999, stock: 40, bestSeller: true, featured: true },
  { name: "Rem — Scale Figure", category: "Scale Figures", brand: "Kotobukiya", series: "Re:Zero", character: "Rem", price: 12499, mrp: 14999, stock: 7, newArrival: true },
  { name: "Zero Two — Figure", category: "Action Figures", brand: "Union Creative", series: "Darling in the Franxx", character: "Zero Two", price: 9999, mrp: 11999, stock: 0, isPreorder: true, daysUntilRelease: 45 },
  { name: "Sailor Moon — Figure", category: "Action Figures", brand: "Bandai", series: "Sailor Moon", character: "Usagi Tsukino", price: 7999, mrp: 9499, stock: 16 },
  { name: "Killua Zoldyck — Nendoroid", category: "Nendoroid", brand: "Good Smile Company", series: "Hunter x Hunter", character: "Killua Zoldyck", price: 5199, mrp: 6199, stock: 19 },
  { name: "Gon Freecss — Figure", category: "Action Figures", brand: "Banpresto", series: "Hunter x Hunter", character: "Gon Freecss", price: 6799, mrp: 7999, stock: 13 },
  { name: "Edward Elric — Scale Figure", category: "Scale Figures", brand: "Kotobukiya", series: "Fullmetal Alchemist", character: "Edward Elric", price: 13999, mrp: 16499, stock: 8, newArrival: true },
  { name: "L Lawliet — Figure", category: "Action Figures", brand: "MegaHouse", series: "Death Note", character: "L", price: 8999, mrp: 10499, stock: 10 },
  { name: "Ichigo Kurosaki — Statue", category: "Statues", brand: "Bandai", series: "Bleach", character: "Ichigo Kurosaki", price: 15499, mrp: 18499, stock: 6, bestSeller: true },
  { name: "Roronoa Zoro — Scale Figure", category: "Scale Figures", brand: "MegaHouse", series: "One Piece", character: "Roronoa Zoro", price: 14499, mrp: 16999, stock: 9, featured: true },
  { name: "Gundam RX-78-2 — Model Kit", category: "Model Kits", brand: "Bandai", series: "Mobile Suit Gundam", character: "RX-78-2 Gundam", price: 3499, mrp: 3999, stock: 50, bestSeller: true },
  { name: "Attack Titan — Model Kit", category: "Model Kits", brand: "Bandai", series: "Attack on Titan", character: "Attack Titan", price: 4499, mrp: 4999, stock: 28 },
  { name: "One Piece — Trading Card Booster Box", category: "Trading Cards", brand: "Bandai", series: "One Piece", character: "", price: 5999, mrp: 6499, stock: 35, newArrival: true },
  { name: "Demon Slayer Acrylic Keychain Set", category: "Accessories", brand: "Aniplex", series: "Demon Slayer", character: "", price: 1499, mrp: 1799, stock: 60 },
  { name: "Totoro — Plushie", category: "Plushies", brand: "Taito", series: "My Neighbor Totoro", character: "Totoro", price: 2999, mrp: 3499, stock: 45, bestSeller: true },
  { name: "Demon Slayer Acrylic Notebook & Stationery Set", category: "Anime Stationery", brand: "Aniplex", series: "Demon Slayer", character: "", price: 699, mrp: 899, stock: 80, newArrival: true },
  { name: "One Piece Sticker Pack (50 pcs)", category: "Anime Stationery", brand: "Bandai", series: "One Piece", character: "", price: 249, mrp: 349, stock: 150, bestSeller: true },
  { name: "Jujutsu Kaisen Pen & Pencil Set", category: "Anime Stationery", brand: "Banpresto", series: "Jujutsu Kaisen", character: "", price: 499, mrp: 649, stock: 60 },
  { name: "Attack on Titan Acrylic Keychain & Stationery Bundle", category: "Anime Stationery", brand: "Kotobukiya", series: "Attack on Titan", character: "", price: 599, mrp: 799, stock: 55, newArrival: true },
];

async function main() {
  await connectStandalone();

  console.log("Clearing previous demo data...");
  const demoProducts = await Product.find({ isDemo: true }).select("_id");
  await Product.deleteMany({ isDemo: true });
  console.log(`  removed ${demoProducts.length} demo products`);

  console.log("\nSeeding categories...");
  const categoryMap = new Map<string, string>();
  for (const [i, name] of CATEGORIES.entries()) {
    const slug = toSlug(name);
    const category = await Category.findOneAndUpdate(
      { slug },
      { name, slug, sortOrder: i, isActive: true, featured: true },
      { upsert: true, new: true }
    );
    categoryMap.set(name, String(category._id));
  }
  console.log(`  ${CATEGORIES.length} categories ready`);

  console.log("\nSeeding brands...");
  const brandMap = new Map<string, string>();
  for (const name of BRANDS) {
    const slug = toSlug(name);
    const brand = await Brand.findOneAndUpdate({ slug }, { name, slug, isActive: true }, { upsert: true, new: true });
    brandMap.set(name, String(brand._id));
  }
  console.log(`  ${BRANDS.length} brands ready`);

  console.log("\nSeeding products...");
  let created = 0;
  for (const p of PRODUCTS) {
    const slug = toSlug(p.name);
    const sku = `DEMO-${slug.toUpperCase().replace(/-/g, "").slice(0, 10)}-${created + 1}`;
    const now = new Date();
    const releaseDate = p.isPreorder && p.daysUntilRelease ? new Date(now.getTime() + p.daysUntilRelease * 86400000) : undefined;
    const preorderClosingDate = p.isPreorder && p.daysUntilRelease ? new Date(now.getTime() + (p.daysUntilRelease - 10) * 86400000) : undefined;

    await Product.create({
      name: p.name,
      sku,
      slug,
      description: `Official ${p.brand} release from ${p.series}. A must-have addition to any collector's shelf — 100% authentic, carefully packaged for worldwide shipping.`,
      shortDescription: `${p.series} — ${p.character || p.name}`,
      brand: brandMap.get(p.brand),
      category: categoryMap.get(p.category),
      series: p.series,
      character: p.character || undefined,
      price: p.price,
      mrp: p.mrp,
      costPrice: Math.round(p.price * 0.6),
      stock: p.stock,
      lowStockThreshold: 5,
      images: ["/placeholder-product.svg"],
      tags: [p.series, p.category].filter(Boolean),
      featured: !!p.featured,
      newArrival: !!p.newArrival,
      bestSeller: !!p.bestSeller,
      isPreorder: !!p.isPreorder,
      releaseDate,
      preorderClosingDate,
      status: "published",
      isDemo: true,
    });
    created += 1;
  }
  console.log(`  ${created} demo products created`);

  console.log("\n✔ Seed complete. All seeded products are flagged isDemo: true.\n");

  await disconnectStandalone();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
