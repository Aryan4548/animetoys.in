"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NEW_ARRIVAL_WINDOW_DAYS } from "@/lib/newArrival";

interface OptionItem {
  _id: string;
  name: string;
}

interface ProductFormValues {
  name: string;
  sku: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  brand?: string;
  category?: string;
  series?: string;
  character?: string;
  price: number;
  mrp: number;
  costPrice?: number;
  wholesalePrice?: number;
  wholesaleMoq?: number;
  stock: number;
  lowStockThreshold: number;
  weight?: number;
  images: string[];
  tags: string[];
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  isPreorder: boolean;
  releaseDate?: string;
  preorderClosingDate?: string;
  status: "draft" | "published" | "archived";
}

const emptyValues: ProductFormValues = {
  name: "",
  sku: "",
  description: "",
  shortDescription: "",
  brand: "",
  category: "",
  series: "",
  character: "",
  price: 0,
  mrp: 0,
  costPrice: undefined,
  wholesalePrice: undefined,
  wholesaleMoq: undefined,
  stock: 0,
  lowStockThreshold: 5,
  weight: undefined,
  images: [],
  tags: [],
  featured: false,
  newArrival: false,
  bestSeller: false,
  isPreorder: false,
  releaseDate: "",
  preorderClosingDate: "",
  status: "draft",
};

