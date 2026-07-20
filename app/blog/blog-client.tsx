"use client";

import Link from "next/link";
import { useBlogLang, useNow } from "./use-blog-time";
import {
  fullDate,
  readLabel,
  relativeTime,
  relatedPosts,
  sortedPosts,
  type BlogLang,
  type BlogPost,
} from "@/lib/blog";
import { PostBody } from "./PostBody";

/* ══════════════════════════════════════════════════════════
   BLOG — İSTEMCİ KATMANI
   ──────────────────────────────────────────────────────────
   Dil anahtarı ve ZAMAN burada. relativeTime tarayıcıda,
   sayfa açıldığı anda hesaplanır — statik prerender'a
   gömülmez, dolayısıyla aylar sonra da doğru kalır.
   İlk (sunucu) render'da tam tarih gösterilir; istemci
   bağlandığında "x önce"ye döner. İkisi de doğru bilgi.
   ══════════════════════════════════════════════════════════ */

function Stamp({
  iso,
  lang,
  now,
}: {
  iso: string;
  lang: BlogLang;
  now: number | null;
}) {
  // now === null → henüz hydrate olmadık; tam tarihi göster.
  return <>{now === null ? fullDate(iso, lang) : relativeTime(iso, lang, now)}</>;
}

function LangToggle({
  lang,
  onChange,
}: {
  lang: BlogLang;
  onChange: (l: BlogLang) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
      {(["tr", "en"] as const).map((code) => (
        <button
          key={code}
          onClick={() => onChange(code)}
          aria-pressed={lang === code}
          className={`rounded-md px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
            lang === code
              ? "bg-[#FF4655] text-white"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

function PostCard({
  post,
  lang,
  now,
  compact = false,
}: {
  post: BlogPost;
  lang: BlogLang;
  now: number | null;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative block overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
    >
      <span
        className="absolute inset-x-0 top-0 h-0.5 opacity-60 transition-opacity group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, ${post.color}, transparent)` }}
      />
      <div className="mb-4 flex items-center justify-between gap-3">
        <span
          className="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{
            color: post.color,
            background: `${post.color}12`,
            border: `1px solid ${post.color}20`,
          }}
        >
          {post.category[lang]}
        </span>
        <span className="text-[11px] text-neutral-500">
          {readLabel(post.readMinutes, lang)}
        </span>
      </div>
      <h2
        className={`mb-2 font-bold leading-snug tracking-tight text-white ${
          compact ? "text-[15px]" : "text-[18px]"
        }`}
      >
        {post.title[lang]}
      </h2>
      <p className="mb-5 text-[13px] leading-relaxed text-neutral-400">
        {post.excerpt[lang]}
      </p>
      <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
        <span className="text-[11px] text-neutral-500">
          <Stamp iso={post.publishedAt} lang={lang} now={now} />
        </span>
        <span
          className="text-[12px] font-semibold transition-all group-hover:translate-x-0.5"
          style={{ color: post.color }}
        >
          {lang === "tr" ? "Oku →" : "Read →"}
        </span>
      </div>
    </Link>
  );
}

/* ─── /blog — tüm yazılar ─── */
export function BlogIndex() {
  const [lang, setLang] = useBlogLang();
  const now = useNow();
  const posts = sortedPosts();

  return (
    <main className="min-h-screen bg-[#030711] px-4 py-16 text-zinc-200">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 border-b border-white/10 pb-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <Link href="/" className="text-[12px] text-neutral-500 hover:text-[#FF6B77]">
              ← {lang === "tr" ? "Ana Sayfa" : "Home"}
            </Link>
            <LangToggle lang={lang} onChange={setLang} />
          </div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF4655]/70">
            {lang === "tr" ? "Blog & İçgörüler" : "Blog & Insights"}
          </p>
          <h1 className="mb-4 text-3xl font-black tracking-tight text-white sm:text-[40px]">
            {lang === "tr" ? "Tüm Yazılar" : "All Posts"}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-400">
            {lang === "tr"
              ? "Valorant mekanikleri, harita okuma, ekonomi ve ajan kullanımı üzerine öğretici yazılar. Hepsi doğrulanabilir oyun bilgisine dayanır."
              : "Practical writing on Valorant mechanics, map reading, economy, and agent play — all grounded in verifiable game knowledge."}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} lang={lang} now={now} compact />
          ))}
        </div>
      </div>
    </main>
  );
}

/* ─── /blog/[slug] — tek yazı ─── */
export function PostView({ post }: { post: BlogPost }) {
  const [lang, setLang] = useBlogLang();
  const now = useNow();
  const others = relatedPosts(post.slug, 3);

  return (
    <main className="min-h-screen bg-[#030711] px-4 py-16 text-zinc-200">
      <article className="mx-auto max-w-2xl">
        <header className="mb-8 border-b border-white/10 pb-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <Link href="/blog" className="text-[12px] text-neutral-500 hover:text-[#FF6B77]">
              ← {lang === "tr" ? "Tüm Yazılar" : "All Posts"}
            </Link>
            <LangToggle lang={lang} onChange={setLang} />
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{
                color: post.color,
                background: `${post.color}15`,
                border: `1px solid ${post.color}25`,
              }}
            >
              {post.category[lang]}
            </span>
            <span className="text-[11px] text-neutral-500">
              {readLabel(post.readMinutes, lang)}
            </span>
            <span className="text-[11px] text-neutral-600">·</span>
            <span className="text-[11px] text-neutral-500">
              <Stamp iso={post.publishedAt} lang={lang} now={now} />
            </span>
          </div>

          <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight text-white">
            {post.title[lang]}
          </h1>

          <time
            dateTime={post.publishedAt}
            className="text-[11px] uppercase tracking-wider text-neutral-600"
          >
            {fullDate(post.publishedAt, lang)}
          </time>
        </header>

        <p
          className="mb-8 border-l-2 pl-4 text-[15px] leading-relaxed text-neutral-300"
          style={{ borderColor: `${post.color}50` }}
        >
          {post.excerpt[lang]}
        </p>

        <PostBody body={post.body[lang]} accent={post.color} />

        {others.length > 0 && (
          <section className="mt-16 border-t border-white/10 pt-8">
            <h2 className="mb-5 text-lg font-bold text-white">
              {lang === "tr" ? "Diğer Yazılar" : "More Posts"}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {others.map((p) => (
                <PostCard key={p.slug} post={p} lang={lang} now={now} compact />
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
