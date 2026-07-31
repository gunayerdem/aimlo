"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PLAN_NAMES } from "@/lib/brand";

type PlanId = "aylik" | "yillik";

type Plan = {
  id: PlanId;
  name: string;
  /** Faturalandırma dönemi (tüketiciye gösterilen süre) */
  period: string;
  /** Yenilenme aralığı açıklaması */
  renewal: string;
  /** KDV DAHİL toplam (gösterim biçimi sabit — locale farkı oluşmasın) */
  total: string;
  /** KDV hariç matrah */
  net: string;
  /** %20 KDV tutarı */
  vat: string;
  /** Yurt dışı (TR ikametli olmayan) müşteri için eşdeğer tutar */
  fx: string;
  /** Plana özel ek bilgi (indirim vb.) */
  note?: string;
};

// Dijital hizmet KDV oranı %20. Tüketiciye gösterilen tutar KDV DAHİL'dir;
// matrah = brüt / 1,20 · KDV = brüt − matrah.
const VAT_RATE_LABEL = "%20";

/**
 * Cayma hakkı istisnasının geçerlilik metni — Mesafeli Sözleşmeler Yönetmeliği
 * md. 15/1-(ğ). İstisna İKİ unsuru BİRLİKTE arar:
 *   (a) tüketicinin hizmetin DERHÂL İFASINI AÇIKÇA TALEP ETMESİ,
 *   (b) cayma hakkını kaybedeceğini bildiğini beyan etmesi.
 * Yalnızca (b) alınırsa istisna sakatlanır.
 *
 * DİKKAT: Bu metin, /legal/mesafeli-satis sayfasının 6. bölümündeki
 * blockquote ile BİREBİR AYNI olmak zorundadır — sözleşme, burada fiilen
 * alınan beyanı aktarır. İkisi ayrışırsa sözleşme alınmayan bir onayı
 * alındığını beyan etmiş olur.
 * TODO(refactor): iki sayfa da bu sabiti `lib/legal-copy.ts`den okumalı.
 */
export const WITHDRAWAL_CONSENT_TEXT =
  "Hizmetin ödeme onayının hemen ardından elektronik ortamda anında ifa " +
  "edilmesini açıkça talep ediyorum ve bu nedenle cayma hakkımı " +
  "kaybedeceğimi biliyorum.";

/** Onay kaydında saklanacak sözleşme sürümü (metin değişince ARTIR). */
export const CONTRACT_VERSION = "2026-07-20";

const PLANS: Record<PlanId, Plan> = {
  aylik: {
    id: "aylik",
    /* lib/brand.ts'ten — sözleşme bedel tablosuyla BİREBİR aynı olmak
       zorunda; ayrışırsa tüketicinin neyi onayladığı belgeyle kanıtlanamaz. */
    name: PLAN_NAMES.aylik,
    period: "1 ay",
    renewal: "Her ay otomatik yenilenir",
    total: "499,00 TL",
    net: "415,83 TL",
    vat: "83,17 TL",
    fx: "9,99 USD",
  },
  yillik: {
    id: "yillik",
    name: PLAN_NAMES.yillik,
    period: "12 ay",
    renewal: "Her yıl otomatik yenilenir",
    total: "4.790,00 TL",
    net: "3.991,67 TL",
    vat: "798,33 TL",
    fx: "95,88 USD",
    note: "Aylık karşılığı 399 TL — yıllık ödemede yaklaşık %20 tasarruf.",
  },
};

