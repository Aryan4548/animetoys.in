import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { formatDate } from "@/lib/format";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const post = await BlogPost.findOne({ slug, status: "published" }).lean();
  if (!post) return { title: "Post not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const post = await BlogPost.findOne({ slug, status: "published" }).lean();
  if (!post) notFound();

  return (
    <div className="container section" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>{post.title}</h1>
      <p style={{ fontSize: 12, color: "var(--color-ink-soft)", marginBottom: 24 }}>
        {post.publishedAt ? formatDate(post.publishedAt) : ""} {post.author ? `· ${post.author}` : ""}
      </p>
      <div style={{ fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{post.content}</div>
    </div>
  );
}
