import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import styles from "@/components/admin/AdminSidebar.module.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Middleware already gates /admin/*, but this is a defense-in-depth check
  // and is what lets /admin/login itself render without a session.
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar adminName={session.name} />
      <div className={styles.main}>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
