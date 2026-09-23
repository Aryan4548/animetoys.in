"use client";

import { useEffect, useState } from "react";

interface Brand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

const emptyForm = { name: "", description: "", logo: "" };

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/brands?admin=true");
    const data = await res.json();
    setBrands(data.brands || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", "brands");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setForm((f) => ({ ...f, logo: data.url }));
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(editingId ? `/api/brands/${editingId}` : "/api/brands", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      load();
    }
  }

  function startEdit(b: Brand) {
    setForm({ name: b.name, description: b.description || "", logo: b.logo || "" });
    setEditingId(b._id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this brand?")) return;
    const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22 }}>Brands</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm((v) => !v);
          }}
        >
          {showForm ? "Cancel" : "+ Add Brand"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div className="form-field">
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Logo</label>
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
            {form.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logo} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, marginTop: 8 }} />
            )}
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            {editingId ? "Save Changes" : "Create Brand"}
          </button>
        </form>
      )}

      <div className="card" style={{ padding: 4 }}>
        {loading ? (
          <p style={{ padding: 20 }}>Loading...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b._id}>
                  <td>{b.name}</td>
                  <td>{b.slug}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(b)}>
                        Edit
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleDelete(b._id)} style={{ color: "var(--color-danger)" }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
