import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "@/lib/blog";
import { PostView } from "../blog-client";

/** Tüm slug'lar build'de üretilir. */
export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

// Next 16: dinamik rota params ASENKRON — await edilmeli.
type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Yazı bulunamadı — AIMLO" };
  return {
    title: `${post.title.tr} — AIMLO`,
    description: post.excerpt.tr,
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  return <PostView post={post} />;
}
