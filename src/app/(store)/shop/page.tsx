import { Suspense } from "react";
import type { Metadata } from "next";
import ShopBrowser from "./ShopBrowser";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse anime figures, Nendoroids, scale figures, statues, model kits, plushies and more.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>Loading...</div>}>
      <ShopBrowser />
    </Suspense>
  );
}
