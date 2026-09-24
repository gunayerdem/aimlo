/**
 * HESAP AKIŞLARI KİLİDİ — FB02 (2026-09-24)
 * ─────────────────────────────────────────────────────────────────────────────
 * RUN: npx tsx scripts/test-account-flows.ts   (exit 1 = kırık)
 *
 * [F50] Hesap silme destek mesajlarını da siler.
 *   KÖK: supabase/0010_support_messages.sql:31 `user_id … on delete set null` +
 *   ayrı `email`/`message` kolonları. app/account/delete/actions.ts yalnız
 *   admin.auth.admin.deleteUser çağırıyordu → satır user_id=NULL ile kalıyor,
 *   e-posta + mesaj metni süresiz saklanıyor ve /admin/support'ta r.email ile
 *   görünmeye devam ediyordu. SIRA KRİTİK: deleteUser önce koşarsa satır artık
 *   user_id ile eşleşmez.
 *   Kilit: (a) support_messages delete().eq("user_id", U) deleteUser'dan ÖNCE;
 *   (b) delete hata dönerse/throw ederse deleteUser ÇAĞRILMAZ, kullanıcı genel
 *   hata + support adresi görür (kurtarma yolu); (c) başarı yolu değişmedi
 *   (signOut + "/?deleted=1").
 *
 * [F34] E-postası doğrulanmamış kullanıcı için doğrulama yolu.
 *   KÖK: app/(auth)/verify/page.tsx:39-41 email yoksa redirect("/login");
 *   masaüstü https://aimlo.gg/verify'ı parametresiz açıyor (desktop App.tsx
 *   :1824/:2582) ve web girişi doğrulanmamış hesaba enumeration koruması
 *   yüzünden yalnız "Geçersiz e-posta veya şifre" diyor (login/actions.ts) →
 *   kullanıcı hesabını doğrulayamıyordu.
 *   Kilit: e-postasız /verify redirect etmez, e-posta formu render eder; form
 *   MEVCUT resendAction'ı çağırır (yeni uç yok) ve başarıda
 *   /verify?email=<girilen>&purpose=register'a geçer; hata dönerse geçmez;
 *   girişteki /verify bağlantısı her hatada aynı (enumeration yok).
 *
 * YAKLAŞIM: scripts/test-telemetry-route.ts kalıbı — "server-only" boş modül,
 * "@/..." → repo kökü, bağımlılıklar Module._cache'e sahte `exports` olarak
 * konur (tsx action dosyasını CJS require ile yükler). ⚠ AĞ/DB YOK, .env OKUNMAZ.
 */
import Module from "node:module";
import * as path from "node:path";

const REPO_ROOT = path.join(__dirname, "..");
type ResolveFn = (...a: unknown[]) => unknown;
type ModuleInternals = { _resolveFilename: ResolveFn; _cache: Record<string, { exports: unknown }> };
const M = Module as unknown as ModuleInternals;

const origResolve = M._resolveFilename;
M._resolveFilename = function (this: unknown, ...args: unknown[]) {
  const req = args[0];
  // "path" — "node:path" DEĞİL (Node 22 CI ENOENT; bkz. test-entitlements.ts).
  if (req === "server-only") return origResolve.call(this, "path", ...args.slice(1));
  if (typeof req === "string" && req.startsWith("@/")) {
    return origResolve.call(this, path.join(REPO_ROOT, req.slice(2)), ...args.slice(1));
  }
  return origResolve.apply(this, args);
};

let fail = 0;
let pass = 0;
const t = (ad: string, kosul: boolean, detay = "") => {
  if (kosul) { pass++; console.log(`  ✅ ${ad}`); }
  else { fail++; console.log(`  ❌ ${ad} ${detay}`); }
};

const setModule = (fn: string, exports: Record<string, unknown>) => {
  M._cache[fn] = { id: fn, filename: fn, loaded: true, exports, children: [], paths: [] } as unknown as { exports: unknown };
};
const repoFile = (rel: string) => require.resolve(path.join(REPO_ROOT, rel));

// ── Paylaşılan sahte dünya ───────────────────────────────────────────────────
type Call = [string, ...unknown[]];
const calls: Call[] = [];
class RedirectMarker extends Error {
  constructor(public url: string) { super(`NEXT_REDIRECT ${url}`); }
}
const world = {
  userId: "00000000-0000-4000-8000-0000000fb050",
  /** support_messages delete sonucu: null = başarılı, string = hata, "THROW" = istisna. */
  supportDelete: null as null | string,
};

