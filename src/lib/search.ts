import { connectDB } from "@/lib/db";
import Brand from "@/models/Brand";
import Category from "@/models/Category";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds a Mongo `$or` array for a free-text product search.
 *
 * We deliberately don't use MongoDB's `$text` operator here: `$text` only
 * matches whole, stemmed words, so a partial word or a typo (e.g. "narut"
 * for "naruto") returns zero results even though the product exists. That
 * made search feel broken. This instead does a case-insensitive
 * substring/prefix match across the product's own text fields, plus any
 * brand/category whose name matches, so a partial term, a typo-tolerant
 * near-match, or a brand/category name all find the right products.
 */
export async function buildProductSearchOr(rawQuery: string): Promise<Record<string, unknown>[]> {
  const term = rawQuery.trim();
  if (!term) return [];

  await connectDB();

  const words = term.split(/\s+/).filter(Boolean).map(escapeRegex);
  if (!words.length) return [];
  const combined = new RegExp(words.join("|"), "i");

  const [matchingBrands, matchingCategories] = await Promise.all([
    Brand.find({ name: combined }).select("_id").lean(),
    Category.find({ name: combined }).select("_id").lean(),
  ]);

  const or: Record<string, unknown>[] = [
    { name: combined },
    { description: combined },
    { shortDescription: combined },
    { tags: combined },
    { series: combined },
    { character: combined },
    { sku: combined },
  ];

  if (matchingBrands.length) or.push({ brand: { $in: matchingBrands.map((b) => b._id) } });
  if (matchingCategories.length) or.push({ category: { $in: matchingCategories.map((c) => c._id) } });

  return or;
}
