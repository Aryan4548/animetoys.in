import { Providers } from "@/components/providers/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Header />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
      <MobileBottomNav />
    </Providers>
  );
}