setModule(require.resolve("next/navigation"), {
  redirect: (url: string) => { calls.push(["redirect", url]); throw new RedirectMarker(url); },
  useRouter: () => ({
    replace: (href: string) => { calls.push(["router.replace", href]); },
    push: (href: string) => { calls.push(["router.push", href]); },
  }),
});

function fakeService() {
  return {
    from(table: string) {
      return {
        delete() {
          return {
            eq(col: string, val: unknown) {
              calls.push(["from.delete.eq", table, col, val]);
              if (world.supportDelete === "THROW") return Promise.reject(new Error("fetch failed"));
              return Promise.resolve({ error: world.supportDelete ? { message: world.supportDelete } : null });
            },
          };
        },
      };
    },
    auth: {
      admin: {
        deleteUser: async (id: string) => { calls.push(["auth.admin.deleteUser", id]); return { error: null }; },
      },
    },
  };
}
setModule(repoFile("lib/supabase/server"), {
  createServiceSupabase: () => fakeService(),
  createServerSupabase: async () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: world.userId, email: "silinecek@example.com" } }, error: null }),
      signOut: async () => { calls.push(["ssr.signOut"]); return { error: null }; },
    },
  }),
});
setModule(repoFile("lib/auth-rate-limit"), {
  authRateLimit: async (action: string, id: string) => { calls.push(["authRateLimit", action, id]); return { blocked: false }; },
});

