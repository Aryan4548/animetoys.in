// Pure, dependency-free helpers derived from a product's raw stock fields.
//
// The Product model also declares `available` / `inventoryStatus` as
// Mongoose virtuals, but they don't come through reliably on
// `.lean({ virtuals: true })` reads in this Mongoose version — product
// cards were silently never marking anything out of stock, and the admin
// inventory status filter was silently matching nothing. Computing from
// the raw fields here sidesteps that instead of depending on it.
//
// Safe to import from client components (no mongoose/model imports), and
// reused server-side by lib/inventory.ts.
export type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER";

export function computeInventoryStatus(
  stock: number,
  reserved: number,
  lowStockThreshold: number,
  isPreorder: boolean
): InventoryStatus {
  if (isPreorder) return "PREORDER";
  const available = Math.max(0, stock - reserved);
  if (available <= 0) return "OUT_OF_STOCK";
  if (available <= lowStockThreshold) return "LOW_STOCK";
  return "IN_STOCK";
}
