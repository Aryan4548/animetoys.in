"use client";

import { useEffect, useState } from "react";
import styles from "../../app/(store)/page.module.css";

// Only mounts the <video> (and therefore only triggers the browser's
// network request for hero-video.mp4) on screens wide enough to be
// desktop — matching the site's 900px breakpoint used elsewhere. Mobile
// visitors keep the static <Image> underneath instead: no extra data
// usage, no battery drain from an autoplaying background video, and a
// faster first load on the connections mobile shoppers are most likely
// to be on. Also skips the video entirely for prefers-reduced-motion,
// on any screen size.
export default function HeroVideo() {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setShowVideo(desktopQuery.matches && !motionQuery.matches);
    update();

    desktopQuery.addEventListener("change", update);
    motionQuery.addEventListener("change", update);
    return () => {
      desktopQuery.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, []);

  if (!showVideo) return null;

  return (
    <video
      className={styles.heroVideo}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/hero-banner.jpg"
      aria-hidden="true"
    >
      <source src="/hero-video.mp4" type="video/mp4" />
    </video>
  );
}
