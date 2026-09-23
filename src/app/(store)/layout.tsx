import { headers } from "next/headers";
import { Providers } from "@/components/providers/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import VisitorHeartbeat from "@/components/providers/VisitorHeartbeat";
import BlockedNotice from "@/components/layout/BlockedNotice";
import { clientIp } from "@/lib/rateLimit";
import { getBlockRecord } from "@/lib/visitorBlock";

// A server component (not just a client shell) specifically so this can
// check the visitor's IP against the block list on every storefront
// request — see /admin/visitors and /admin/blocked-ips. That check (a
// `headers()` read) opts every page under this layout out of static
// prerendering in exchange for a block taking effect immediately, with no
// caching layer to go stale. Never runs for /admin — that has its own
// layout — so an admin can never lock themselves out of their own panel
// by blocking their own IP.
export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const ip = clientIp(hdrs);
  const block = await getBlockRecord(ip);

  return (
    <Providers>
      <Header />
      <main style={{ flex: 1 }}>{block ? <BlockedNotice reason={block.reason} /> : children}</main>
      <Footer />
      <MobileBottomNav />
      {!block && <VisitorHeartbeat />}
    </Providers>
  );
}
