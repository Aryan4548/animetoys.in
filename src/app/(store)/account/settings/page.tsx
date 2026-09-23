"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/components/providers/SessionProvider";

export default function AccountSettingsPage() {
  const { user, refresh } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save changes.");
        return;
      }
      await refresh();
      setSaved(true);
    } catch {
      setError("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Account Settings</h1>
      <div className="card" style={{ padding: 20, maxWidth: 420 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="settings-name">Name</label>
            <input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
          </div>
          <div className="form-field">
            <label htmlFor="settings-phone">Phone</label>
            <input
              id="settings-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={20}
              placeholder="Optional"
            />
          </div>
          <div className="form-field">
            <label htmlFor="settings-email">Email</label>
            <input id="settings-email" value={user?.email || ""} disabled />
          </div>
          {error && (
            <p className="form-error" style={{ marginBottom: 12 }}>
              {error}
            </p>
          )}
          {saved && (
            <p style={{ color: "var(--color-accent-green)", fontSize: 13, marginBottom: 12 }}>Changes saved.</p>
          )}
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
      <p style={{ fontSize: 12, color: "var(--color-ink-soft)", marginTop: 12 }}>
        Need to change your password? That&apos;s not available here yet — contact us and we&apos;ll help.
      </p>
    </div>
  );
}