export default function ProductForm({
  productId,
  initialValues,
}: {
  productId?: string;
  initialValues?: Partial<ProductFormValues>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValues>({ ...emptyValues, ...initialValues });
  const [categories, setCategories] = useState<OptionItem[]>([]);
  const [brands, setBrands] = useState<OptionItem[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/categories?admin=true").then((r) => r.json()),
      fetch("/api/brands?admin=true").then((r) => r.json()),
    ]).then(([c, b]) => {
      setCategories(c.categories || []);
      setBrands(b.brands || []);
    });
  }, []);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("category", "products");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok) uploaded.push(data.url);
      }
      set("images", [...form.images, ...uploaded]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(url: string) {
    set(
      "images",
      form.images.filter((i) => i !== url)
    );
  }

  // The first entry in `images` is treated as the primary/thumbnail image
  // everywhere else in the app (product card, cart, orders, meta tags), so
  // "starring" an image just moves it to the front of the array.
  function setPrimaryImage(url: string) {
    set("images", [url, ...form.images.filter((i) => i !== url)]);
  }

  function addTag() {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      set("tags", [...form.tags, tagInput.trim()]);
    }
    setTagInput("");
  }

  async function handleSubmit(e: React.FormEvent, statusOverride?: ProductFormValues["status"]) {
    e.preventDefault();
    setError("");
    if (!!form.wholesalePrice !== !!form.wholesaleMoq) {
      setError("Set both wholesale price and MOQ, or leave both blank.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, status: statusOverride || form.status };
      const res = await fetch(productId ? `/api/products/${productId}` : "/api/products", {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save product.");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <div className="grid-2to1">
        <div>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, marginBottom: 14 }}>General</h2>
            <div className="form-field">
              <label>Product Name</label>
              <input required value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="grid-2col">
              <div className="form-field">
                <label>SKU</label>
                <input required value={form.sku} onChange={(e) => set("sku", e.target.value.toUpperCase())} />
              </div>
              <div className="form-field">
                <label>Slug (optional)</label>
                <input value={form.slug || ""} onChange={(e) => set("slug", e.target.value)} placeholder="auto-generated from name" />
              </div>
            </div>
            <div className="form-field">
              <label>Short Description</label>
              <input value={form.shortDescription || ""} onChange={(e) => set("shortDescription", e.target.value)} maxLength={500} />
            </div>
            <div className="form-field">
              <label>Description</label>
              <textarea rows={6} value={form.description || ""} onChange={(e) => set("description", e.target.value)} />
            </div>
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, marginBottom: 4 }}>Images</h2>
            <p style={{ fontSize: 12, color: "var(--color-ink-soft)", marginBottom: 12 }}>
              Click the star on an image to make it the primary image shown on the product card, cart, and search results.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              {form.images.map((img, i) => {
                const isPrimary = i === 0;
                return (
                  <div
                    key={img}
                    style={{
                      position: "relative",
                      width: 84,
                      height: 84,
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#f1f0ec",
                      outline: isPrimary ? "2px solid var(--color-accent, #d4a017)" : "none",
                      outlineOffset: 2,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(img)}
                      title={isPrimary ? "Primary image" : "Set as primary image"}
                      disabled={isPrimary}
                      style={{
                        position: "absolute",
                        top: 2,
                        left: 2,
                        background: "rgba(0,0,0,0.6)",
                        color: isPrimary ? "#ffd23f" : "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                        cursor: isPrimary ? "default" : "pointer",
                        fontSize: 12,
                        lineHeight: 1,
                      }}
                    >
                      {isPrimary ? "★" : "☆"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(img)}
                      title="Remove image"
                      style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 11 }}
                    >
                      ×
                    </button>
                    {isPrimary && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: 700,
                          textAlign: "center",
                          letterSpacing: 0.4,
                          padding: "2px 0",
                        }}
                      >
                        PRIMARY
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={handleImageUpload} disabled={uploading} />
            {uploading && <p style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>Uploading...</p>}
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, marginBottom: 14 }}>Pricing &amp; Stock</h2>
            <div className="grid-3col">
              <div className="form-field">
                <label>Price (₹)</label>
                <input type="number" min={0} required value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>MRP (₹)</label>
                <input type="number" min={0} required value={form.mrp} onChange={(e) => set("mrp", Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Cost Price (₹)</label>
                <input type="number" min={0} value={form.costPrice ?? ""} onChange={(e) => set("costPrice", e.target.value ? Number(e.target.value) : undefined)} />
              </div>
              <div className="form-field">
                <label>Stock</label>
                <input type="number" min={0} required value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Low Stock Threshold</label>
                <input type="number" min={0} value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Weight (g)</label>
                <input type="number" min={0} value={form.weight ?? ""} onChange={(e) => set("weight", e.target.value ? Number(e.target.value) : undefined)} />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, marginBottom: 6 }}>Wholesale Pricing</h2>
            <p style={{ fontSize: 12, color: "var(--color-ink-soft)", marginBottom: 14 }}>
              Optional. Shown publicly alongside the single-piece price — once a buyer&apos;s quantity for this
              product reaches the MOQ, the wholesale price is charged automatically. Leave both blank for no
              wholesale tier on this product.
            </p>
            <div className="grid-2col">
              <div className="form-field">
                <label>Wholesale Price (₹ / pc)</label>
                <input
                  type="number"
                  min={0}
                  value={form.wholesalePrice ?? ""}
                  onChange={(e) => set("wholesalePrice", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div className="form-field">
                <label>Wholesale MOQ (pcs)</label>
                <input
                  type="number"
                  min={2}
                  value={form.wholesaleMoq ?? ""}
                  onChange={(e) => set("wholesaleMoq", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>
            {!!form.wholesalePrice && !!form.wholesaleMoq && form.wholesalePrice >= form.price && (
              <p className="form-error">Wholesale price should normally be lower than the single-piece price.</p>
            )}
            {(!!form.wholesalePrice !== !!form.wholesaleMoq) && (
              <p className="form-error">Set both wholesale price and MOQ, or leave both blank.</p>
            )}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 14, marginBottom: 14 }}>Preorder</h2>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 12 }}>
              <input type="checkbox" checked={form.isPreorder} onChange={(e) => set("isPreorder", e.target.checked)} />
              This is a preorder product
            </label>
            {form.isPreorder && (
              <div className="grid-2col">
                <div className="form-field">
                  <label>Release Date</label>
                  <input type="date" value={form.releaseDate?.slice(0, 10) || ""} onChange={(e) => set("releaseDate", e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Preorder Closing Date</label>
                  <input type="date" value={form.preorderClosingDate?.slice(0, 10) || ""} onChange={(e) => set("preorderClosingDate", e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, marginBottom: 14 }}>Organize</h2>
            <div className="form-field">
              <label>Category</label>
              <select value={form.category || ""} onChange={(e) => set("category", e.target.value)}>
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Brand</label>
              <select value={form.brand || ""} onChange={(e) => set("brand", e.target.value)}>
                <option value="">None</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Series</label>
              <input value={form.series || ""} onChange={(e) => set("series", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Character</label>
              <input value={form.character || ""} onChange={(e) => set("character", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Tags</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <button type="button" className="btn btn-outline btn-sm" onClick={addTag}>
                  Add
                </button>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {form.tags.map((t) => (
                  <span key={t} className="badge badge-instock" style={{ cursor: "pointer" }} onClick={() => set("tags", form.tags.filter((x) => x !== t))}>
                    {t} ×
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, marginBottom: 14 }}>Flags</h2>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 10 }}>
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
              Featured
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 10 }}>
              <input type="checkbox" checked={form.newArrival} onChange={(e) => set("newArrival", e.target.checked)} />
              New Arrival
            </label>
            <p style={{ fontSize: 11.5, color: "var(--color-ink-soft)", margin: "-4px 0 10px 24px" }}>
              Products are shown under New Arrivals automatically for their first {NEW_ARRIVAL_WINDOW_DAYS} days — check
              this only to keep an older product pinned there on purpose.
            </p>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={form.bestSeller} onChange={(e) => set("bestSeller", e.target.checked)} />
              Best Seller
            </label>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 14, marginBottom: 14 }}>Status</h2>
            <div className="form-field">
              <select value={form.status} onChange={(e) => set("status", e.target.value as ProductFormValues["status"])}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            {error && <p className="form-error" style={{ marginBottom: 10 }}>{error}</p>}
            <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
              {saving ? "Saving..." : productId ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
