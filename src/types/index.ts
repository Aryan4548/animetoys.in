export interface ProductListItem {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  mrp: number;
  wholesalePrice?: number;
  wholesaleMoq?: number;
  discountPercent?: number;
  images: string[];
  stock: number;
  reserved: number;
  available?: number;
  lowStockThreshold: number;
  inventoryStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER";
  isPreorder: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  featured: boolean;
  brand?: { _id: string; name: string; slug: string } | null;
  category?: { _id: string; name: string; slug: string } | null;
  series?: string;
  character?: string;
}

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  featured: boolean;
}

export interface BrandItem {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}
