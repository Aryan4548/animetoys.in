"use client";

import { useEffect, useState } from "react";
import styles from "./PageLoader.module.css";

// A brand-matched full-screen splash shown while the page's own resources
// (fonts, the hero image, etc.) are still loading, so first-time visitors
// see a designed "soft load" moment instead of a flash of unstyled/half-
// loaded content. It hides itself once the window "load" event fires
// (i.e. everything the browser eagerly fetched — including any
// non-lazy/priority images — has finished), with two safety rails: a
// minimum visible time so it never just flickers on a fast/cached load,
// and a maximum wait so a single slow third-party resource can never trap
// a visitor behind it indefinitely.
const MIN_VISIBLE_MS = 650;
const MAX_WAIT_MS = 4000;
const FADE_MS = 450;

export default function PageLoader() {
  const [mounted, setMounted] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const startedAt = Date.now();
    let settled = false;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    function finish() {
      if (settled) return;
      settled = true;
      const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt));
      hideTimer = setTimeout(() => {
        setFading(true);
        hideTimer = setTimeout(() => setMounted(false), FADE_MS);
      }, remaining);
    }

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish);
    }
    const fallback = setTimeout(finish, MAX_WAIT_MS);

    // Keep the page from scrolling behind the splash while it's up.
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      window.removeEventListener("load", finish);
      clearTimeout(fallback);
      if (hideTimer) clearTimeout(hideTimer);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    if (!mounted) document.documentElement.style.overflow = "";
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className={`${styles.overlay} ${fading ? styles.fadeOut : ""}`} aria-hidden="true">
      <div className={styles.glow} />
      <div className={styles.mark}>
        <svg width="76" height="76" viewBox="0 0 64 64" className={styles.spinner}>
          <circle cx="32" cy="32" r="30" fill="#0d0d12" />
          <circle cx="32" cy="32" r="12" fill="#fff" />
          <circle cx="32" cy="32" r="4" fill="#0d0d12" />
          <path d="M32 4 A28 28 0 0 1 60 32" stroke="#ff2f6d" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <div className={styles.brand}>Anime &amp; Toy Universe</div>
      <div className={styles.bar}>
        <span className={styles.barFill} />
      </div>
    </div>
  );
}
