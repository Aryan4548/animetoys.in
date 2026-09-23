"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface CartItemView {
  productId: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  regularPrice?: number;
  wholesalePrice?: number;
  wholesaleMoq?: number;
  wholesaleApplied?: boolean;
  quantity: number;
  stock: number;
  isPreorder: boolean;
}

interface CartContextValue {
  items: CartItemView[];
  count: number;
  subtotal: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  count: 0,
  subtotal: 0,
  loading: true,
  refresh: async () => {},
  addItem: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemView[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      await refresh();
    },
    [refresh]
  );

  const updateItem = useCallback(
    async (productId: string, quantity: number) => {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      await refresh();
    },
    [refresh]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
      await refresh();
    },
    [refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, loading, refresh, addItem, updateItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
