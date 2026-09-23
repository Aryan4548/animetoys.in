// A product counts as a "new arrival" either because an admin has
// explicitly flagged it (Product.newArrival), or simply because it was
// added recently — so every newly added product shows up under New
// Arrivals automatically, with no extra step required in the admin panel.
// The manual flag still works too, as a way to keep an older product
// pinned there on purpose.
export const NEW_ARRIVAL_WINDOW_DAYS = 30;

export function newArrivalSince(): Date {
  const since = new Date();
  since.setDate(since.getDate() - NEW_ARRIVAL_WINDOW_DAYS);
  return since;
}
