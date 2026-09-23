import { cookies } from "next/headers";
import Cart, { type ICartItem } from "@/models/Cart";
import { GUEST_CART_COOKIE } from "@/lib/guestCart";

/** Merges the guest cart (if any) into the now-authenticated user's cart, then clears the guest cookie. */
export async function mergeGuestCartIntoUser(userId: string) {
  const store = await cookies();
  const guestId = store.get(GUEST_CART_COOKIE)?.value;
  if (!guestId) return;

  const guestCart = await Cart.findOne({ guestId });
  if (!guestCart || guestCart.items.length === 0) {
    if (guestCart) await guestCart.deleteOne();
    return;
  }

  let userCart = await Cart.findOne({ user: userId });
  if (!userCart) userCart = await Cart.create({ user: userId, items: [] });

  for (const guestItem of guestCart.items) {
    const existing = userCart.items.find((i: ICartItem) => String(i.product) === String(guestItem.product));
    if (existing) {
      existing.quantity += guestItem.quantity;
    } else {
      // Push a plain object, not the guest cart's own subdocument instance —
      // a Mongoose subdocument carries a reference back to its original
      // parent array, and reusing that instance across two parent documents
      // (guestCart and userCart) is unsafe once guestCart is deleted below.
      userCart.items.push({
        product: guestItem.product,
        quantity: guestItem.quantity,
        priceAtAdd: guestItem.priceAtAdd,
      });
    }
  }

  await userCart.save();
  await guestCart.deleteOne();
}
