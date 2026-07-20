import type { ReactNode } from "react";

/* ══════════════════════════════════════════════════════════
   BLOG GÖVDE RENDERER
   ──────────────────────────────────────────────────────────
   lib/blog.ts içindeki markdown-benzeri gövdeyi React'e çevirir.
   Desteklenen: "## " başlık, "### " alt başlık, "- " liste,
   "1. " sıralı liste, "| " tablo, **kalın**.
   dangerouslySetInnerHTML KULLANILMAZ — kalın metin React
   düğümüne parse edilir, HTML enjeksiyon yüzeyi yok.
   ══════════════════════════════════════════════════════════ */

/** **kalın** parçalarını React düğümlerine çevirir. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) => {
    if (chunk.startsWith("**") && chunk.endsWith("**") && chunk.length > 4) {
      return (
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-white">
          {chunk.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-t${i}`}>{chunk}</span>;
  });
}

/** "| a | b |" satırlarını hücrelere böler. */
function cells(row: string): string[] {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

/** Ayraç satırı mı? ("|---|---|") */
function isDivider(row: string): boolean {
  return /^\|[\s:|-]+\|?$/.test(row.trim());
}

export function PostBody({ body, accent }: { body: string; accent: string }) {
  const blocks = body.split("\n\n");

  return (
    <div className="space-y-5 text-[14px] leading-[1.85] text-neutral-300">
      {blocks.map((block, bi) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        const lines = trimmed.split("\n");

        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={bi}
              className="mt-10 mb-1 text-[19px] font-bold tracking-tight"
              style={{ color: accent }}
            >
              {trimmed.slice(3)}
            </h2>
          );
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={bi} className="mt-6 mb-1 text-[15px] font-semibold text-white">
              {trimmed.slice(4)}
            </h3>
          );
        }

        // Tablo
        if (lines[0].trim().startsWith("|")) {
          const rows = lines.filter((l) => !isDivider(l));
          const [head, ...rest] = rows;
          return (
            <div key={bi} className="overflow-x-auto">
              <table className="w-full min-w-[380px] border-collapse text-[13px]">
                <thead>
                  <tr>
                    {cells(head).map((c, ci) => (
                      <th
                        key={ci}
                        className="border-b border-white/15 px-3 py-2 text-left font-semibold text-white"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rest.map((row, ri) => (
                    <tr key={ri}>
                      {cells(row).map((c, ci) => (
                        <td
                          key={ci}
                          className="border-b border-white/[0.06] px-3 py-2 text-neutral-300"
                        >
                          {inline(c, `${bi}-${ri}-${ci}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // Sıralı liste
        if (/^\d+\.\s/.test(lines[0].trim())) {
          return (
            <ol key={bi} className="list-decimal space-y-1.5 pl-5 marker:text-neutral-500">
              {lines.map((li, i) => (
                <li key={i}>{inline(li.replace(/^\s*\d+\.\s*/, ""), `${bi}-${i}`)}</li>
              ))}
            </ol>
          );
        }

        // Madde listesi
        if (lines[0].trim().startsWith("- ")) {
          return (
            <ul key={bi} className="list-disc space-y-1.5 pl-5 marker:text-neutral-600">
              {lines.map((li, i) => (
                <li key={i}>{inline(li.replace(/^\s*-\s*/, ""), `${bi}-${i}`)}</li>
              ))}
            </ul>
          );
        }

        return <p key={bi}>{inline(trimmed, `${bi}`)}</p>;
      })}
    </div>
  );
}
