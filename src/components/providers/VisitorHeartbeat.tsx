"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const PING_INTERVAL_MS = 20000;

/**
 * Invisible — pings /api/track/heartbeat on mount and every 20s so
 * /admin/visitors can show who's currently on the site. Mounted once in
 * the storefront layout (src/app/(store)/layout.tsx), never on /admin.
 * The interval is stable across route changes (a route change doesn't
 * reset the 20s clock); it just reads whatever page the visitor is on via
 * a ref, so navigating around the site doesn't spam extra pings.
 */
export default function VisitorHeartbeat() {
  const pathname = usePathname();
  const pathRef = useRef(pathname);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    function ping() {
      fetch("/api/track/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathRef.current }),
        keepalive: true,
      }).catch(() => {});
    }
    ping();
    const interval = setInterval(ping, PING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return null;
}
