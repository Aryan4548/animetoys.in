"use client";

import { useState } from "react";

const emptyForm = {
  businessName: "",
  contactName: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  businessType: "",
  website: "",
  instagram: "",
  monthlyOrderVolume: "",
  message: "",
};

export default function WholesaleForm() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/wholesale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productCategories: [] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not submit application.");
        setStatus("error");
        return;
      }
      setStatus("done");
      setForm(emptyForm);
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {status === "done" ? (
        <div className="card" style={{ padding: 20, background: "#dcfce7", borderColor: "#86efac" }}>
          Thanks! Your application has been received. We&apos;ll be in touch after review.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Business Name</label>
            <input required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Contact Name</label>
            <input required value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Phone</label>
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Country</label>
            <input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <div className="form-field">
            <label>City</label>
            <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Business Type</label>
            <input required placeholder="e.g. Retail store, Online reseller" value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Website (optional)</label>
            <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Instagram (optional)</label>
            <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Estimated Monthly Order Volume</label>
            <input required placeholder="e.g. 50-100 units" value={form.monthlyOrderVolume} onChange={(e) => setForm({ ...form, monthlyOrderVolume: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Message (optional)</label>
            <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
            {status === "loading" ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      )}
    </>
  );
}
