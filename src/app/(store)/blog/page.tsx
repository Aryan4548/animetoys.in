import type { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Blog" };
export const dynamic = "force-dynamic";

export default async function BlogListPage() {
  await connectDB();
  const posts = await BlogPost.find({ status: "published" }).sort({ publishedAt: -1 }).lean();

  return (
    <div className="container section">
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>Blog</h1>
      {posts.length === 0 ? (
        <p style={{ color: "var(--color-ink-soft)" }}>No posts yet — check back soon!</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
          {posts.map((p) => (
            <Link key={String(p._id)} href={`/blog/${p.slug}`} className="card" style={{ padding: 16 }}>
              <strong style={{ fontSize: 15 }}>{p.title}</strong>
              <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "6px 0" }}>
                {p.publishedAt ? formatDate(p.publishedAt) : ""}
              </p>
              {p.excerpt && <p style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
