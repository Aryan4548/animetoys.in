"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useCart } from "@/components/providers/CartProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { formatINR } from "@/lib/format";

interface Address {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const emptyForm = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

export default function CheckoutPage() {
  const { items, subtotal, loading: cartLoading, refresh } = useCart();
  const { user, loading: userLoading } = useSession();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  // Razorpay was never wired up to an actual payment gateway — it showed as
  // a placeholder ("payment-pending until Razorpay keys are configured")
  // and has been dropped from checkout, so Cash on Delivery is the only
  // method now.
  const [paymentMethod] = useState<"COD">("COD");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.addresses) {
      const list = user.addresses as unknown as Address[];
      setAddresses(list);
      const def = list.find((a) => a.isDefault) || list[0];
      if (def) setSelectedId(def._id);
      if (list.length === 0) setShowForm(true);
    }
  }, [user]);

  useEffect(() => {
    if (!userLoading && !user) router.push("/login?next=/checkout");
  }, [userLoading, user, router]);

  async function saveNewAddress() {
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setAddresses(data.addresses);
      const newest = data.addresses[data.addresses.length - 1];
      setSelectedId(newest._id);
      setShowForm(false);
      setForm(emptyForm);
    } else {
      const data = await res.json();
      setError(data.error || "Could not save address.");
    }
  }

  async function placeOrder() {
    setError("");
    const address = addresses.find((a) => a._id === selectedId);
    if (!address) {
      setError("Please select or add a shipping address.");
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            label: address.label,
            fullName: address.fullName,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not place order.");
        return;
      }
      await refresh();
      router.push(`/account/orders/${data.order._id}?placed=true`);
    } finally {
      setPlacing(false);
    }
  }

  if (cartLoading || userLoading) {
    return (
      <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
        Loading checkout...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: 60, paddingBottom: 60, textAlign: "center" }}>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className={`container ${styles.wrap}`}>
      <div>
        <h1 style={{ fontSize: 22, marginBottom: 16 }}>Shipping Address</h1>

        {addresses.map((a) => (
          <div
            key={a._id}
            className={`card ${styles.addressCard} ${selectedId === a._id ? styles.addressCardActive : ""}`}
            onClick={() => setSelectedId(a._id)}
          >
            <input type="radio" checked={selectedId === a._id} onChange={() => setSelectedId(a._id)} style={{ marginTop: 4 }} />
            <div>
              <strong>
                {a.fullName} · {a.label}
              </strong>
              <p style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>
                {a.line1}, {a.line2 ? `${a.line2}, ` : ""}
                {a.city}, {a.state} {a.postalCode}, {a.country}
              </p>
              <p style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>{a.phone}</p>
            </div>
          </div>
        ))}

        <button className="btn btn-outline btn-sm" onClick={() => setShowForm((v) => !v)} style={{ marginBottom: 16 }}>
          {showForm ? "Cancel" : "+ Add New Address"}
        </button>

        {showForm && (
          <div className="card" style={{ padding: 18, marginBottom: 24 }}>
            <div className={styles.formGrid}>
              <div className="form-field">
                <label>Full Name</label>
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-field">
              <label>Address Line 1</label>
              <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Address Line 2 (optional)</label>
              <input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
            </div>
            <div className={styles.formGrid}>
              <div className="form-field">
                <label>City</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="form-field">
                <label>State</label>
                <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
            </div>
            <div className={styles.formGrid}>
              <div className="form-field">
                <label>Postal Code</label>
                <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Country</label>
                <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={saveNewAddress}>
              Save Address
            </button>
          </div>
        )}

        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Payment Method</h2>
        <div className={`${styles.paymentOption} ${styles.paymentOptionActive}`}>
          <input type="radio" checked readOnly />
          <div>
            <strong>Payment after packing</strong>
            <p style={{ fontSize: 12, color: "var(--color-ink-soft)" }}>Our team will contact you for the payments</p>
          </div>
        </div>

        {error && <p className="form-error" style={{ marginTop: 12 }}>{error}</p>}
      </div>

      <div className={`card ${styles.summary}`}>
        <h2 style={{ fontSize: 16 }}>Order Summary</h2>
        {items.map((i) => (
          <div className={styles.lineItem} key={i.productId}>
            <span>
              {i.name} × {i.quantity}
            </span>
            <span>{formatINR(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className={styles.lineItem}>
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 17, borderTop: "1px solid var(--color-border)", paddingTop: 10 }}>
          <span>Total</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <button className="btn btn-primary btn-block" onClick={placeOrder} disabled={placing}>
          {placing ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
