import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export const GUEST_CART_COOKIE = "atu_guest_cart";

/** Returns the current guest cart id from cookies, creating one if needed (via the response). */
export async function getOrCreateGuestId(): Promise<{ guestId: string; isNew: boolean }> {
  const store = await cookies();
  const existing = store.get(GUEST_CART_COOKIE)?.value;
  if (existing) return { guestId: existing, isNew: false };
  return { guestId: randomUUID(), isNew: true };
}