function resolvePlan(raw: string | null): Plan {
  // Bilinmeyen / eksik parametre → aylık varsayılan.
  return raw === "yillik" ? PLANS.yillik : PLANS.aylik;
}

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const plan = resolvePlan(searchParams.get("plan"));

  // İki onay YASAL OLARAK AYRI alınmak zorunda: sözleşme onayı tek başına
  // cayma hakkı istisnasını geçerli kılmaz (Mesafeli Sözleşmeler Yönetmeliği).
  const [contractAccepted, setContractAccepted] = useState(false);
  const [withdrawalAccepted, setWithdrawalAccepted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // İSPAT YÜKÜ SATICIDA: istisnanın geçerliliği, onayın hangi an ve hangi
  // metin üzerinden verildiğine bağlı. Onay anı işaretlendiği anda yakalanır;
  // ödeme başlatma çağrısına bu kayıt aynen iletilir (IP + user-agent sunucu
  // tarafında eklenir — istemciye güvenilmez).
  const [contractAcceptedAt, setContractAcceptedAt] = useState<string | null>(
    null,
  );
  const [withdrawalAcceptedAt, setWithdrawalAcceptedAt] = useState<
    string | null
  >(null);

  const canPay = contractAccepted && withdrawalAccepted;

  /** Sipariş kaydına yazılacak onay kanıtı (ispat yükü SATICIDA). */
  function buildConsentRecord() {
    return {
      contractVersion: CONTRACT_VERSION,
      // Sözleşme + Ön Bilgilendirme Formu onayı
      contractAcceptedAt,
      // Cayma hakkı istisnası beyanı — onaylanan METNİN TAM HÂLİ
      withdrawalAcceptedAt,
      withdrawalConsentText: WITHDRAWAL_CONSENT_TEXT,
    };
  }

  function handlePay() {
    if (!canPay) return;
    // TODO(paddle): ödeme sağlayıcısı entegrasyonu buraya bağlanacak.
    //
    // NOT (denetim B18, 2026-07-31): bu TODO eskiden "iyzico" diyordu, oysa
    // sağlayıcı kararı PADDLE. Yanlış sağlayıcıya göre yazılmış bir plan,
    // webhook tarafında birebir yaşandı (Stripe imza şeması → her istek 400);
    // aynı hatayı checkout'ta tekrarlamamak için akış Paddle'a göre yazıldı:
    //   1) POST /api/billing/checkout  { plan: plan.id, consent: buildConsentRecord() }
    //      → sunucu consent kaydını IP + user-agent + metin hash'i ile birlikte
    //        siparişe YAZAR (istemciden gelen an güvenilmez; sunucu kendi
    //        saatini de kaydeder).
    //   2) Sunucu, Paddle transaction/checkout oluştururken
    //      `custom_data.user_id`'yi MUTLAKA `supabase.auth.getUser()` ile
    //      doğrulanmış oturumdan koyar — ASLA istek gövdesinden. (Webhook
    //      kullanıcıyı yalnız bu alandan eşliyor: app/api/billing/webhook.)
    //   3) Dönen transaction id / checkout url ile Paddle overlay'i aç.
    //   4) Gerçek aktivasyon webhook'tan gelir (subscription.* +
    //      transaction.completed) — istemcinin "başarılı" demesi yetmez.
    // Entegrasyon bağlanana kadar kanıt kaydı yalnızca hazırlanır.
    void buildConsentRecord();
    setNotice(
      "Ödeme altyapısı aktivasyon aşamasında — çok yakında hizmete açılacak. Bu süreçte support@aimlo.gg adresinden bize ulaşabilirsiniz.",
    );
  }

  return (
    <div className="space-y-8">
      {/* ---- Sipariş özeti ---- */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">Siparişiniz</h2>

        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">{plan.name}</p>
              <p className="text-[12px] text-neutral-500">
                Faturalandırma dönemi: {plan.period} · {plan.renewal}
              </p>
            </div>
            <p className="text-lg font-black text-white whitespace-nowrap">
              {plan.total}
            </p>
          </div>

          {plan.note && (
            <p className="text-[12px] text-[#FF6B77]">{plan.note}</p>
          )}

          <div className="border-t border-white/10 pt-4 space-y-2 text-sm text-neutral-300">
            <div className="flex justify-between gap-4">
              <span className="text-neutral-400">Ara toplam (KDV hariç)</span>
              <span>{plan.net}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral-400">
                KDV ({VAT_RATE_LABEL})
              </span>
              <span>{plan.vat}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-white/10 pt-2 text-base font-bold text-white">
              <span>Ödenecek toplam</span>
              <span>{plan.total}</span>
            </div>
          </div>

          <p className="text-[12px] text-neutral-500">
            Tüm fiyatlar KDV dahildir. Tek çekim olarak tahsil edilir —
            taksit uygulanmaz. Kargo/teslimat bedeli yoktur (dijital hizmet).
          </p>
        </div>

        <p className="text-[12px] leading-relaxed text-neutral-500">
          Türkiye&apos;de yerleşik müşterilerimiz mevzuat gereği{" "}
          <span className="text-neutral-300">her durumda Türk Lirası (TL)</span>{" "}
          ile ücretlendirilir. Yurt dışında yerleşik müşteriler için bu planın
          karşılığı {plan.fx}&apos;dir.
        </p>
      </section>

      {/* ---- Hizmetin niteliği ve süresi ---- */}
      <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
        <h2 className="text-lg font-bold text-white">
          Hizmetin Niteliği ve Süresi
        </h2>
        <p>
          AIMLO, Valorant oyuncularına yapay zekâ destekli round sonu koçluk
          geri bildirimi sunan bir dijital abonelik hizmetidir. Satın aldığınız
          plan <span className="text-white">{plan.period}</span> süreyle
          geçerlidir ve {plan.renewal.toLowerCase()}.
        </p>
        <p>
          Hizmet, elektronik ortamda <span className="text-white">anında ifa</span>{" "}
          edilir: ödeme onayından hemen sonra abonelik hesabınıza tanımlanır ve
          masaüstü uygulaması ile web panelindeki abonelik özellikleri
          kullanıma açılır.
        </p>
        <p>
          Aboneliğinizi dilediğiniz zaman hesap ayarlarınızdan iptal
          edebilirsiniz; iptal, içinde bulunduğunuz dönemin sonunda geçerli olur
          ve sonraki yenileme alınmaz.
        </p>
      </section>

      {/* ---- Zorunlu onaylar ---- */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">Onaylar</h2>

        <label className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 cursor-pointer hover:border-white/20">
          <input
            type="checkbox"
            checked={contractAccepted}
            onChange={(e) => {
              setContractAccepted(e.target.checked);
              setContractAcceptedAt(
                e.target.checked ? new Date().toISOString() : null,
              );
            }}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#FF4655]"
          />
          <span className="text-sm leading-relaxed text-neutral-300">
            <Link
              href="/legal/mesafeli-satis"
              target="_blank"
              className="text-[#FF4655] hover:underline"
            >
              Mesafeli Satış Sözleşmesi
            </Link>
            &apos;ni ve{" "}
            <Link
              href="/legal/mesafeli-satis#on-bilgilendirme"
              target="_blank"
              className="text-[#FF4655] hover:underline"
            >
              Ön Bilgilendirme Formu
            </Link>
            &apos;nu okudum, onaylıyorum.
          </span>
        </label>

        <label className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 cursor-pointer hover:border-white/20">
          <input
            type="checkbox"
            checked={withdrawalAccepted}
            onChange={(e) => {
              setWithdrawalAccepted(e.target.checked);
              setWithdrawalAcceptedAt(
                e.target.checked ? new Date().toISOString() : null,
              );
            }}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#FF4655]"
          />
          <span className="text-sm leading-relaxed text-neutral-300">
            {/* Metin SABİTTEN gelir: /legal/mesafeli-satis §6 blockquote ile
                birebir aynı kalmalı — istisnanın geçerlilik şartı. */}
            {WITHDRAWAL_CONSENT_TEXT}
          </span>
        </label>

        <p className="text-[12px] leading-relaxed text-neutral-500">
          Mesafeli Sözleşmeler Yönetmeliği madde 15/1-(ğ) uyarınca, elektronik
          ortamda anında ifa edilen hizmetlerde cayma hakkı istisnası ancak
          tüketicinin <span className="text-neutral-300">derhâl ifayı açıkça
          talep etmesi</span> ve{" "}
          <span className="text-neutral-300">
            cayma hakkını kaybedeceğini bildiğini beyan etmesi
          </span>{" "}
          hâlinde geçerlidir. Bu beyan, sözleşme onayından ayrı bir onay kutusu
          ile alınır. Onay verdiğiniz an, işbu beyanın tam metni ve sözleşme
          sürümü ({CONTRACT_VERSION}) sipariş kaydınıza işlenir.
        </p>
      </section>

      {/* ---- Ödeme ---- */}
      <section className="space-y-3 border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={handlePay}
          disabled={!canPay}
          aria-disabled={!canPay}
          className="w-full rounded-lg bg-[#FF4655] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#FF6B77] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-500 disabled:hover:bg-white/10"
        >
          Ödemeye Geç — {plan.total}
        </button>

        {!canPay && (
          <p className="text-[12px] text-neutral-500" role="status">
            Ödemeye geçmek için yukarıdaki iki onayı da işaretlemeniz
            gerekmektedir.
          </p>
        )}

        {notice && (
          <p
            role="status"
            className="rounded-lg border border-[#FF4655]/30 bg-[#FF4655]/10 p-4 text-sm leading-relaxed text-neutral-200"
          >
            {notice}
          </p>
        )}

        <p className="text-[12px] leading-relaxed text-neutral-500">
          Ödeme işlemi, lisanslı ödeme kuruluşu altyapısı üzerinden güvenli
          şekilde gerçekleştirilir. Kart bilgileriniz AIMLO sunucularında
          saklanmaz.
        </p>
      </section>
    </div>
  );
}
