"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";
import { authRateLimit } from "@/lib/auth-rate-limit";
import { isTableMissing } from "@/lib/billing";

export interface CancelState {
  ok: boolean;
  error?: string;
}

/**
 * Aboneliği DÖNEM SONUNDA iptal et (self-servis).
 *
 * Neden Server Action, API route değil (güvenlik denetimi 2026-07-20, bulgu C1):
 * route sürümü `verifyAuthAndRateLimit` kullanıyordu; o katman kimliği YALNIZ
 * `Authorization: Bearer` başlığından okur, ama bu akış TARAYICIDAN cookie
 * oturumuyla çağrılıyor → her istek 401 alırdı, yani özellik ölü doğardı.
 * Server Action cookie oturumunu doğal kullanır ve Next'in yerleşik
 * Origin/Host doğrulamasını alır (CSRF için ayrı token gerekmez).
 * Emsal: app/account/delete/actions.ts.
 *
 * Yetki: kimlik YALNIZ oturumdan. İstemciden userId ALINMAZ — alınsaydı bir
 * kullanıcı başkasının aboneliğini iptal edebilirdi.
 */
export async function cancelSubscriptionAction(): Promise<CancelState> {
  const ssr = await createServerSupabase();
  const { data: { user }, error: userErr } = await ssr.auth.getUser();
  if (userErr || !user) {
    return { ok: false, error: "Oturum bulunamadı. Tekrar giriş yapıp dene." };
  }

  // Denetim M3: para yolunda 20/dk gevşekti; iptal/geri-al döngüsünü
  // daraltmak için auth-rate-limit'in sıkı "reset" katmanı.
  const rl = await authRateLimit("reset", `cancel:${user.id}`);
  if (rl.blocked) return { ok: false, error: rl.error };

  let svc;
  try {
    svc = createServiceSupabase();
  } catch {
    return { ok: false, error: "Sunucu yapılandırma hatası." };
  }

  // Denetim H2 + H3 + M1: select-sonra-update yerine TEK ATOMİK kapsamlı
  // update. (a) Kullanıcının BİRDEN FAZLA aktif satırı olabilir (plan
  // yükseltme / yeniden abone / webhook yarışı) — eskisi yalnız en son
  // güncelleneni iptal ederdi, diğeri sessizce yenilenmeye devam ederdi.
  // (b) Zaten iptal edilmişler `cancel_at_period_end=false` filtresiyle
  // dışarıda kalır → tekrar çağrı no-op, sağlayıcıya ikinci istek gitmez.
  // (c) TOCTOU penceresi kapanır.
  const { data: rows, error } = await svc
    .from("subscriptions")
    .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("cancel_at_period_end", false)
    .in("status", ["active", "trialing", "past_due"])
    .select("id, current_period_end");

  if (error) {
    if (isTableMissing(error)) {
      return { ok: false, error: "Abonelik sistemi henüz hazır değil." };
    }
    console.error("[account] cancel:", error.message);
    return { ok: false, error: "İptal işlemi tamamlanamadı. Lütfen tekrar dene." };
  }

  // Hiç satır dönmediyse: ya aktif abonelik yok ya da ZATEN iptal edilmiş.
  // İkisi de kullanıcı açısından "iptal durumda" — hata gösterme, sayfayı
  // tazele ki gerçek durumu görsün.
  if (!rows || rows.length === 0) {
    revalidatePath("/account");
    return { ok: true };
  }

  // TODO(sağlayıcı): Stripe/iyzico bağlandığında sağlayıcı "dönem sonunda
  // iptal" çağrısı BU YAZMADAN ÖNCE yapılmalı ve başarısız olursa yerel
  // kayıt DEĞİŞMEMELİ — aksi hâlde kullanıcı "iptal ettim" sanır ama kart
  // çekilmeye devam eder. Çağrıya idempotency-key ver.
  console.log(`[account] abonelik dönem-sonu iptali — user=${user.id.slice(0, 8)} rows=${rows.length}`);
  revalidatePath("/account");
  return { ok: true };
}
