"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send message.");
        setStatus("error");
        return;
      }
      setStatus("done");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="card" style={{ padding: 20, background: "#dcfce7", borderColor: "#86efac" }}>
        Thanks for reaching out — we&apos;ll get back to you shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label>Name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="form-field">
        <label>Email</label>
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="form-field">
        <label>Subject</label>
        <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
      </div>
      <div className="form-field">
        <label>Message</label>
        <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </div>
      {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
