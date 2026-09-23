"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/components/providers/SessionProvider";

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
  isDefault: false,
};

interface Address extends Omit<typeof emptyForm, "isDefault"> {
  _id: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { refresh } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setAddresses(data.user?.addresses || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addAddress() {
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm(emptyForm);
      setShowForm(false);
      await load();
      await refresh();
    }
  }

  async function removeAddress(id: string) {
    if (!confirm("Remove this address?")) return;
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    await load();
    await refresh();
  }

  async function makeDefault(id: string) {
    await fetch(`/api/account/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    await load();
    await refresh();
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 22 }}>Addresses</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add Address"}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 18, marginBottom: 20 }}>
          <div className="form-field">
            <label>Full Name</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Address Line 1</label>
            <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
          </div>
          <div className="form-field">
            <label>City</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="form-field">
            <label>State</label>
            <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Postal Code</label>
            <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-sm" onClick={addAddress}>
            Save
          </button>
        </div>
      )}

      {addresses.map((a) => (
        <div key={a._id} className="card" style={{ padding: 16, marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong style={{ fontSize: 14 }}>
              {a.fullName} · {a.label} {a.isDefault && <span className="badge badge-instock">Default</span>}
            </strong>
            <p style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>
              {a.line1}, {a.city}, {a.state} {a.postalCode}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            {!a.isDefault && (
              <button className="btn btn-outline btn-sm" onClick={() => makeDefault(a._id)}>
                Set Default
              </button>
            )}
            <button className="btn btn-outline btn-sm" onClick={() => removeAddress(a._id)} style={{ color: "var(--color-danger)" }}>
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
