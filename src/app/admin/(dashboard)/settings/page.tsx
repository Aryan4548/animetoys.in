import ComingSoon from "@/components/admin/ComingSoon";

export default function AdminSettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Store-wide settings (site name, contact details, shipping rules, tax, social links, SMTP status) editable without touching .env. Server credentials (MongoDB URI, Razorpay keys, SMTP, AUTH_SECRET) intentionally stay in .env on the server rather than in the admin UI, so they are never exposed to the browser."
    />
  );
}
