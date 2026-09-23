// Dual pricing: every product has a regular single-piece price, and can
// optionally have a wholesale price that automatically applies once a
// customer's quantity for that product reaches the wholesale MOQ
// (minimum order quantity). No account approval is required — this is
// separate from the Phase 2 approved-wholesaler tiered pricing
// (WholesalePrice / WholesaleApplication models), which stays as-is for
// B2B accounts with custom per-partner tiers.

export interface PricedProduct {
  price: number;
  wholesalePrice?: number | null;
  wholesaleMoq?: number | null;
}

/** True once both a wholesale price and MOQ are configured for the product. */
export function hasWholesalePricing(product: PricedProduct): boolean {
  return !!(product.wholesalePrice && product.wholesaleMoq && product.wholesaleMoq > 1);
}

/** True when the given quantity is enough to unlock the wholesale price. */
export function isWholesaleApplied(product: PricedProduct, quantity: number): boolean {
  return hasWholesalePricing(product) && quantity >= (product.wholesaleMoq as number);
}

/** The unit price that applies for a given quantity of this product. */
export function getUnitPrice(product: PricedProduct, quantity: number): number {
  return isWholesaleApplied(product, quantity) ? (product.wholesalePrice as number) : product.price;
}

/**
 * Percentage off MRP, rounded to the nearest whole number. Computed here
 * from the raw mrp/price fields rather than trusting the Product model's
 * `discountPercent` virtual — that virtual isn't coming through reliably
 * on `.lean({ virtuals: true })` reads across the app (product cards and
 * the product detail page were both silently dropping the "% off" badge),
 * and this is a cheap, dependency-free way to sidestep that entirely.
 */
export function getDiscountPercent(mrp: number, price: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
