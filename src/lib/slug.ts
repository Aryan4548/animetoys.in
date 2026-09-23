import slugify from "slugify";

export function toSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true });
}

export async function uniqueSlug<T>(
  base: string,
  exists: (slug: string) => Promise<T | null>
): Promise<string> {
  const baseSlug = toSlug(base) || "item";
  let slug = baseSlug;
  let i = 2;
  while (await exists(slug)) {
    slug = `${baseSlug}-${i}`;
    i += 1;
  }
  return slug;
}
