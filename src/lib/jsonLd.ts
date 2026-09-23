/**
 * Safely serializes an object for embedding in a <script type="application/ld+json">
 * tag. Plain JSON.stringify does not escape "<", so admin-authored text
 * (e.g. a product description containing "</script>") could break out of
 * the script tag and inject markup. Escaping "<" to its unicode form
 * neutralizes that while remaining valid, parseable JSON.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