async function main() {
  // ── [F50] hesap silme ──────────────────────────────────────────────────────
  console.log("\n[F50] hesap silme — destek mesajları deleteUser'dan ÖNCE silinir");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const del = require(repoFile("app/account/delete/actions")) as {
    deleteAccountAction: (prev: { ok: boolean }, fd: FormData) => Promise<{ ok: boolean; error?: string }>;
  };
  const confirmFd = () => { const fd = new FormData(); fd.set("confirm", "SİL"); return fd; };
  const idx = (name: string) => calls.findIndex((c) => c[0] === name);

  // (a) başarı yolu
  calls.length = 0;
  world.supportDelete = null;
  let redirected: string | null = null;
  try {
    await del.deleteAccountAction({ ok: false }, confirmFd());
  } catch (e) {
    if (e instanceof RedirectMarker) redirected = e.url;
    else throw e;
  }
  const supIdx = calls.findIndex((c) => c[0] === "from.delete.eq" && c[1] === "support_messages");
  const delIdx = idx("auth.admin.deleteUser");
  t("support_messages.delete().eq('user_id', <oturum kullanıcısı>) çağrılıyor",
    supIdx >= 0 && calls[supIdx][2] === "user_id" && calls[supIdx][3] === world.userId,
    JSON.stringify(calls));
  t("sıra: destek satırları deleteUser'dan ÖNCE siliniyor (sonra user_id NULL olur, eşleşmez)",
    supIdx >= 0 && delIdx >= 0 && supIdx < delIdx, `support=${supIdx} deleteUser=${delIdx}`);
  t("başarı yolu değişmedi: deleteUser(U) → signOut → /?deleted=1",
    delIdx >= 0 && calls[delIdx][1] === world.userId && idx("ssr.signOut") > delIdx && redirected === "/?deleted=1",
    JSON.stringify({ redirected, calls }));

  // (b) delete hata döner → hesap silme durur
  for (const mode of ["permission denied for table support_messages", "THROW"] as const) {
    calls.length = 0;
    world.supportDelete = mode;
    let res: { ok: boolean; error?: string } | null = null;
    let threw: unknown = null;
    try {
      res = await del.deleteAccountAction({ ok: false }, confirmFd());
    } catch (e) {
      threw = e;
    }
    const label = mode === "THROW" ? "istisna" : "hata dönüşü";
    t(`destek silme ${label} → deleteUser ÇAĞRILMIYOR, yönlendirme yok`,
      idx("auth.admin.deleteUser") === -1 && idx("redirect") === -1 && idx("ssr.signOut") === -1,
      JSON.stringify({ threw: threw ? String(threw) : null, calls }));
    t(`destek silme ${label} → yapılandırılmış hata + support adresi (iç hata metni sızmıyor)`,
      !!res && res.ok === false && typeof res.error === "string" && res.error.includes("support@aimlo.gg") &&
        !res.error.includes("permission") && !res.error.includes("fetch failed"),
      JSON.stringify(res));
  }
  world.supportDelete = null;

  // (c) sayfa vaadi koda uyuyor: "Silinecek" listesinde destek mesajları var ve
  // posta kutusundaki bildirim kopyaları için destek adresi söyleniyor.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require("node:fs") as typeof import("node:fs");
  const pageSrc = fs.readFileSync(path.join(REPO_ROOT, "app/account/delete/page.tsx"), "utf8");
  t("silme sayfası 'Silinecek' listesinde 'Destek mesajların' var",
    /<li>\s*Destek mesajların/u.test(pageSrc));
  t("silme sayfası posta kutusu kopyaları için support@aimlo.gg'yi söylüyor",
    /bildirim kopyaları/u.test(pageSrc) && /mailto:support@aimlo\.gg/.test(pageSrc));

  // ── [F34] e-postasız /verify ──────────────────────────────────────────────
  console.log("\n[F34] /verify e-postasız açılınca /login'e atmıyor, mevcut resendAction'a giden form gösteriyor");
  {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { renderToStaticMarkup } = require("react-dom/server") as typeof import("react-dom/server");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const page = require(repoFile("app/(auth)/verify/page")) as {
      default: (p: { searchParams: Promise<Record<string, string | undefined>> }) => Promise<unknown>;
    };
    for (const [ad, sp] of [
      ["parametresiz (masaüstünün açtığı adres)", {}],
      ["geçersiz e-posta (\"abc\")", { email: "abc" }],
    ] as const) {
      calls.length = 0;
      let el: unknown = null;
      let threw: unknown = null;
      try {
        el = await page.default({ searchParams: Promise.resolve({ ...sp }) });
      } catch (e) {
        threw = e;
      }
      t(`${ad}: redirect YOK`, threw === null && idx("redirect") === -1,
        JSON.stringify({ threw: threw ? String(threw) : null, calls }));
      let html = "";
      try {
        html = el ? renderToStaticMarkup(el as Parameters<typeof renderToStaticMarkup>[0]) : "";
      } catch (e) {
        html = `RENDER_HATASI ${String(e)}`;
      }
      t(`${ad}: e-posta formu render ediliyor (<form> + type=email name=email)`,
        /<form\b/.test(html) && /<input[^>]*type="email"/.test(html) && /<input[^>]*name="email"/.test(html),
        html.slice(0, 300));
    }

    // e-postalı adres eski davranışta kalır: kod giriş ekranı.
    calls.length = 0;
    const withEmail = await page.default({ searchParams: Promise.resolve({ email: "Kaan@Example.com" }) });
    const htmlWith = renderToStaticMarkup(withEmail as Parameters<typeof renderToStaticMarkup>[0]);
    t("?email= ile kod giriş ekranı (6 kutu) değişmedi",
      idx("redirect") === -1 && (htmlWith.match(/autoComplete="one-time-code"|autocomplete="one-time-code"/gi) ?? []).length === 6 &&
        htmlWith.includes("kaan@example.com"));

    // FB02 inceleme · F34: girişte doğrulanmamış hesaba login/actions.ts sessizce bir kod
    // gönderiyor; e-posta formu (VerifyEmailStartForm → resendAction) İKİNCİ kodu gönderip
    // ilkini geçersiz kılıyor. Kod ekranı eskiden bunu söylemiyor ve "Yeni kod gönder"
    // hemen basılabiliyordu (üçüncü kod + resend kotası 3/5 dk). ?sent=1 → uyarı + 60 sn.
    const LATEST_RE = /en son gelen e-postadaki kodu gir; önceki kodlar geçersiz/u;
    const COOLDOWN_RE = /Yeni kod talep etmek için[\s\S]{0,80}60s[\s\S]{0,40}bekle/u;
    const RESEND_BTN_RE = /Kod gelmedi mi\? Yeni kod gönder/u;
    const htmlSent = renderToStaticMarkup(
      (await page.default({ searchParams: Promise.resolve({ email: "kaan@example.com", sent: "1" }) })) as Parameters<typeof renderToStaticMarkup>[0]);
    t("?sent=1: 'en son gelen e-postadaki kodu gir; önceki kodlar geçersiz' + 'Yeni kod gönder' 60 sn beklemede (fix yok: düğme hemen basılır, uyarı yok)",
      LATEST_RE.test(htmlSent) && COOLDOWN_RE.test(htmlSent) && !RESEND_BTN_RE.test(htmlSent), htmlSent.slice(0, 200));
    t("sent işareti yokken ekran AYNEN (eski metin + düğme hemen basılabilir)",
      !LATEST_RE.test(htmlWith) && !COOLDOWN_RE.test(htmlWith) && RESEND_BTN_RE.test(htmlWith) && /Adresine 6 haneli bir kod gönderdik/u.test(htmlWith));
    const htmlBogus = renderToStaticMarkup(
      (await page.default({ searchParams: Promise.resolve({ email: "kaan@example.com", sent: "yes" }) })) as Parameters<typeof renderToStaticMarkup>[0]);
    const htmlFail = renderToStaticMarkup(
      (await page.default({ searchParams: Promise.resolve({ email: "kaan@example.com", sent: "1", mailfail: "quota" }) })) as Parameters<typeof renderToStaticMarkup>[0]);
    t("yalnız sabit sent=1 sayılır; mailfail varken 'yeni kod gönderdik' denmez",
      !LATEST_RE.test(htmlBogus) && RESEND_BTN_RE.test(htmlBogus) && !LATEST_RE.test(htmlFail) && /Kod gönderilemedi/u.test(htmlFail));

    // Saf akış: form mevcut resendAction'ı çağırır, başarıda ?email= adresine geçer.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const vf = require(repoFile("app/(auth)/verify/VerifyForm")) as {
      startVerification?: (
        fd: FormData,
        resend: (fd: FormData) => Promise<{ ok: boolean; error?: string; resent?: boolean }>,
        navigate: (href: string) => void,
      ) => Promise<{ ok: boolean; error?: string; resent?: boolean }>;
    };
    t("VerifyForm startVerification dışa aktarılıyor", typeof vf.startVerification === "function");
    if (typeof vf.startVerification === "function") {
      const sent: { email: string; purpose: string }[] = [];
      const nav: string[] = [];
      const fd = new FormData();
      fd.set("email", "  Kaan@Example.com ");
      const ok = await vf.startVerification(
        fd,
        async (f) => { sent.push({ email: String(f.get("email")), purpose: String(f.get("purpose")) }); return { ok: true, resent: true }; },
        (href) => nav.push(href),
      );
      t("resend'e normalize e-posta + purpose=register gidiyor",
        sent.length === 1 && sent[0].email === "kaan@example.com" && sent[0].purpose === "register", JSON.stringify(sent));
      t("başarıda /verify?email=<girilen>&purpose=register&sent=1 adresine geçiliyor (FB02 inceleme · F34: 'yeni kod' işareti)",
        ok.ok === true && nav.length === 1 && nav[0] === "/verify?email=kaan%40example.com&purpose=register&sent=1", JSON.stringify(nav));

      const nav2: string[] = [];
      const fd2 = new FormData();
      fd2.set("email", "kaan@example.com");
      const bad = await vf.startVerification(fd2, async () => ({ ok: false, error: "Çok fazla deneme" }), (h) => nav2.push(h));
      t("resend hata dönerse (ör. rate-limit) yönlendirme YOK, hata forma döner",
        bad.ok === false && bad.error === "Çok fazla deneme" && nav2.length === 0);
    }

    // Kaynak kilitleri: yeni uç açılmadı; form MEVCUT resendAction'ı çağırıyor;
    // girişteki bağlantı her hatada aynı (enumeration sızdırmaz).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("node:fs") as typeof import("node:fs");
    const read = (rel: string) => fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
    const actionsSrc = read("app/(auth)/verify/actions.ts");
    const exported = [...actionsSrc.matchAll(/export\s+async\s+function\s+(\w+)/g)].map((m) => m[1]);
    t("verify/actions.ts yeni sunucu eylemi açmadı (yalnız verifyAction + resendAction)",
      JSON.stringify(exported) === JSON.stringify(["verifyAction", "resendAction"]), JSON.stringify(exported));
    const formSrc = read("app/(auth)/verify/VerifyForm.tsx");
    const startForm = formSrc.slice(formSrc.indexOf("export function VerifyEmailStartForm"));
    t("VerifyEmailStartForm mevcut resendAction'ı startVerification üzerinden çağırıyor",
      formSrc.includes("export function VerifyEmailStartForm") && /startVerification\(/.test(startForm) &&
        /resendAction\(prev, fd\)/.test(startForm));
    const loginSrc = read("app/(auth)/login/LoginForm.tsx");
    const errBlock = loginSrc.slice(loginSrc.indexOf("{state.error && ("));
    t("LoginForm hata kutusunda koşulsuz /verify bağlantısı (hesap durumuna bağlı değil)",
      /href="\/verify"/.test(errBlock.slice(0, errBlock.indexOf("<button"))) &&
        !/needsVerification/.test(loginSrc));
  }

  console.log(`\n${fail === 0 ? "✅" : "❌"} test-account-flows: ${pass} geçti, ${fail} kırık`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error("❌ test-account-flows beklenmeyen hata:", e);
  process.exit(1);
});
