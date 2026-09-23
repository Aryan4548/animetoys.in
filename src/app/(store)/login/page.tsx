"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { useSession } from "@/components/providers/SessionProvider";
import { useCart } from "@/components/providers/CartProvider";
import GoogleIcon from "@/components/icons/GoogleIcon";

// Shown when we land back on /login?error=... — from a failed or
// not-yet-configured Google round trip (see the two /api/auth/google
// routes), never from the plain email/password form below (that sets its
// own inline error from the API response instead).
const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_not_configured: "Google sign-in isn't set up on this site yet. Please log in with email and password.",
  google_denied: "Google sign-in was cancelled.",
  google_state_mismatch: "That Google sign-in link expired. Please try again.",
  google_token_exchange_failed: "Could not complete Google sign-in. Please try again.",
  google_email_unverified: "That Google account's email address isn't verified.",
  google_account_disabled: "This account has been disabled. Contact support for help.",
  google_auth_failed: "Google sign-in failed. Please try again, or use email and password.",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useSession();
  const { refresh: refreshCart } = useCart();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const next = searchParams.get("next") || "";
  const googleError = searchParams.get("error");
  const googleErrorMessage = googleError ? GOOGLE_ERROR_MESSAGES[googleError] || GOOGLE_ERROR_MESSAGES.google_auth_failed : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      await refresh();
      await refreshCart();
      const dest = next || (data.user.role === "admin" ? "/admin" : "/account");
      router.push(dest);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={`card ${styles.card}`}>
        <h1>Welcome back</h1>
        <p className={styles.subtitle}>Log in to your Anime &amp; Toy Universe account.</p>
        {googleErrorMessage && <p className="form-error" style={{ marginBottom: 16 }}>{googleErrorMessage}</p>}
        <a href={`/api/auth/google${next ? `?next=${encodeURIComponent(next)}` : ""}`} className={styles.googleBtn}>
          <GoogleIcon />
          Continue with Google
        </a>
        <div className={styles.divider}>
          <span>or</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p className={styles.footer}>
          New here? <Link href="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
