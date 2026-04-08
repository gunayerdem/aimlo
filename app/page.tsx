"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { saveDraft, loadDraft, clearDraft, saveLang, loadLang } from "@/lib/storage";
import { calculateSkillProfile } from "@/lib/skill-system";
import { analyzePlaystyle } from "@/lib/playstyle-system";
import { ds } from "@/constants/design";
import {
  AGENT_GROUPS, AGENT_GROUP_LABELS, AGENT_COLORS, AGENT_BORDER, AGENT_ACCENT,
  getAgentRole, getAgentInitials, agentImgUrl,
  MAP_LOCATIONS, MAPS, MAP_IMAGES, SCORE_OPTIONS, IC,
} from "@/constants/game-data";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { User } from "@supabase/supabase-js";
import type {
  Lang,
  Screen,
  RoundResult,
  SetupStep,
  SetupData,
  RoundFeedback,
  RoundData,
  RoundForm,
  FormErrors,
  RoundScreenMode,
  MatchScore,
  CompTarget,
  AuthMode,
  SavedReport,
  DraftState,
} from "@/types";
/* ══════════════════════════════════════════════════════════
   AUTH TOKEN HELPER — for API calls
   ══════════════════════════════════════════════════════════ */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  return headers;
}
/* ══════════════════════════════════════════════════════════
   RESPONSE VALIDATORS
   ══════════════════════════════════════════════════════════ */
function isValidFeedback(obj: unknown): obj is RoundFeedback {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.deathAnalysis === "string" &&
    Array.isArray(o.enemyPatterns) &&
    o.enemyPatterns.every((p: unknown) => typeof p === "string") &&
    typeof o.nextRoundPlan === "string"
  );
}
function isValidReport(obj: unknown): obj is ReturnType<typeof genMatchReport> {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.summary === "string" &&
    typeof o.scoreStr === "string" &&
    typeof o.winPct === "number"
  );
}
/* ══════════════════════════════════════════════════════════
   PROFILE HELPER — upsert after signup (with retry + return status)
   ══════════════════════════════════════════════════════════ */
async function upsertProfile(
  userId: string,
  data: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  },
): Promise<{ ok: boolean; error?: string }> {
  const payload = {
    user_id: userId,
    username: data.username.toLowerCase().trim(),
    email: data.email.toLowerCase().trim(),
    first_name: data.first_name.trim(),
    last_name: data.last_name.trim(),
  };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "user_id" });
      if (!error) return { ok: true };
      console.error(
        `[Aimlo] Profile upsert attempt ${attempt + 1}:`,
        error.message,
        error.details,
      );
      if (attempt === 1) return { ok: false, error: error.message };
    } catch (err) {
      console.error(
        `[Aimlo] Profile upsert exception attempt ${attempt + 1}:`,
        err,
      );
      if (attempt === 1)
        return {
          ok: false,
          error: err instanceof Error ? err.message : "Unknown error",
        };
    }
  }
  return { ok: false, error: "Profile creation failed" };
}

async function checkUsernameAvailable(username: string): Promise<boolean> {
  try {
    // Use secure RPC function instead of direct table query
    const { data: foundEmail, error } = await supabase.rpc(
      "lookup_email_by_username",
      { lookup_username: username.toLowerCase().trim() },
    );
    if (error) {
      console.error("[Aimlo] Username check error:", error.message);
      return true; // allow attempt, DB constraint will catch duplicates
    }
    return !foundEmail; // null means username is available
  } catch {
    return true;
  }
}
/* ══════════════════════════════════════════════════════════
   BRAND
   ══════════════════════════════════════════════════════════ */
const AIMLO_LOGO_SRC = "/aimlo-logo.png";
function AimloLogo({
  size = 48,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={AIMLO_LOGO_SRC}
      alt="Aimlo"
      style={{
        height: size,
        width: "auto",
        maxWidth: `min(88vw, ${Math.round(size * 3)}px)`,
      }}
      className={`object-contain object-left shrink-0 ${className}`}
      draggable={false}
    />
  );
}
function AimloWordmark({
  size = "text-4xl",
  className = "",
}: {
  size?: string;
  className?: string;
}) {
  return (
    <span
      className={`font-extrabold text-white ${size} ${className}`}
      style={{ letterSpacing: "-0.02em", lineHeight: 1 }}
    >
      AIM
      <span
        className="bg-clip-text text-transparent"
        style={{
          backgroundImage: "linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)",
        }}
      >
        LO
      </span>
    </span>
  );
}
/* game-data, design, storage, hook — imported from separate files */
/* ══════════════════════════════════════════════════════════
   AUTH ERROR LOCALIZATION — Turkish chars fixed
   ══════════════════════════════════════════════════════════ */
function localizeAuthError(msg: string, lang: Lang): string {
  if (lang !== "tr") return msg;
  const m: Record<string, string> = {
    "Invalid login credentials": "Geçersiz e-posta veya şifre",
    "Email not confirmed": "E-posta adresi henüz doğrulanmadı",
    "User already registered": "Bu e-posta zaten kayıtlı",
    "Password should be at least 6 characters": "Şifre en az 6 karakter olmalı",
    "Unable to validate email address: invalid format":
      "Geçersiz e-posta formatı",
    "Signup requires a valid password": "Geçerli bir şifre girin",
    "Email rate limit exceeded":
      "Çok fazla deneme yapıldı. Lütfen 1-2 dakika bekleyip tekrar deneyin.",
    "For security purposes, you can only request this after 60 seconds":
      "Güvenlik nedeniyle 60 saniye beklemeniz gerekiyor. Lütfen biraz sonra tekrar deneyin.",
    "over_email_send_rate_limit":
      "E-posta gönderim limiti aşıldı. Lütfen birkaç dakika bekleyin.",
    "Too many requests":
      "Çok fazla istek gönderildi. Lütfen 1-2 dakika bekleyip tekrar deneyin.",
    "Network error": "Bağlantı hatası. İnterneti kontrol edin.",
    "Username not found": "Kullanıcı adı bulunamadı",
  };
  for (const [key, val] of Object.entries(m)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return msg;
}
/* ══════════════════════════════════════════════════════════
   i18n — ALL TURKISH CHARACTERS FIXED
   ══════════════════════════════════════════════════════════ */
const t = {
  tr: {
    tagline: "Valorant koçluk asistanın",
    subtitle: "Tur sonrası kısa Valorant koçluk geri bildirimi al",
    setupTitle: "Maç Kurulumu",
    map: "Harita",
    mapPh: "Harita seçin",
    agent: "Ajanın",
    agentPh: "Ajan seçin",
    side: "Taraf",
    sidePh: "Taraf seçin",
    sideAttack: "Saldırı",
    sideDefense: "Savunma",
    teamComp: "Takım Kompozisyonu",
    enemyComp: "Düşman Kompozisyonu",
    unknownEnemy: "Düşman kompunu bilmiyorum",
    startMatch: "Maçı Başlat",
    back: "Geri",
    next: "İleri",
    roundTitle: (n: number) => `Round ${n}`,
    deathLocation: "Ölüm Konumu",
    deathLocationPh: "Konum seçin",
    enemyCount: "Düşman Sayısı",
    enemyCountPh: "Düşman sayısı seçin",
    yourNote: "Senin Notun",
    yourNotePh:
      "ör. rotate oldum, solo anchor oynuyordum, trade bekliyordum\u2026",
    skipRound: "Bu Round'u Atla",
    skipConfirmTitle: "Round'u kazandınız mı?",
    yes: "Evet",
    no: "Hayır",
    nextRound: "Sonraki Round",
    finishMatch: "Maçı Bitir",
    feedbackTitle: "Round Geri Bildirimi",
    deathAnalysis: "Ölüm Analizi",
    enemyPatterns: "Düşman Analizi",
    nextRoundPlan: "Sonraki Round Planı",
    reportTitle: "Maç Raporu",
    overallSummary: "Genel Maç Özeti",
    mainRecurringMistake: "Ana Tekrarlayan Hata",
    enemyTendencies: "Düşman Eğilimleri",
    suggestedAdjustment: "Önerilen Düzenleme",
    bestRound: "En İyi Round",
    decisionScore: "Karar Verme Puanı",
    matchResult: "Maç Sonucu",
    finalScore: "Final Skoru",
    roundsPlayed: "Oynanan Round",
    roundsWon: "Kazanılan",
    roundsLost: "Kaybedilen",
    roundsSkipped: "Atlanan",
    newMatch: "Yeni Maç",
    required: "Bu alan zorunlu",
    noteTooShort: "En az 3 karakter girin",
    selectAll: "Tüm slotları doldurun",
    wonLabel: "G",
    lostLabel: "M",
    skippedLabel: "A",
    roundResultWin: "Kazanıldı",
    roundResultLoss: "Kaybedildi",
    scoreTitle: "Maç skoru nedir?",
    confirmScore: "Raporu Oluştur",
    selectAgent: "Ajan Seçin",
    selected: "Seçildi",
    slotsRemaining: (n: number) => `${n} slot kaldı`,
    clearAll: "Temizle",
    stepMapAgent: "Harita & Ajan",
    stepSideComp: "Taraf & Komp",
    stepConfirm: "Başlat",
    roundResult: "Round Sonucu",
    yourTeam: "Takımın",
    enemyTeam: "Düşman Takımı",
    locked: "Kilitli",
    selectScore: "Skor seçin",
    compTitle: "Takım Kompozisyonları",
    agentPool: "Ajan Havuzu",
    victory: "Zafer",
    defeat: "Yenilgi",
    survived: "Ölmedim",
    survivedShort: "Hayatta",
    authLogin: "Giriş Yap",
    authRegister: "Kayıt Ol",
    authEmail: "E-posta",
    authPassword: "Şifre",
    authEmailPh: "ornek@email.com",
    authPasswordPh: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    authNoAccount: "Hesabın yok mu?",
    authHasAccount: "Zaten hesabın var mı?",
    authSignOut: "Çıkış",
    authLoading: "Yükleniyor...",
    authError: "Bir hata oluştu",
    authCheckEmail: "E-postanı kontrol et! Doğrulama linki gönderdik.",
    dashTitle: "Kontrol Paneli",
    dashSub: "Geçmiş raporlarını görüntüle veya AIMLO Desktop'ı indir",
    dashNewMatch: "Manuel Analiz",
    dashNewMatchDesc: "Canlı analiz için AIMLO Desktop kullanın",
    dashRecentTitle: "Son Analizler",
    dashNoData: "Henüz analiz yok",
    dashNoDataDesc: "İlk maçını analiz etmek için yeni bir analiz başlat",
    dashHistory: "Tüm Geçmiş",
    dashWinRate: "Kazanma Oranı",
    dashMatches: "Maç",
    dashFreqMistake: "En Sık Hata",
    dashFreqDeath: "En Sık Ölüm Yeri",
    dashNoStats: "Henüz veri yok",
    historyTitle: "Maç Geçmişi",
    historyEmpty: "Henüz kayıtlı maç yok",
    historyEmptyDesc: "Analizlerini tamamladıktan sonra burada göreceksin",
    confirmTitle: "Maç Özeti",
    confirmDesc: "Kurulumunu kontrol et ve başla",
    savingReport: "Rapor kaydediliyor...",
    reportSaved: "Rapor kaydedildi",
    draftRestored: "Taslak yüklendi",
    viewDetails: "Detayları Gör",
    roundDetails: "Round Detayları",
    returnToMenu: "Ana Menüye Dön",
    enteredRounds: "Girilen Round",
    langSelectTitle: "Dil Seçin",
    authFirstName: "Ad",
    authLastName: "Soyad",
    authUsername: "Kullanıcı Adı",
    authFirstNamePh: "Adınız",
    authLastNamePh: "Soyadınız",
    authUsernamePh: "kullaniciadi",
    authPasswordConfirm: "Şifre Tekrar",
    authPasswordConfirmPh: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    authPasswordMismatch: "Şifreler eşleşmiyor",
    authEmailOrUsername: "E-posta veya Kullanıcı Adı",
    authEmailOrUsernamePh: "ornek@email.com veya kullaniciadi",
    landingHeroTitle: "Yapay Zeka Destekli Valorant Koçun",
    landingHeroSub:
      "Her round sonrası kişiselleştirilmiş analiz ve geri bildirim al. Oyununu bir üst seviyeye taşı.",
    landingCTA: "Uygulamayı İndir",
    landingAboutTitle: "Hakkımızda",
    landingAboutText:
      "AIMLO, Valorant oyuncuları için yapay zeka destekli koçluk platformudur. Her maç sonrası detaylı analiz, round bazlı geri bildirim ve kişiselleştirilmiş gelişim önerileri sunar.",
    landingAboutMission:
      "Amacımız her seviyeden oyuncunun potansiyelini en üst düzeye çıkarmasına yardımcı olmaktır. Geleneksel istatistik araçları sadece rakamları gösterir; AIMLO neden kaybettiğinizi, hangi hatalarınızı tekrarladığınızı ve bir sonraki round'da ne yapmanız gerektiğini söyler.",
    landingB2BTitle: "Takımlar & Organizasyonlar",
    landingB2BText:
      "Espor organizasyonları ve takımlar için özel analiz panelleri, toplu oyuncu takibi ve koçluk araçları sunuyoruz. Takım performansını veriye dayalı kararlarla optimize edin.",
    landingB2CTitle: "Bireysel Oyuncular",
    landingB2CText:
      "Kendi temponuzda ilerleyin. Her maçınızı analiz edin, hatalarınızı tespit edin ve AI destekli önerilerle rank atlayın. Ücretsiz başlayın, gelişiminizi takip edin.",
    landingFaqTitle: "Sıkça Sorulan Sorular",
    landingBlogTitle: "Blog",
    landingBlogText:
      "Yakında! Valorant stratejileri, meta analizleri ve oyun geliştirme ipuçları burada paylaşılacak.",
    landingHelpText:
      "Sorularınız mı var? Bize e-posta gönderin, en kısa sürede dönüş yapalım.",
    landingHelpEmail: "İletişim: support@aimlo.gg",
    landingNav: { about: "Hakkımızda", blog: "Blog", faq: "SSS" },
    landingFaqs: [
      {
        q: "AIMLO ücretsiz mi?",
        a: "Evet, AIMLO'nun temel analiz ve koçluk özellikleri tamamen ücretsizdir. Maç kurulumu, round bazlı geri bildirim ve maç sonu raporu gibi tüm çekirdek özellikler ücretsiz planda yer alır. Gelişmiş AI destekli derinlemesine analiz, geçmiş maç karşılaştırması ve kişiselleştirilmiş gelişim haritası gibi premium özellikler ise yakında sunulacaktır.",
      },
      {
        q: "Nasıl çalışıyor?",
        a: "AIMLO, maç sırasında her round sonrası girdiğin kısa notları yapay zeka motoruyla analiz eder. Ölüm konumun, karşılaştığın düşman sayısı ve kendi notların üzerinden anlık koçluk geri bildirimi üretir. Maç sonunda ise tüm round verilerini birleştirerek tekrarlayan hatalarını, düşman eğilimlerini ve stratejik öneriler içeren kapsamlı bir rapor oluşturur.",
      },
      {
        q: "Hangi rank seviyelerine uygun?",
        a: "AIMLO, Iron'dan Radiant'a kadar her seviyedeki Valorant oyuncusu için tasarlanmıştır. Analiz motoru, oyuncunun seviyesine göre öneriler üretir. Düşük ranklarda temel pozisyonlama ve rotasyon hataları vurgulanırken, yüksek ranklarda utility zamanlaması, trade pozisyonları ve takım koordinasyonu gibi daha ileri konulara odaklanılır.",
      },
      {
        q: "Verilerim güvende mi?",
        a: "Kesinlikle. Tüm kullanıcı verileri Supabase altyapısı üzerinde şifrelenmiş olarak saklanır ve Row Level Security (RLS) politikalarıyla korunur. Hiçbir kullanıcı başka bir kullanıcının verilerine erişemez. Maç analizlerin, round notların ve raporların yalnızca senin hesabın tarafından görüntülenebilir.",
      },
      {
        q: "Yardıma ihtiyacım var, nasıl ulaşabilirim?",
        a: "Herhangi bir sorun, öneri veya geri bildirim için support@aimlo.gg adresine e-posta gönderebilirsin. Ekibimiz genellikle 24 saat içinde dönüş yapar. Ayrıca uygulama içi geri bildirim formunu da kullanabilirsin. Topluluk desteği ve güncellemeler için sosyal medya kanallarımızı da takip edebilirsin.",
      },
    ],
    landingFeatures: [
      {
        icon: "zap",
        title: "Anlık Geri Bildirim",
        desc: "Her round sonrası AI destekli analiz",
      },
      {
        icon: "chart",
        title: "Detaylı Raporlar",
        desc: "Maç sonu kapsamlı performans raporu",
      },
      {
        icon: "target",
        title: "Hata Tespiti",
        desc: "Tekrarlayan hataları otomatik tespit",
      },
      {
        icon: "trend",
        title: "Gelişim Takibi",
        desc: "Zaman içindeki ilerlemenizi görün",
      },
    ],
    landingHowTitle: "Nasıl Çalışıyor?",
    landingHowSteps: [
      { step: "1", title: "Maç Kur", desc: "Harita, ajan ve takımını seç" },
      {
        step: "2",
        title: "Round Notları",
        desc: "Her round sonrası ölüm yeri ve notlarını gir",
      },
      {
        step: "3",
        title: "AI Analiz",
        desc: "Anlık geri bildirim ve öneriler al",
      },
      {
        step: "4",
        title: "Maç Raporu",
        desc: "Detaylı maç sonu analiz raporu gör",
      },
    ],
    landingDiffTitle: "Neden AIMLO?",
    landingDiffItems: [
      {
        title: "Sadece Rakam Değil, Çözüm",
        desc: "Diğer araçlar kill/death gösterir. AIMLO neden kaybettiğinizi açıklar.",
      },
      {
        title: "Round Bazlı Koçluk",
        desc: "Her round sonrası stratejik öneriler alarak oyununuzu anında iyileştirin.",
      },
      {
        title: "Kişisel Gelişim Haritası",
        desc: "Zaman içinde hatalarınızın nasıl azaldığını ve hangi alanlarda geliştiğinizi görün.",
      },
    ],
    landingStatsTitle: "Platform İstatistikleri",
    landingStats: [
      { value: "10K+", label: "Analiz Edilen Round" },
      { value: "2.5K+", label: "Maç Raporu" },
      { value: "500+", label: "Aktif Oyuncu" },
      { value: "94%", label: "Memnuniyet" },
    ],
    goToDashboard: "Panele Git",
    homePage: "Ana Sayfa",
    dashTopAgent: "En Çok Kullanılan Ajan",
    dashAISummary: "AI Analiz Özeti",
    dashMostMistake: "En Sık Hata",
    dashStrength: "Güçlü Yön",
    dashImproveArea: "Gelişim Alanı",
    dashAgentPerf: "Ajan Performansı",
    dashMapPerf: "Harita Performansı",
    dashLiveOnly: "Canlı feedback için desktop uygulamasını kullanın",
    downloadTitle: "AIMLO Desktop İndir",
    downloadSub: "Canlı AI koçluk için masaüstü uygulamasını kullan",
    downloadFeature1: "Otomatik izleme",
    downloadFeature2: "Overlay feedback",
    downloadFeature3: "Canlı analiz",
    downloadBtn: "İndir",
    navDownload: "Uygulamayı İndir",
    aiInsightTitle: "AI INSIGHT",
    aiInsightNoData: "Henüz yeterli veri yok. Birkaç maç analiz et, AI seni tanısın.",
    aiInsightMoreData: "Daha fazla maç verisi gerekiyor.",
    problemAreasTitle: "PROBLEM BÖLGELERİ",
    problemDeathZone: "Ölüm Bölgesi",
    problemWeakMap: "Zayıf Harita",
    problemPattern: "Tekrarlayan Hata",
    problemNoData: "Veri yok",
    problemDeathDesc: "kez öldün",
    problemMapDesc: "winrate",
    problemPatternDesc: "tekrarlayan ölüm bölgesi",
    matchInsightStrong: "Güçlü maç",
    matchInsightRepeat: "pozisyon tekrarı",
    matchInsightDeaths: "ölüm",
    matchInsightBadLoss: "Zor maç — ana sorunu analiz et",
    historyFilterMap: "Harita Filtresi",
    historyFilterAgent: "Ajan Filtresi",
    historyFilterResult: "Sonuç",
    historyAll: "Tümü",
    historyWins: "Galibiyetler",
    historyLosses: "Mağlubiyetler",
    reportRoundTimeline: "Round Zaman Çizelgesi",
    reportRoundFeedback: "Round Geri Bildirimi",
    reportPerfMetrics: "Performans Metrikleri",
    reportDeaths: "Ölüm",
    reportSurvivedRounds: "Hayatta Kalınan",
    reportTopDeathLoc: "En Çok Ölüm Yeri",
    reportWinRate: "Kazanma Oranı",
    noFeedback: "Bu round için geri bildirim yok",
  },
  en: {
    tagline: "Your Valorant coaching assistant",
    subtitle: "Get short post-round Valorant coaching feedback",
    setupTitle: "Match Setup",
    map: "Map",
    mapPh: "Select a map",
    agent: "Your Agent",
    agentPh: "Select agent",
    side: "Side",
    sidePh: "Select side",
    sideAttack: "Attack",
    sideDefense: "Defense",
    teamComp: "Team Composition",
    enemyComp: "Enemy Composition",
    unknownEnemy: "I don't know enemy comp",
    startMatch: "Start Match",
    back: "Back",
    next: "Next",
    roundTitle: (n: number) => `Round ${n}`,
    deathLocation: "Death Location",
    deathLocationPh: "Select location",
    enemyCount: "Enemy Count",
    enemyCountPh: "Select enemy count",
    yourNote: "Your Note",
    yourNotePh: "e.g. rotated too early, solo anchoring, expected trade\u2026",
    skipRound: "Skip This Round",
    skipConfirmTitle: "Did you win the round?",
    yes: "Yes",
    no: "No",
    nextRound: "Next Round",
    finishMatch: "Finish Match",
    feedbackTitle: "Round Feedback",
    deathAnalysis: "Death Analysis",
    enemyPatterns: "Enemy Analysis",
    nextRoundPlan: "Next Round Plan",
    reportTitle: "Match Report",
    overallSummary: "Overall Match Summary",
    mainRecurringMistake: "Main Recurring Mistake",
    enemyTendencies: "Enemy Tendencies",
    suggestedAdjustment: "Suggested Adjustment",
    bestRound: "Best Round",
    decisionScore: "Decision Score",
    matchResult: "Match Result Overview",
    finalScore: "Final Score",
    roundsPlayed: "Rounds Played",
    roundsWon: "Won",
    roundsLost: "Lost",
    roundsSkipped: "Skipped",
    newMatch: "New Match",
    required: "This field is required",
    noteTooShort: "Enter at least 3 characters",
    selectAll: "Fill all slots",
    wonLabel: "W",
    lostLabel: "L",
    skippedLabel: "S",
    roundResultWin: "Won",
    roundResultLoss: "Lost",
    scoreTitle: "What was the final score?",
    confirmScore: "Generate Report",
    selectAgent: "Select Agent",
    selected: "Selected",
    slotsRemaining: (n: number) => `${n} slots remaining`,
    clearAll: "Clear",
    stepMapAgent: "Map & Agent",
    stepSideComp: "Side & Comp",
    stepConfirm: "Start",
    roundResult: "Round Result",
    yourTeam: "Your Team",
    enemyTeam: "Enemy Team",
    locked: "Locked",
    selectScore: "Select score",
    compTitle: "Team Compositions",
    agentPool: "Agent Pool",
    victory: "Victory",
    defeat: "Defeat",
    survived: "I didn't die",
    survivedShort: "Alive",
    authLogin: "Sign In",
    authRegister: "Sign Up",
    authEmail: "Email",
    authPassword: "Password",
    authEmailPh: "example@email.com",
    authPasswordPh: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    authNoAccount: "Don't have an account?",
    authHasAccount: "Already have an account?",
    authSignOut: "Sign Out",
    authLoading: "Loading...",
    authError: "An error occurred",
    authCheckEmail: "Check your email! We sent a verification link.",
    dashTitle: "Dashboard",
    dashSub: "View past reports or download AIMLO Desktop",
    dashNewMatch: "Manual Analysis",
    dashNewMatchDesc: "Use AIMLO Desktop for live analysis",
    dashRecentTitle: "Recent Analyses",
    dashNoData: "No analyses yet",
    dashNoDataDesc: "Start your first analysis to begin improving",
    dashHistory: "View All",
    dashWinRate: "Win Rate",
    dashMatches: "Matches",
    dashFreqMistake: "Most Frequent Mistake",
    dashFreqDeath: "Most Common Death Spot",
    dashNoStats: "No data yet",
    historyTitle: "Match History",
    historyEmpty: "No matches recorded yet",
    historyEmptyDesc: "Your completed analyses will appear here",
    confirmTitle: "Match Summary",
    confirmDesc: "Review your setup and start",
    savingReport: "Saving report...",
    reportSaved: "Report saved",
    draftRestored: "Draft restored",
    viewDetails: "View Details",
    roundDetails: "Round Details",
    returnToMenu: "Return to Main Menu",
    enteredRounds: "Entered Rounds",
    langSelectTitle: "Choose Language",
    authFirstName: "First Name",
    authLastName: "Last Name",
    authUsername: "Username",
    authFirstNamePh: "Your first name",
    authLastNamePh: "Your last name",
    authUsernamePh: "username",
    authPasswordConfirm: "Confirm Password",
    authPasswordConfirmPh: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    authPasswordMismatch: "Passwords do not match",
    authEmailOrUsername: "Email or Username",
    authEmailOrUsernamePh: "example@email.com or username",
    landingHeroTitle: "Your AI-Powered Valorant Coach",
    landingHeroSub:
      "Get personalized post-round analysis and feedback. Elevate your game to the next level.",
    landingCTA: "Download App",
    landingAboutTitle: "About Us",
    landingAboutText:
      "AIMLO is an AI-powered coaching platform for Valorant players. We provide detailed post-match analysis, round-by-round feedback, and personalized improvement suggestions.",
    landingAboutMission:
      "Our mission is to help players of all levels reach their full potential. Traditional stat tools only show numbers; AIMLO tells you why you lost, which mistakes you repeat, and what to do next round.",
    landingB2BTitle: "Teams & Organizations",
    landingB2BText:
      "We offer custom analytics dashboards, bulk player tracking, and coaching tools for esports organizations and teams. Optimize your team's performance with data-driven decisions.",
    landingB2CTitle: "Individual Players",
    landingB2CText:
      "Progress at your own pace. Analyze every match, identify your mistakes, and climb ranks with AI-powered suggestions. Start for free and track your improvement.",
    landingFaqTitle: "Frequently Asked Questions",
    landingBlogTitle: "Blog",
    landingBlogText:
      "Coming soon! Valorant strategies, meta analyses, and gameplay tips will be shared here.",
    landingHelpText:
      "Have questions? Send us an email and we'll get back to you as soon as possible.",
    landingHelpEmail: "Contact: support@aimlo.gg",
    landingNav: { about: "About", blog: "Blog", faq: "FAQ" },
    landingFaqs: [
      {
        q: "Is AIMLO free?",
        a: "Yes, AIMLO's core coaching features are completely free. This includes match setup, round-by-round feedback, and end-of-match reports. Premium features like advanced AI-powered deep analysis, historical match comparison, and personalized improvement roadmaps will be available in upcoming plans.",
      },
      {
        q: "How does it work?",
        a: "AIMLO analyzes the short notes you enter after each round using its AI engine. Based on your death location, enemy count, and personal notes, it generates instant coaching feedback. At the end of the match, all round data is combined to produce a comprehensive report covering recurring mistakes, enemy tendencies, and strategic recommendations.",
      },
      {
        q: "What rank levels is it for?",
        a: "AIMLO is designed for every Valorant player from Iron to Radiant. The analysis engine adapts its suggestions to your level. Lower-ranked players receive guidance on positioning and rotation fundamentals, while higher-ranked players get insights on utility timing, trade setups, and team coordination.",
      },
      {
        q: "Is my data safe?",
        a: "Absolutely. All user data is stored encrypted on Supabase infrastructure and protected by Row Level Security (RLS) policies. No user can access another user's data. Your match analyses, round notes, and reports are only viewable by your own account.",
      },
      {
        q: "I need help, how can I reach you?",
        a: "For any issues, suggestions, or feedback, you can email us at support@aimlo.gg. Our team typically responds within 24 hours. You can also use the in-app feedback form for quick reports. Follow our social media channels for community support and updates.",
      },
    ],
    landingFeatures: [
      {
        icon: "zap",
        title: "Instant Feedback",
        desc: "AI-powered analysis after each round",
      },
      {
        icon: "chart",
        title: "Detailed Reports",
        desc: "Comprehensive post-match performance report",
      },
      {
        icon: "target",
        title: "Mistake Detection",
        desc: "Automatically detect recurring mistakes",
      },
      {
        icon: "trend",
        title: "Progress Tracking",
        desc: "See your improvement over time",
      },
    ],
    landingHowTitle: "How It Works",
    landingHowSteps: [
      {
        step: "1",
        title: "Set Up Match",
        desc: "Pick your map, agent, and team",
      },
      {
        step: "2",
        title: "Round Notes",
        desc: "Enter death location and notes each round",
      },
      {
        step: "3",
        title: "AI Analysis",
        desc: "Get instant feedback and suggestions",
      },
      {
        step: "4",
        title: "Match Report",
        desc: "View detailed end-of-match analysis",
      },
    ],
    landingDiffTitle: "Why AIMLO?",
    landingDiffItems: [
      {
        title: "Solutions, Not Just Numbers",
        desc: "Other tools show K/D. AIMLO explains why you lost.",
      },
      {
        title: "Round-by-Round Coaching",
        desc: "Improve instantly with strategic tips after each round.",
      },
      {
        title: "Personal Growth Map",
        desc: "See how your mistakes decrease and where you improve over time.",
      },
    ],
    landingStatsTitle: "Platform Stats",
    landingStats: [
      { value: "10K+", label: "Rounds Analyzed" },
      { value: "2.5K+", label: "Match Reports" },
      { value: "500+", label: "Active Players" },
      { value: "94%", label: "Satisfaction" },
    ],
    goToDashboard: "Go to Dashboard",
    homePage: "Home",
    dashTopAgent: "Most Used Agent",
    dashAISummary: "AI Analysis Summary",
    dashMostMistake: "Most Common Mistake",
    dashStrength: "Strength",
    dashImproveArea: "Area to Improve",
    dashAgentPerf: "Agent Performance",
    dashMapPerf: "Map Performance",
    dashLiveOnly: "Use desktop app for live feedback",
    downloadTitle: "Download AIMLO Desktop",
    downloadSub: "Use the desktop app for live AI coaching",
    downloadFeature1: "Auto tracking",
    downloadFeature2: "Overlay feedback",
    downloadFeature3: "Live analysis",
    downloadBtn: "Download",
    navDownload: "Download App",
    aiInsightTitle: "AI INSIGHT",
    aiInsightNoData: "Not enough data yet. Analyze a few matches so AI can learn your patterns.",
    aiInsightMoreData: "Need more match data.",
    problemAreasTitle: "PROBLEM AREAS",
    problemDeathZone: "Death Zone",
    problemWeakMap: "Weak Map",
    problemPattern: "Recurring Pattern",
    problemNoData: "No data",
    problemDeathDesc: "deaths",
    problemMapDesc: "winrate",
    problemPatternDesc: "recurring death zone",
    matchInsightStrong: "Strong match",
    matchInsightRepeat: "position repeat",
    matchInsightDeaths: "deaths",
    matchInsightBadLoss: "Tough match — analyze the main issue",
    historyFilterMap: "Map Filter",
    historyFilterAgent: "Agent Filter",
    historyFilterResult: "Result",
    historyAll: "All",
    historyWins: "Wins",
    historyLosses: "Losses",
    reportRoundTimeline: "Round Timeline",
    reportRoundFeedback: "Round Feedback",
    reportPerfMetrics: "Performance Metrics",
    reportDeaths: "Deaths",
    reportSurvivedRounds: "Survived",
    reportTopDeathLoc: "Top Death Location",
    reportWinRate: "Win Rate",
    noFeedback: "No feedback for this round",
  },
};
/* ══════════════════════════════════════════════════════════
   FEEDBACK & REPORT GENERATORS — Turkish chars fixed
   ══════════════════════════════════════════════════════════ */
function genRoundFeedback(
  setup: SetupData,
  form: RoundForm,
  result: RoundResult,
  allRounds: RoundData[],
  lang: Lang,
  survived: boolean,
): RoundFeedback {
  const isTr = lang === "tr";
  const loc = form.deathLocation;
  const cnt = form.enemyCount;
  const note = (form.yourNote || "").toLowerCase();
  const agent = setup.agent;
  const sideLabel = isTr
    ? setup.side === "attack"
      ? "saldırı"
      : "savunma"
    : setup.side === "attack"
      ? "attack"
      : "defense";
  const enemyAgents = setup.unknownEnemyComp
    ? []
    : (setup.enemyComp || []).filter(Boolean);
  const prevDeaths = allRounds.filter(
    (r) => !r.skipped && !r.survived && r.deathLocation === loc,
  );
  const repeatCount = prevDeaths.length;
  const nonSkipped = allRounds.filter((r) => !r.skipped);

  let deathAnalysis: string;
  if (survived) {
    deathAnalysis =
      result === "win"
        ? isTr
          ? `${agent} olarak ${loc} civarında hayatta kaldın ve round kazanıldı. Pozisyon tutman ve trade setup'ın doğruydu.`
          : `As ${agent}, you survived near ${loc} and won the round. Your positioning and trade setup were correct.`
        : isTr
          ? `${agent} olarak hayatta kaldın ama round kaybedildi. Takım koordinasyonu eksik — retake sırasında trade pozisyonu kurulamamış olabilir.`
          : `As ${agent}, you survived but the round was lost. Team coordination was lacking — trade positions may not have been set up during retake.`;
  } else if (repeatCount >= 2) {
    deathAnalysis = isTr
      ? `${loc} konumunda ${repeatCount}. kez öldün — düşman bu açıyı okuyor. ${sideLabel} tarafında aynı peek noktasını tekrar kullanmak overpeek hatası. ${agent} olarak farklı bir angle'dan swing atmalısın.`
      : `Died at ${loc} for the ${repeatCount}th time — enemy is reading this angle. Repeating the same peek point on ${sideLabel} is an overpeek error. As ${agent}, you need to swing from a different angle.`;
  } else if (Number(cnt) >= 3) {
    deathAnalysis = isTr
      ? `${loc} konumunda ${cnt} düşmana karşı izole kaldın — trade setup yoktu. ${sideLabel} tarafında ${cnt}v1 engage etmek sayısal dezavantaj.`
      : `Isolated at ${loc} against ${cnt} enemies — no trade setup. Engaging ${cnt}v1 on ${sideLabel} is a numbers disadvantage.`;
  } else if (
    note.includes("rotate") ||
    note.includes("rotasyon") ||
    note.includes("döndüm")
  ) {
    deathAnalysis = isTr
      ? `${loc} bölgesinde rotasyon sırasında yakalandın. ${sideLabel} tarafında timing hatası — rotasyon sırasında crosshair placement'ın hazır değildi.`
      : `Caught during rotation at ${loc}. Timing error on ${sideLabel} — your crosshair placement wasn't ready during rotation.`;
  } else if (note.includes("solo") || note.includes("tek")) {
    deathAnalysis = isTr
      ? `${loc} bölgesinde solo anchor oynarken öldün — trade alacak teammate yoktu. ${agent} olarak izole pozisyonda kalmak riskli.`
      : `Died solo anchoring at ${loc} — no teammate to trade. As ${agent}, staying isolated is risky.`;
  } else if (
    note.includes("util") ||
    note.includes("ability") ||
    note.includes("yetenek")
  ) {
    deathAnalysis = isTr
      ? `${loc} konumunda utility kullandıktan sonra savunmasız kaldın. ${agent} ability'sini kullandıktan sonra reposition yapmalısın.`
      : `Vulnerable at ${loc} after using utility. After using ${agent} ability, you need to reposition.`;
  } else {
    deathAnalysis = isTr
      ? `${loc} konumunda ${sideLabel} tarafı için crosshair placement'ın ideal değildi. ${agent} olarak daha korunaklı bir off-angle tut.`
      : `Your crosshair placement at ${loc} wasn't ideal for ${sideLabel}. As ${agent}, hold a more covered off-angle.`;
  }

  const avgEnemy =
    nonSkipped.length > 0
      ? (
          nonSkipped.reduce((s, r) => s + Number(r.enemyCount || 0), 0) /
          Math.max(nonSkipped.length, 1)
        ).toFixed(1)
      : cnt || "0";
  const recentLosses = allRounds
    .filter((r) => !r.skipped && !r.survived && r.result === "loss")
    .slice(-3);
  const recentDeathLocs = recentLosses.map((r) => r.deathLocation).filter(Boolean);
  const enemyAgentStr = enemyAgents.length > 0 ? enemyAgents.join(", ") : (isTr ? "bilinmeyen" : "unknown");

  const patterns: string[] = [];
  if (isTr) {
    if (Number(cnt) >= 4) {
      patterns.push(`Düşman ${loc} bölgesine ${cnt} kişilik full execute yapıyor — ağır baskı paterni`);
    } else if (Number(cnt) >= 2) {
      patterns.push(`Düşman ${loc} bölgesine ${cnt} kişiyle peek atıyor — coordinated peek paterni`);
    }
    if (recentDeathLocs.length >= 2) {
      const uniqueLocs = [...new Set(recentDeathLocs)];
      if (uniqueLocs.length === 1) {
        patterns.push(`Son ${recentLosses.length} round'da düşman sürekli ${uniqueLocs[0]} bölgesine baskı yapıyor`);
      } else {
        patterns.push(`Düşman ${uniqueLocs.join(" ve ")} arasında split push deniyor`);
      }
    }
    patterns.push(`Düşman (${enemyAgentStr}) ortalama ${avgEnemy} kişilik gruplarla hareket ediyor`);
    if (enemyAgents.some((a) => ["Jett", "Reyna", "Neon", "Raze"].includes(a))) {
      const duelist = enemyAgents.find((a) => ["Jett", "Reyna", "Neon", "Raze"].includes(a));
      patterns.push(`${duelist} agresif entry atıyor — flash/smoke ile karşıla`);
    }
  } else {
    if (Number(cnt) >= 4) {
      patterns.push(`Enemy running ${cnt}-man full execute on ${loc} — heavy pressure pattern`);
    } else if (Number(cnt) >= 2) {
      patterns.push(`Enemy peeking ${loc} with ${cnt} players — coordinated peek pattern`);
    }
    if (recentDeathLocs.length >= 2) {
      const uniqueLocs = [...new Set(recentDeathLocs)];
      if (uniqueLocs.length === 1) {
        patterns.push(`Enemy has pushed ${uniqueLocs[0]} for the last ${recentLosses.length} rounds`);
      } else {
        patterns.push(`Enemy attempting split push between ${uniqueLocs.join(" and ")}`);
      }
    }
    patterns.push(`Enemy (${enemyAgentStr}) moving in groups averaging ${avgEnemy} players`);
    if (enemyAgents.some((a) => ["Jett", "Reyna", "Neon", "Raze"].includes(a))) {
      const duelist = enemyAgents.find((a) => ["Jett", "Reyna", "Neon", "Raze"].includes(a));
      patterns.push(`${duelist} taking aggressive entry — counter with flash/smoke`);
    }
  }
  while (patterns.length < 3) {
    patterns.push(
      isTr
        ? "Düşman hareket kalıplarını izlemeye devam et — daha fazla round verisi gerekli"
        : "Continue observing enemy movement patterns — more round data needed",
    );
  }

  const altLocations = (MAP_LOCATIONS[setup.map] ?? []).filter(
    (x) => x !== loc,
  );
  const locIndex =
    altLocations.length > 0
      ? ((setup.map.length + allRounds.length) % altLocations.length)
      : 0;
  const suggestedLoc =
    altLocations[locIndex] || loc || "a different position";

  let nextRoundPlan: string;
  if (survived && result === "win") {
    nextRoundPlan = isTr
      ? `Aynı ${loc} setup'ını koru ama açını hafifçe kaydır. ${agent} utility'sini round başında kullan, agresif peek yapma.`
      : `Keep the same ${loc} setup but shift your angle slightly. Use ${agent} utility early in the round, avoid aggressive peeks.`;
  } else if (survived && result === "loss") {
    nextRoundPlan = isTr
      ? `${agent} olarak daha erken bilgi ver. Trade pozisyonunu teammate'inin yanında kur. Retake'e hazır ol.`
      : `As ${agent}, share info earlier. Set up your trade position next to your teammate. Be ready for retake.`;
  } else if (result === "loss" && repeatCount >= 2) {
    nextRoundPlan = isTr
      ? `${suggestedLoc} konumuna geç, ${loc} artık okunuyor. ${agent} olarak off-angle tut, jiggle peek ile bilgi topla.`
      : `Switch to ${suggestedLoc}, ${loc} is being read. As ${agent}, hold an off-angle, jiggle peek for info.`;
  } else if (result === "loss" && Number(cnt) >= 3) {
    nextRoundPlan = isTr
      ? `Retake oyna — ${suggestedLoc} civarında geri pozisyon al. ${agent} utility'sini retake için sakla. Takımını bekle.`
      : `Play retake — fall back near ${suggestedLoc}. Save ${agent} utility for retake. Wait for team.`;
  } else if (result === "loss") {
    nextRoundPlan = isTr
      ? `${suggestedLoc} konumuna rotate et. ${agent} ability'lerini ${loc} girişini kontrol etmek için kullan, sonra geri çekil.`
      : `Rotate to ${suggestedLoc}. Use ${agent} abilities to control ${loc} entrance, then fall back.`;
  } else {
    nextRoundPlan = isTr
      ? `Aynı stratejiyi koru. ${suggestedLoc} alternatif olarak hazır tut. ${agent} utility'sini bilgi amaçlı kullan.`
      : `Keep the same strategy. Have ${suggestedLoc} ready as alternative. Use ${agent} utility for info.`;
  }

  return { deathAnalysis, enemyPatterns: patterns.slice(0, 4), nextRoundPlan };
}
function genMatchReport(
  setup: SetupData,
  rounds: RoundData[],
  lang: Lang,
  score: MatchScore,
) {
  const isTr = lang === "tr";
  const won = rounds.filter((r) => r.result === "win").length;
  const lost = rounds.filter((r) => r.result === "loss").length;
  const skipped = rounds.filter((r) => r.skipped).length;
  const survivedCount = rounds.filter((r) => r.survived && !r.skipped).length;
  const total = rounds.length;
  const winPct = total > 0 ? Math.round((won / total) * 100) : 0;
  const nonSkipped = rounds.filter((r) => !r.skipped);
  const locationCounts: Record<string, number> = {};
  nonSkipped
    .filter((r) => !r.survived)
    .forEach((r) => {
      if (r.deathLocation)
        locationCounts[r.deathLocation] =
          (locationCounts[r.deathLocation] || 0) + 1;
    });
  const topLoc = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0];
  const topDeathLoc = topLoc ? topLoc[0] : "N/A";
  const topDeathCount = topLoc ? topLoc[1] : 0;
  const avgEnemy =
    nonSkipped.length > 0
      ? (
          nonSkipped.reduce((s, r) => s + Number(r.enemyCount || 0), 0) /
          nonSkipped.length
        ).toFixed(1)
      : "0";
  const sideLabel = isTr
    ? setup.side === "attack"
      ? "Saldırı"
      : "Savunma"
    : setup.side === "attack"
      ? "Attack"
      : "Defense";
  const scoreStr = `${score.yours} - ${score.enemy}`;
  const matchWon = Number(score.yours) > Number(score.enemy);
  const allNotes = nonSkipped.map((r) => (r.yourNote || "").toLowerCase()).join(" ");
  const hasRotateIssue = /rotat|rotasyon|döndüm/.test(allNotes);
  const hasSoloIssue = /solo|tek/.test(allNotes);
  const hasUtilIssue = /util|ability|yetenek/.test(allNotes);
  const survivedText =
    survivedCount > 0
      ? isTr
        ? ` ${survivedCount} round'da hayatta kaldın.`
        : ` Survived ${survivedCount} rounds.`
      : "";
  const summary = isTr
    ? `${setup.map} haritasında ${setup.agent} ile ${sideLabel} tarafında oynadın. Skor: ${scoreStr}. ${total} round (${skipped} atlanan).${survivedText} En çok ölüm: ${topDeathLoc} (${topDeathCount}x). Ort. düşman: ${avgEnemy}.`
    : `Played ${setup.map} as ${setup.agent} on ${sideLabel}. Score: ${scoreStr}. ${total} rounds (${skipped} skipped).${survivedText} Most deaths: ${topDeathLoc} (${topDeathCount}x). Avg enemy: ${avgEnemy}.`;
  let mistake: string;
  if (topDeathCount >= 3) {
    mistake = isTr
      ? `${topDeathLoc} konumunda ${topDeathCount} kez öldün. Bu tekrar düşmana okuma kolaylığı sağlıyor.`
      : `You died at ${topDeathLoc} ${topDeathCount} times. This makes you predictable.`;
  } else if (hasRotateIssue) {
    mistake = isTr
      ? "Birden fazla round'da erken rotasyon sorunu yaşadın."
      : "Early rotation issues in multiple rounds.";
  } else if (hasSoloIssue) {
    mistake = isTr
      ? "Solo oynadığını belirttin. Takım koordinasyonu eksik."
      : "Playing solo noted. Team coordination lacking.";
  } else if (hasUtilIssue) {
    mistake = isTr
      ? "Utility zamanlamanla ilgili sorunlar tespit edildi."
      : "Issues with utility timing detected.";
  } else {
    mistake = isTr
      ? "Genel pozisyonlama sorunları göze çarpıyor."
      : "General positioning issues stand out.";
  }
  const enemyAgents = setup.unknownEnemyComp
    ? isTr
      ? "bilinmiyor"
      : "unknown"
    : setup.enemyComp.filter(Boolean).join(", ");
  const tendencies = isTr
    ? `Düşman (${enemyAgents}) ort. ${avgEnemy} kişilik gruplarla hareket etti. ${matchWon ? "Baskı yapsa da takımın karşılık verdi." : "Sayısal üstünlükle baskı kurdu."}`
    : `Enemy (${enemyAgents}) moved in groups avg ${avgEnemy}. ${matchWon ? "Despite pressure, team responded." : "Applied pressure with numbers."}`;
  const adjustment = isTr
    ? `${topDeathLoc !== "N/A" ? `${topDeathLoc} yerine farklı açılardan oyna. ` : ""}${setup.agent} olarak utility'ni stratejik zamanla. ${matchWon ? "İyi performans, pozisyon çeşitliliğini artır." : "Retake pozisyonlarına erken geç."}`
    : `${topDeathLoc !== "N/A" ? `Play different angles instead of ${topDeathLoc}. ` : ""}As ${setup.agent}, time utility strategically. ${matchWon ? "Good performance, increase positional variety." : "Set up retake earlier."}`;

  const bestRoundData = nonSkipped.find((r) => r.result === "win" && r.survived);
  const bestRound = bestRoundData
    ? isTr
      ? `Round ${bestRoundData.roundNumber} — ${bestRoundData.deathLocation || setup.map} bölgesinde hayatta kalarak round kazandın. Pozisyon tutma ve trade setup doğruydu.`
      : `Round ${bestRoundData.roundNumber} — Won the round surviving at ${bestRoundData.deathLocation || setup.map}. Positioning and trade setup were correct.`
    : isTr
      ? `Bu maçta öne çıkan bir round bulunamadı. Hayatta kalma oranını artırmaya odaklan.`
      : `No standout round found this match. Focus on improving survival rate.`;

  const survivalPct = nonSkipped.length > 0 ? survivedCount / nonSkipped.length : 0;
  const deathVariety = Object.keys(locationCounts).length;
  let scoreNum = 5;
  if (winPct >= 60) scoreNum += 2;
  else if (winPct >= 45) scoreNum += 1;
  if (survivalPct >= 0.4) scoreNum += 1;
  if (deathVariety >= 3) scoreNum += 1;
  if (topDeathCount >= 4) scoreNum -= 2;
  else if (topDeathCount >= 3) scoreNum -= 1;
  scoreNum = Math.max(1, Math.min(10, scoreNum));
  const decisionScore = isTr
    ? `${scoreNum}/10 — ${scoreNum >= 7 ? "İyi karar verme, pozisyon çeşitliliği var" : scoreNum >= 5 ? "Ortalama karar verme, tekrarlayan hatalar var" : "Zayıf karar verme, aynı hataları tekrarlıyorsun"}`
    : `${scoreNum}/10 — ${scoreNum >= 7 ? "Good decision making with positional variety" : scoreNum >= 5 ? "Average decision making with recurring mistakes" : "Weak decision making, repeating the same errors"}`;

  return {
    summary,
    mistake,
    tendencies,
    adjustment,
    bestRound,
    decisionScore,
    won,
    lost,
    skipped,
    survivedCount,
    total,
    winPct,
    scoreStr,
    matchWon,
  };
}
function Label({ text }: { text: string }) {
  return <label className={ds.label}>{text}</label>;
}
function InlineError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-red-400">{msg}</p>;
}
function AmbientBg() {
  // Deterministic particle positions to avoid hydration mismatch
  const particles = useMemo(() => [
    { l: 12, t: 8, d: 0.2, dur: 4.2, o: 0.35, s: 2 },
    { l: 87, t: 15, d: 1.1, dur: 5.1, o: 0.3, s: 2.5 },
    { l: 34, t: 22, d: 0.8, dur: 3.8, o: 0.45, s: 1.8 },
    { l: 65, t: 5, d: 2.3, dur: 6.2, o: 0.28, s: 2.2 },
    { l: 8, t: 45, d: 1.5, dur: 4.5, o: 0.4, s: 1.8 },
    { l: 92, t: 38, d: 0.3, dur: 5.5, o: 0.32, s: 2.5 },
    { l: 45, t: 62, d: 3.1, dur: 3.5, o: 0.38, s: 2 },
    { l: 73, t: 75, d: 0.7, dur: 4.8, o: 0.25, s: 3 },
    { l: 22, t: 85, d: 2.0, dur: 5.8, o: 0.42, s: 1.8 },
    { l: 55, t: 92, d: 1.8, dur: 4.1, o: 0.3, s: 2.2 },
    { l: 3, t: 68, d: 0.5, dur: 6.5, o: 0.27, s: 2.5 },
    { l: 78, t: 52, d: 2.8, dur: 3.3, o: 0.36, s: 1.5 },
    { l: 41, t: 35, d: 1.3, dur: 5.3, o: 0.33, s: 2.8 },
    { l: 96, t: 72, d: 3.5, dur: 4.6, o: 0.29, s: 2 },
    { l: 18, t: 18, d: 0.9, dur: 5.9, o: 0.43, s: 2 },
    { l: 60, t: 42, d: 2.5, dur: 3.6, o: 0.31, s: 2.8 },
    { l: 30, t: 55, d: 1.7, dur: 4.3, o: 0.37, s: 1.8 },
    { l: 82, t: 28, d: 3.3, dur: 5.7, o: 0.26, s: 2.5 },
    { l: 50, t: 80, d: 0.1, dur: 4.9, o: 0.39, s: 2.2 },
    { l: 15, t: 95, d: 2.2, dur: 3.9, o: 0.34, s: 2 },
    // Extra particles for denser starfield
    { l: 5, t: 30, d: 0.4, dur: 5.2, o: 0.28, s: 1.5 },
    { l: 25, t: 12, d: 1.6, dur: 4.4, o: 0.35, s: 2.2 },
    { l: 48, t: 48, d: 2.7, dur: 3.7, o: 0.22, s: 2.8 },
    { l: 70, t: 30, d: 0.9, dur: 6.1, o: 0.4, s: 1.8 },
    { l: 90, t: 60, d: 3.2, dur: 4.0, o: 0.33, s: 2 },
    { l: 38, t: 78, d: 1.4, dur: 5.6, o: 0.29, s: 2.5 },
    { l: 62, t: 18, d: 2.1, dur: 3.4, o: 0.36, s: 1.6 },
    { l: 85, t: 85, d: 0.6, dur: 5.0, o: 0.25, s: 3 },
    { l: 16, t: 58, d: 3.8, dur: 4.7, o: 0.38, s: 1.5 },
    { l: 72, t: 45, d: 1.0, dur: 5.4, o: 0.31, s: 2.2 },
    { l: 43, t: 10, d: 2.4, dur: 3.9, o: 0.42, s: 1.8 },
    { l: 58, t: 70, d: 0.3, dur: 6.3, o: 0.27, s: 2.5 },
    { l: 95, t: 20, d: 1.8, dur: 4.2, o: 0.35, s: 2 },
    { l: 28, t: 42, d: 3.0, dur: 5.1, o: 0.3, s: 1.5 },
    { l: 7, t: 88, d: 2.6, dur: 3.6, o: 0.4, s: 2.2 },
    { l: 68, t: 58, d: 0.8, dur: 4.8, o: 0.33, s: 2.8 },
    { l: 52, t: 25, d: 1.2, dur: 5.5, o: 0.28, s: 1.8 },
    { l: 35, t: 95, d: 3.4, dur: 4.3, o: 0.36, s: 2 },
    { l: 80, t: 10, d: 0.1, dur: 5.8, o: 0.44, s: 1.5 },
    { l: 20, t: 65, d: 2.9, dur: 3.2, o: 0.32, s: 2.5 },
  ], []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${p.l}%`,
            top: `${p.t}%`,
            animationDelay: `${p.d}s`,
            animationDuration: `${p.dur}s`,
            opacity: p.o,
            width: `${p.s}px`,
            height: `${p.s}px`,
          }}
        />
      ))}
    </div>
  );
}
function MapBg({ map }: { map: string }) {
  const url = MAP_IMAGES[map];
  if (!url) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <img
        src={url}
        alt=""
        className="h-full w-full object-cover opacity-[0.55]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050810]/30 via-[#050810]/60 to-[#050810]/95" />
    </div>
  );
}
function FeatureIcon({ icon }: { icon: string }) {
  const svgs: Record<string, React.ReactNode> = {
    zap: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon
          points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
          fill="rgba(34,211,238,0.15)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
    chart: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="15"
          y="10"
          width="6"
          height="10"
          rx="1"
          fill="rgba(34,211,238,0.15)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="9"
          y="4"
          width="6"
          height="16"
          rx="1"
          fill="rgba(59,130,246,0.12)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="3"
          y="14"
          width="6"
          height="6"
          rx="1"
          fill="rgba(34,211,238,0.1)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
    target: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.4"
        />
        <circle
          cx="12"
          cy="12"
          r="6"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.8" />
      </svg>
    ),
    trend: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M1 18 L8.5 10.5 L13.5 15.5 L23 6"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M1 18 L8.5 10.5 L13.5 15.5 L23 6 L23 18 Z"
          fill="rgba(34,211,238,0.08)"
        />
        <polyline
          points="17 6 23 6 23 12"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  };
  return <span className="text-cyan-400">{svgs[icon] || null}</span>;
}
/* ══════════════════════════════════════════════════════════
   NAVBAR — with HOME button
   ══════════════════════════════════════════════════════════ */
function Navbar({
  user,
  lang,
  onSignOut,
  onLogoClick,
  onLangToggle,
  signOutLabel,
  onHome,
  homeLabel,
  onDownload,
  downloadLabel,
}: {
  user: User;
  lang: Lang;
  onSignOut: () => void;
  onLogoClick: () => void;
  onLangToggle: () => void;
  signOutLabel: string;
  onHome?: () => void;
  homeLabel?: string;
  onDownload?: () => void;
  downloadLabel?: string;
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#050810]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80"
        >
          <img src="/aimlo-logo.png" alt="AIMLO" style={{ height: 90, width: 'auto' }} draggable={false} />
          <span className="hidden sm:inline rounded-md bg-blue-500/10 border border-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-400 uppercase tracking-wider">
            Beta
          </span>
        </button>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onHome && (
            <button
              onClick={onHome}
              className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-semibold text-neutral-400 transition-all duration-200 hover:border-white/[0.12] hover:text-white hover:bg-white/[0.06]"
            >
              <span className="hidden sm:inline">{homeLabel}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="sm:hidden"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] px-2.5 py-1.5 text-[10px] font-semibold text-cyan-400 transition-all duration-200 hover:border-cyan-500/30 hover:bg-cyan-500/[0.1]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {downloadLabel}
            </button>
          )}
          <button
            onClick={onLangToggle}
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-[10px] font-bold text-neutral-400 transition-all duration-200 hover:border-white/[0.12] hover:text-white"
          >
            {lang === "tr" ? "TR" : "EN"}
          </button>
          <span className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400 shrink-0">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-[11px] font-semibold text-neutral-300 truncate max-w-[120px]">
              {user.user_metadata?.username || user.user_metadata?.first_name || user.email?.split("@")[0] || "User"}
            </span>
          </span>
          <button
            onClick={onSignOut}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[10px] font-semibold text-neutral-500 transition-all duration-200 hover:border-red-500/20 hover:text-red-400 hover:bg-red-500/[0.04]"
          >
            {signOutLabel}
          </button>
        </div>
      </div>
    </nav>
  );
}
/* ══════════════════════════════════════════════════════════
   SHARED UI
   ══════════════════════════════════════════════════════════ */
function ReportCard({
  icon,
  color,
  label,
  text,
}: {
  icon: string;
  color: string;
  label: string;
  text: string;
}) {
  return (
    <div
      className={`${ds.card} ${ds.cardInner} border-l-2 ${color === "text-red-400" ? "border-l-red-500/40" : color === "text-amber-400" ? "border-l-amber-500/40" : color === "text-emerald-400" ? "border-l-emerald-500/40" : "border-l-blue-500/40"}`}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className="text-base opacity-60">{icon}</span>
        <h3
          className={`text-[11px] font-bold uppercase tracking-[0.15em] ${color}`}
        >
          {label}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-neutral-300">{text}</p>
    </div>
  );
}
function FeedbackCard({
  icon,
  color,
  label,
  text,
}: {
  icon: string;
  color: string;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#070c16] p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm opacity-70">{icon}</span>
        <h4
          className={`text-[10px] font-bold uppercase tracking-[0.15em] ${color}`}
        >
          {label}
        </h4>
      </div>
      <p className="text-[13px] leading-relaxed text-neutral-300">{text}</p>
    </div>
  );
}
function AgentMiniCard({
  name,
  selected,
  disabled,
  onClick,
  locked,
}: {
  name: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  locked?: boolean;
}) {
  const role = getAgentRole(name);
  const colors = AGENT_COLORS[role];
  const border = AGENT_BORDER[role];
  const accent = AGENT_ACCENT[role];
  const img = agentImgUrl(name);
  return (
    <button
      onClick={onClick}
      disabled={(disabled && !selected) || locked}
      className={`group relative flex flex-col items-center gap-1 rounded-xl border p-2 transition-all duration-200 ${selected ? `${border} bg-gradient-to-b ${colors} ring-1 ring-cyan-400/20 shadow-lg shadow-cyan-500/5` : disabled ? "cursor-not-allowed border-white/[0.03] bg-white/[0.01] opacity-20" : "border-white/[0.06] bg-[#070c16] hover:border-white/[0.1] hover:bg-white/[0.03]"}`}
    >
      <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-black/20">
        {img ? (
          <img
            src={img}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center text-[10px] font-bold ${accent}`}
          >
            {getAgentInitials(name)}
          </div>
        )}
      </div>
      <span className="text-[9px] font-medium text-neutral-300 leading-tight text-center truncate w-full">
        {name}
      </span>
      {selected && !locked && (
        <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-cyan-500 border-2 border-[#050810]" />
      )}
      {locked && (
        <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 border-2 border-[#050810]" />
      )}
    </button>
  );
}
function CompSlot({
  agent,
  index,
  onRemove,
  locked,
}: {
  agent: string;
  index: number;
  onRemove: () => void;
  locked?: boolean;
}) {
  const role = agent ? getAgentRole(agent) : "";
  const accent = agent ? AGENT_ACCENT[role] : "";
  const img = agent ? agentImgUrl(agent) : "";
  return (
    <div
      onClick={() => agent && !locked && onRemove()}
      className={`flex h-16 w-16 flex-col items-center justify-center rounded-xl border transition-all duration-200 ${agent ? (locked ? "border-amber-500/25 bg-amber-500/[0.04] cursor-default" : "border-cyan-500/25 bg-cyan-500/[0.06] cursor-pointer hover:border-red-500/25") : "border-dashed border-white/[0.06] bg-white/[0.01]"}`}
    >
      {agent ? (
        <>
          <div className="h-7 w-7 overflow-hidden rounded-lg bg-black/20">
            {img ? (
              <img
                src={img}
                alt={agent}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center text-[9px] font-bold ${accent}`}
              >
                {getAgentInitials(agent)}
              </div>
            )}
          </div>
          <span className="mt-0.5 text-[8px] text-neutral-400 truncate w-full text-center">
            {agent}
          </span>
        </>
      ) : (
        <span className="text-[11px] text-neutral-600 font-medium">
          {index + 1}
        </span>
      )}
    </div>
  );
}
function StatCard({
  label,
  value,
  color = "text-white",
  sub,
}: {
  label: string;
  value: string;
  color?: string;
  sub?: string;
}) {
  return (
    <div className={`${ds.card} p-4 sm:p-5 text-center`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-1.5">
        {label}
      </p>
      <p className={`text-2xl font-extrabold tabular-nums ${color}`}>{value}</p>
      {sub && (
        <p className="mt-1 text-[10px] text-neutral-600 font-medium">{sub}</p>
      )}
    </div>
  );
}
/* ══════════════════════════════════════════════════════════
   LANDING PAGE
   ══════════════════════════════════════════════════════════ */
function LandingPage({ lang, user, onStartAnalysis, onLogin, onRegister, onLangToggle, onDashboard, onSignOut }: { lang: Lang; user: User | null; onStartAnalysis: () => void; onLogin: () => void; onRegister: () => void; onLangToggle: () => void; onDashboard: () => void; onSignOut: () => void }) {
  const l = t[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const howReveal = useScrollReveal(0.15);
  const diffReveal = useScrollReveal(0.15);
  const featReveal = useScrollReveal(0.1);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set(prev).add(entry.target.id));
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }
  const isVisible = (id: string) => visibleSections.has(id);

  // Valorant competitive ranks — all ranks Iron → Radiant
  const RANK_UUID = "03621f52-342b-cf4e-4f86-9350a49c6d04";
  const rankShowcase = [
    { tier: 3,  name: "Iron",      color: "#8C8C8C" },
    { tier: 6,  name: "Bronze",    color: "#B97450" },
    { tier: 9,  name: "Silver",    color: "#C0C0C0" },
    { tier: 12, name: "Gold",      color: "#ECB73E" },
    { tier: 15, name: "Platinum",  color: "#32B8B8" },
    { tier: 18, name: "Diamond",   color: "#B489FF" },
    { tier: 21, name: "Ascendant", color: "#2ECC71" },
    { tier: 24, name: "Immortal",  color: "#FF4655" },
    { tier: 27, name: "Radiant",   color: "#FFFFAA" },
  ];

  // Feature card data with Valorant agent portraits for rich visuals
  const featureVisuals = [
    { agentId: "e370fa57-4757-3604-3648-499e1f642d3f", color: "#FF4655" },  // KAY/O - instant feedback
    { agentId: "707eab51-4836-f488-046a-cda6bf494859", color: "#4D7CFF" },  // Viper - detailed reports
    { agentId: "117ed9e3-49f3-6512-3ccf-0cada7e3823b", color: "#B44DFF" },  // Cypher - pattern detection
    { agentId: "22697a3d-45bf-8dd7-4fec-84a9e28c69d7", color: "#ECB73E" },  // Chamber - growth tracking
  ];

  const benefitIcons = [
    <svg key="0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>,
    <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 10-5.12 5.12L8 12.24"/></svg>,
  ];

  return (
    <main className="min-h-screen bg-black relative overflow-x-hidden">
      <AmbientBg />

      {/* ─── NAVBAR — Xtract style ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-xtract">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <img src="/aimlo-logo.png" alt="AIMLO" style={{ height: 30, width: 'auto' }} draggable={false} />
          </div>
          <div className="hidden md:flex items-center gap-8">
            {Object.entries(l.landingNav).map(([key, label]) => (
              <button key={key} onClick={() => scrollTo(`section-${key}`)} className="text-[13px] text-neutral-400 transition-colors duration-200 hover:text-white font-medium">
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onLangToggle} className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[11px] font-semibold text-neutral-500 transition hover:text-white hover:border-white/[0.15]">
              {lang === "tr" ? "TR" : "EN"}
            </button>
            {user ? (
              <>
                <button onClick={onDashboard} className="btn-neon hidden sm:block rounded-lg px-5 py-2 text-[12px]">
                  {l.goToDashboard}
                </button>
                <button onClick={onSignOut} className="hidden sm:block text-[12px] text-neutral-600 transition hover:text-red-400 px-2">
                  {l.authSignOut}
                </button>
              </>
            ) : (
              <>
                <button onClick={onLogin} className="hidden sm:block text-[13px] text-neutral-400 transition hover:text-white px-2 font-medium">
                  {l.authLogin}
                </button>
                <button onClick={onRegister} className="btn-neon hidden sm:block rounded-lg px-5 py-2 text-[12px]">
                  {l.authRegister}
                </button>
              </>
            )}
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-neutral-400 hover:text-white transition">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-xl px-5 py-4 space-y-2">
            {Object.entries(l.landingNav).map(([key, label]) => (
              <button key={key} onClick={() => scrollTo(`section-${key}`)} className="block w-full text-left text-sm text-neutral-400 py-2 hover:text-white transition">{label}</button>
            ))}
            <div className="flex gap-2 pt-3">
              {user ? (
                <>
                  <button onClick={() => { setMobileMenu(false); onDashboard(); }} className="btn-neon flex-1 rounded-lg py-2.5 text-sm">{l.goToDashboard}</button>
                  <button onClick={() => { setMobileMenu(false); onSignOut(); }} className="btn-ghost flex-1 rounded-lg py-2.5 text-sm">{l.authSignOut}</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMobileMenu(false); onLogin(); }} className="btn-ghost flex-1 rounded-lg py-2.5 text-sm">{l.authLogin}</button>
                  <button onClick={() => { setMobileMenu(false); onRegister(); }} className="btn-neon flex-1 rounded-lg py-2.5 text-sm">{l.authRegister}</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO — Xtract style with orb ─── */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 pt-32 sm:pt-44 pb-16 sm:pb-24 text-center">
        {/* Background orbs */}
        <div className="hero-orb" style={{ top: '10%', right: '-10%' }} />
        <div className="hero-orb-inner" style={{ top: '20%', right: '5%' }} />

        {/* Pill badge — Xtract style */}
        <div className="mb-8 animate-slide-up flex justify-center">
          <div className="pill-badge">
            <span className="pill-tag">{lang === "tr" ? "Yeni" : "New"}</span>
            <span>{lang === "tr" ? "AI Destekli Valorant Koçluk" : "AI-Powered Valorant Coaching"}</span>
          </div>
        </div>

        {/* Heading — large, tight letter-spacing like Xtract */}
        <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-semibold text-white leading-[1.08] mb-6 animate-slide-up stagger-1" style={{ letterSpacing: '-2.5px' }}>
          {l.landingHeroTitle}
        </h1>

        {/* Sub text */}
        <p className="mx-auto max-w-lg text-base sm:text-[17px] text-neutral-400 leading-relaxed mb-10 animate-slide-up stagger-2">
          {l.landingHeroSub}
        </p>

        {/* CTA buttons — Xtract dual button style */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up stagger-3">
          {user ? (
            <>
              <button onClick={onDashboard} className="btn-neon rounded-xl px-8 py-3.5 text-[14px] flex items-center gap-2">
                {l.goToDashboard}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
              </button>
              <button onClick={() => document.getElementById("download-section")?.scrollIntoView({ behavior: "smooth" })} className="btn-ghost rounded-xl px-8 py-3.5 text-[14px]">
                {l.landingCTA}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => document.getElementById("download-section")?.scrollIntoView({ behavior: "smooth" })} className="btn-neon rounded-xl px-8 py-3.5 text-[14px] flex items-center gap-2">
                {l.landingCTA}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
              </button>
              <button onClick={onLogin} className="btn-ghost rounded-xl px-8 py-3.5 text-[14px]">
                {l.authLogin}
              </button>
            </>
          )}
        </div>

      </section>

      {/* ─── APP MOCKUP — floating dashboard preview ─── */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8 pb-16 animate-slide-up stagger-5">
        <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-1 shadow-2xl shadow-black/50" style={{ background: "linear-gradient(135deg, rgba(255,70,85,0.03), rgba(77,124,255,0.03))" }}>
          {/* Browser chrome bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 mx-8">
              <div className="mx-auto max-w-xs rounded-md bg-white/[0.04] border border-white/[0.06] px-3 py-1 text-[10px] text-neutral-600 text-center">aimlo.xyz/dashboard</div>
            </div>
          </div>
          {/* Fake dashboard content */}
          <div className="p-5 sm:p-8 space-y-4">
            {/* Top stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: lang === "tr" ? "Round Kazanma" : "Round Win %", value: "67%", color: "#FF4655" },
                { label: lang === "tr" ? "K/D Oranı" : "K/D Ratio", value: "1.42", color: "#4D7CFF" },
                { label: lang === "tr" ? "AI Skoru" : "AI Score", value: "8.4", color: "#B44DFF" },
              ].map((s, i) => (
                <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
                  <p className="text-2xl sm:text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-neutral-600 mt-1 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
            {/* Fake AI feedback card */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
              <div className="flex items-center gap-2 mb-3">
                <img src="/aimlo-logo.png" alt="" className="w-5 h-auto" />
                <span className="text-[11px] font-bold text-[#FF4655] uppercase tracking-wider">AI {lang === "tr" ? "Analiz" : "Analysis"}</span>
                <span className="text-[9px] text-neutral-600 ml-auto">Round 8</span>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 rounded-full bg-white/[0.04] w-full" />
                <div className="h-2.5 rounded-full bg-white/[0.04] w-4/5" />
                <div className="h-2.5 rounded-full bg-white/[0.04] w-3/5" />
              </div>
            </div>
            {/* Performance bars */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <p className="text-[10px] text-neutral-500 mb-2 uppercase tracking-wider">{lang === "tr" ? "Beceri Profili" : "Skill Profile"}</p>
                {["Aim", "Utility", "Positioning", "Game Sense"].map((skill, j) => (
                  <div key={j} className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] text-neutral-600 w-16">{skill}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${[72, 85, 60, 78][j]}%`, background: `linear-gradient(90deg, #FF4655, #4D7CFF)` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <p className="text-[10px] text-neutral-500 mb-2 uppercase tracking-wider">{lang === "tr" ? "Maç Özeti" : "Match Summary"}</p>
                <div className="flex items-end justify-center gap-1 h-16">
                  {[40, 65, 55, 80, 45, 70, 90, 60, 75, 85, 50, 95, 70].map((h, j) => (
                    <div key={j} className="w-2 rounded-sm transition-all" style={{ height: `${h}%`, background: j < 7 ? "rgba(255,70,85,0.5)" : "rgba(77,124,255,0.5)" }} />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[9px] text-[#FF4655]">T: 7</span>
                  <span className="text-[9px] text-[#4D7CFF]">CT: 6</span>
                </div>
              </div>
            </div>
          </div>
          {/* Glow effect behind mockup */}
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-[#FF4655]/[0.04] to-[#4D7CFF]/[0.02] blur-2xl -z-10" />
        </div>
      </section>

      {/* ─── RANK SHOWCASE ─── */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 pb-28">
        <div className="section-divider mb-16" />
        <p className="text-center text-[11px] uppercase tracking-[0.2em] text-neutral-600 font-semibold mb-4 animate-slide-up stagger-4">
          {lang === "tr" ? "Her seviyeye uygun koçluk" : "Coaching for every rank"}
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white text-center mb-12 animate-slide-up stagger-4" style={{ letterSpacing: '-1px' }}>
          {lang === "tr" ? "Iron'dan Radiant'a Kadar" : "From Iron to Radiant"}
        </h2>
        <div className="flex items-end justify-center gap-2 sm:gap-4 animate-slide-up stagger-5">
          {rankShowcase.map((rank, i) => {
            // Radiant is tallest, scaling up from Iron
            const scale = 0.7 + (i / (rankShowcase.length - 1)) * 0.5;
            return (
              <div key={rank.tier} className="group relative flex flex-col items-center transition-all duration-300 hover:-translate-y-2">
                <div
                  className="relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 sm:p-3 transition-all duration-300 group-hover:border-white/[0.12]"
                  style={{
                    boxShadow: `0 0 0 rgba(0,0,0,0)`,
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 25px ${rank.color}25, 0 10px 40px rgba(0,0,0,0.3)`; e.currentTarget.style.borderColor = `${rank.color}30`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 0 rgba(0,0,0,0)`; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <img
                    src={`https://media.valorant-api.com/competitivetiers/${RANK_UUID}/${rank.tier}/largeicon.png`}
                    alt={rank.name}
                    className="object-contain relative z-10 transition-transform duration-300 group-hover:scale-110"
                    style={{ width: `${scale * 64}px`, height: `${scale * 64}px`, filter: `drop-shadow(0 0 12px ${rank.color}35)` }}
                    loading="lazy"
                    draggable={false}
                  />
                </div>
                <span className="mt-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 group-hover:text-white" style={{ color: rank.color }}>{rank.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── FEATURES — Xtract card grid ─── */}
      <section ref={featReveal.ref} id="section-features" data-animate className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 pb-28">
        <div className="section-divider mb-16" />
        <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[#FF4655]/50 font-semibold mb-4">
          {lang === "tr" ? "Özellikler" : "Features"}
        </p>
        <h2 className={`text-3xl sm:text-[44px] font-semibold text-white text-center mb-14 leading-tight transition-all duration-700 ${featReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ letterSpacing: '-1.5px' }}>
          {lang === "tr" ? "AI ile Oyununu Bir Üst Seviyeye Taşı" : "Take Your Game to the Next Level with AI"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {l.landingFeatures.map((f, i) => {
            const v = featureVisuals[i];
            return (
              <div key={i} className={`card-xtract group overflow-hidden transition-all duration-700 ${featReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 100}ms` }}>
                {/* Agent portrait background */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={`https://media.valorant-api.com/agents/${v.agentId}/background.png`}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500"
                    loading="lazy"
                  />
                  <img
                    src={`https://media.valorant-api.com/agents/${v.agentId}/displayicon.png`}
                    alt=""
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-24 w-24 object-contain opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500"
                    style={{ filter: `drop-shadow(0 0 20px ${v.color}30)` }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                  <div className="relative p-7 flex items-center h-full">
                    <div>
                      <h3 className="text-[17px] font-bold text-white mb-1 tracking-tight">{f.title}</h3>
                      <p className="text-[13px] text-neutral-400 leading-relaxed max-w-[280px]">{f.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── HOW IT WORKS — Process steps like Xtract ─── */}
      <section ref={howReveal.ref} id="section-how" data-animate className="relative z-10 mx-auto max-w-3xl px-5 sm:px-8 pb-28">
        <div className="section-divider mb-16" />
        <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[#FF4655]/50 font-semibold mb-4">
          {lang === "tr" ? "Süreç" : "Process"}
        </p>
        <h2 className={`text-3xl sm:text-[44px] font-semibold text-white tracking-tight text-center mb-14 leading-tight transition-all duration-700 ${howReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ letterSpacing: '-1.5px' }}>
          {l.landingHowTitle}
        </h2>
        <div className="space-y-4">
          {l.landingHowSteps.map((s, i) => {
            const stepIcons = [
              // 1 — Set Up Match: map pin / compass
              <svg key="h0" width="28" height="28" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" stroke="#FF4655" strokeWidth="1.5" fill="rgba(255,70,85,0.1)"/>
                <circle cx="12" cy="10" r="3" stroke="#FF4655" strokeWidth="1.5" fill="rgba(255,70,85,0.15)"/>
              </svg>,
              // 2 — Round Notes: crosshair / target scope
              <svg key="h1" width="28" height="28" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" stroke="#4D7CFF" strokeWidth="1.5" fill="rgba(77,124,255,0.06)"/>
                <circle cx="12" cy="12" r="4" stroke="#4D7CFF" strokeWidth="1.5" fill="rgba(77,124,255,0.12)"/>
                <circle cx="12" cy="12" r="1" fill="#4D7CFF"/>
                <line x1="12" y1="1" x2="12" y2="5" stroke="#4D7CFF" strokeWidth="1.5"/>
                <line x1="12" y1="19" x2="12" y2="23" stroke="#4D7CFF" strokeWidth="1.5"/>
                <line x1="1" y1="12" x2="5" y2="12" stroke="#4D7CFF" strokeWidth="1.5"/>
                <line x1="19" y1="12" x2="23" y2="12" stroke="#4D7CFF" strokeWidth="1.5"/>
              </svg>,
              // 3 — AI Analysis: neural brain network
              <svg key="h2" width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="4" r="1.5" fill="#FF4655"/>
                <circle cx="5" cy="8" r="1.5" fill="#FF4655" opacity="0.7"/>
                <circle cx="19" cy="8" r="1.5" fill="#FF4655" opacity="0.7"/>
                <circle cx="12" cy="12" r="2" fill="#FF4655"/>
                <circle cx="5" cy="16" r="1.5" fill="#4D7CFF" opacity="0.7"/>
                <circle cx="19" cy="16" r="1.5" fill="#4D7CFF" opacity="0.7"/>
                <circle cx="12" cy="20" r="1.5" fill="#4D7CFF"/>
                <line x1="12" y1="4" x2="12" y2="12" stroke="#FF4655" strokeWidth="0.8" opacity="0.5"/>
                <line x1="5" y1="8" x2="12" y2="12" stroke="#FF4655" strokeWidth="0.8" opacity="0.4"/>
                <line x1="19" y1="8" x2="12" y2="12" stroke="#FF4655" strokeWidth="0.8" opacity="0.4"/>
                <line x1="12" y1="12" x2="5" y2="16" stroke="#4D7CFF" strokeWidth="0.8" opacity="0.4"/>
                <line x1="12" y1="12" x2="19" y2="16" stroke="#4D7CFF" strokeWidth="0.8" opacity="0.4"/>
                <line x1="12" y1="12" x2="12" y2="20" stroke="#4D7CFF" strokeWidth="0.8" opacity="0.5"/>
                <line x1="5" y1="8" x2="5" y2="16" stroke="#B44DFF" strokeWidth="0.5" opacity="0.3"/>
                <line x1="19" y1="8" x2="19" y2="16" stroke="#B44DFF" strokeWidth="0.5" opacity="0.3"/>
              </svg>,
              // 4 — Match Report: stats chart
              <svg key="h3" width="28" height="28" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="18" rx="2" stroke="#B44DFF" strokeWidth="1.5" fill="rgba(180,77,255,0.06)"/>
                <rect x="6" y="13" width="3" height="5" rx="0.5" fill="#B44DFF" opacity="0.5"/>
                <rect x="10.5" y="9" width="3" height="9" rx="0.5" fill="#B44DFF" opacity="0.7"/>
                <rect x="15" y="6" width="3" height="12" rx="0.5" fill="#B44DFF" opacity="0.9"/>
                <line x1="5" y1="7" x2="19" y2="7" stroke="#B44DFF" strokeWidth="0.5" opacity="0.2"/>
              </svg>,
            ];
            const stepColors = ["#FF4655", "#4D7CFF", "#FF4655", "#B44DFF"];
            return (
              <div key={i} className={`group flex items-center gap-5 card-xtract p-5 sm:p-6 transition-all duration-700 ${howReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="relative shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105" style={{ background: `${stepColors[i]}08`, border: `1px solid ${stepColors[i]}18`, boxShadow: `0 0 0 rgba(0,0,0,0)` }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 20px ${stepColors[i]}15`; e.currentTarget.style.borderColor = `${stepColors[i]}35`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 0 rgba(0,0,0,0)`; e.currentTarget.style.borderColor = `${stepColors[i]}18`; }}
                >
                  {stepIcons[i]}
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: stepColors[i] }}>{s.step}</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-white mb-1 tracking-tight">{s.title}</h3>
                  <p className="text-[13px] text-neutral-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── WHY AIMLO — Benefits grid like Xtract ─── */}
      <section ref={diffReveal.ref} id="section-about" data-animate className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 pb-28">
        <div className="section-divider mb-16" />
        <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[#FF4655]/50 font-semibold mb-4">
          {lang === "tr" ? "Avantajlar" : "Benefits"}
        </p>
        <h2 className={`text-3xl sm:text-[44px] font-semibold text-white tracking-tight text-center mb-14 leading-tight transition-all duration-700 ${diffReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ letterSpacing: '-1.5px' }}>
          {lang === "tr" ? "Neden AIMLO?" : "Why AIMLO?"}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {l.landingDiffItems.map((item, i) => {
            const colors = ["#FF4655", "#4D7CFF", "#B44DFF"];
            return (
              <div key={i} className={`card-xtract p-8 group transition-all duration-500 ${diffReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300" style={{ background: `${colors[i]}10`, border: `1px solid ${colors[i]}20`, color: colors[i] }}>
                  {benefitIcons[i]}
                </div>
                <h3 className="text-[16px] font-semibold mb-2 tracking-tight" style={{ color: colors[i] }}>{item.title}</h3>
                <p className="text-[14px] text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── SOCIAL PROOF — Testimonials ─── */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 pb-28">
        <div className="section-divider mb-16" />
        <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[#FF4655]/50 font-semibold mb-4">
          {lang === "tr" ? "Topluluk" : "Community"}
        </p>
        <h2 className="text-3xl sm:text-[44px] font-semibold text-white tracking-tight text-center mb-6 leading-tight" style={{ letterSpacing: '-1.5px' }}>
          {lang === "tr" ? "Oyuncular Ne Diyor?" : "What Players Say"}
        </h2>
        <div className="flex items-center justify-center gap-6 mb-12">
          <div className="flex -space-x-2">
            {[
              { letter: "Y", color: "#FF4655" },
              { letter: "E", color: "#4D7CFF" },
              { letter: "A", color: "#B44DFF" },
              { letter: "M", color: "#ECB73E" },
              { letter: "K", color: "#32B8B8" },
            ].map((u, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-[11px] font-bold" style={{ background: `${u.color}20`, color: u.color }}>{u.letter}</div>
            ))}
          </div>
          <div>
            <div className="flex gap-0.5 mb-0.5">
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#FF4655" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </div>
            <p className="text-[12px] text-neutral-400"><span className="text-white font-semibold">500+</span> {lang === "tr" ? "aktif oyuncu" : "active players"}</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {(lang === "tr" ? [
            { name: "Yusuf K.", rank: "Diamond", text: "Round sonrası AI feedback sayesinde positioning hatalarımı düzelttim. 2 haftada Gold'dan Diamond'a çıktım.", color: "#B489FF" },
            { name: "Elif S.", rank: "Platinum", text: "Hata tespiti özelliği müthiş. Aynı peek hatalarını tekrar tekrar yaptığımı fark etmemi sağladı.", color: "#32B8B8" },
            { name: "Arda M.", rank: "Immortal", text: "Detaylı maç raporları ile takım olarak zayıf yönlerimizi gördük. Turnuva hazırlığında çok işe yaradı.", color: "#FF4655" },
          ] : [
            { name: "Alex K.", rank: "Diamond", text: "Post-round AI feedback helped me fix positioning mistakes. Climbed from Gold to Diamond in 2 weeks.", color: "#B489FF" },
            { name: "Sarah M.", rank: "Platinum", text: "The mistake detection feature is amazing. It showed me I was repeating the same peek errors.", color: "#32B8B8" },
            { name: "James R.", rank: "Immortal", text: "Detailed match reports helped our team identify weak points. Invaluable for tournament prep.", color: "#FF4655" },
          ]).map((t, i) => (
            <div key={i} className="card-xtract p-6 group">
              <div className="flex gap-0.5 mb-3">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#FF4655" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <p className="text-[13px] text-neutral-400 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}25` }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-white">{t.name}</p>
                  <p className="text-[10px] font-medium" style={{ color: t.color }}>{t.rank}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DOWNLOAD — Premium card like Xtract ─── */}
      <section id="download-section" data-animate className="relative z-10 mx-auto max-w-3xl px-5 sm:px-8 pb-28">
        <div className={`download-card p-10 sm:p-16 text-center transition-all duration-700 ${isVisible("download-section") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#FF4655]/50 font-semibold mb-4">
            {lang === "tr" ? "Desktop Uygulaması" : "Desktop App"}
          </p>
          <h2 className="text-3xl sm:text-[44px] font-semibold text-white mb-5 leading-tight" style={{ letterSpacing: '-1.5px' }}>
            {lang === "tr" ? "Hemen İndirin, Oynamaya Başlayın" : "Download Now, Start Playing"}
          </h2>
          <p className="text-[15px] text-neutral-400 mb-10 max-w-md mx-auto leading-relaxed">
            {lang === "tr"
              ? "Oyununu otomatik izlesin, round sonrası anında AI koçluk feedback'i versin."
              : "Auto-watches your game, gives instant AI coaching after each round."}
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-[13px] text-neutral-400">
            {[
              lang === "tr" ? "Otomatik izleme" : "Auto tracking",
              lang === "tr" ? "In-game overlay" : "In-game overlay",
              lang === "tr" ? "Ücretsiz" : "Free",
            ].map((t2, i2) => (
              <span key={i2} className="flex items-center gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF4655" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {t2}
              </span>
            ))}
          </div>
          <button className="btn-neon rounded-xl px-10 py-4 text-[14px] flex items-center gap-2 mx-auto">
            {lang === "tr" ? "Windows için İndir" : "Download for Windows"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </button>
          <p className="mt-5 text-[11px] text-neutral-700">Windows 10+ · ~100MB</p>
        </div>
      </section>

      {/* ─── FAQ — Xtract accordion ─── */}
      <section id="section-faq" data-animate className="relative z-10 mx-auto max-w-2xl px-5 sm:px-8 pb-28">
        <div className="section-divider mb-16" />
        <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[#FF4655]/50 font-semibold mb-4">FAQ</p>
        <h2 className="text-3xl sm:text-[44px] font-semibold text-white tracking-tight text-center mb-14 leading-tight" style={{ letterSpacing: '-1.5px' }}>
          {l.landingFaqTitle}
        </h2>
        <div className="space-y-3">
          {l.landingFaqs.map((faq, i) => (
            <div key={i} className="faq-item overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="text-[14px] font-medium text-white pr-4">{faq.q}</span>
                <span className={`shrink-0 text-neutral-500 transition-transform duration-300 ${openFaq === i ? "rotate-45" : ""}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-5 pb-5">
                  <p className="text-[13px] text-neutral-500 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-[13px] text-neutral-600 mb-2">{l.landingHelpText}</p>
          <a href="mailto:support@aimlo.gg" className="text-[13px] text-[#FF4655] hover:text-[#FF6B77]/70 transition font-medium">
            support@aimlo.gg
          </a>
        </div>
      </section>

      {/* ─── FINAL CTA — like Xtract's footer CTA ─── */}
      <section className="relative z-10 mx-auto max-w-3xl px-5 sm:px-8 pb-28 text-center">
        <div className="section-divider mb-16" />
        <h2 className="text-4xl sm:text-[56px] font-semibold text-white mb-5 leading-tight" style={{ letterSpacing: '-2px' }}>
          {lang === "tr" ? "Gelişmeye hazır mısın?" : "Ready to improve?"}
        </h2>
        <p className="text-[15px] text-neutral-400 mb-10 max-w-md mx-auto leading-relaxed">
          {l.landingHeroSub}
        </p>
        <button onClick={user ? onDashboard : onStartAnalysis} className="btn-neon rounded-xl px-8 py-3.5 text-[14px] flex items-center gap-2 mx-auto">
          {user ? l.goToDashboard : l.landingCTA}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </button>
      </section>

      {/* ─── FOOTER — clean minimal ─── */}
      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/aimlo-logo.png" alt="AIMLO" style={{ height: 22, width: 'auto', opacity: 0.4 }} draggable={false} />
              <span className="text-[12px] text-neutral-600">
                {lang === "tr" ? "AI destekli Valorant koçluk platformu" : "AI-powered Valorant coaching platform"}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href="mailto:support@aimlo.gg" className="text-[12px] text-neutral-600 hover:text-white transition">support@aimlo.gg</a>
              <button onClick={() => document.getElementById("section-about")?.scrollIntoView({ behavior: "smooth" })} className="text-[12px] text-neutral-600 hover:text-white transition">{l.landingNav.about}</button>
              <button onClick={() => document.getElementById("section-faq")?.scrollIntoView({ behavior: "smooth" })} className="text-[12px] text-neutral-600 hover:text-white transition">{l.landingNav.faq}</button>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
            <p className="text-[11px] text-neutral-800">{IC.copy} 2025 AIMLO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
/* ══════════════════════════════════════════════════════════
   AUTH SCREEN — profiles upsert + username login (ilike)
   ══════════════════════════════════════════════════════════ */
function AuthScreen({
  lang,
  onAuth,
  initialMode,
  onBackToLanding,
}: {
  lang: Lang;
  onAuth: (user: User) => void;
  initialMode: AuthMode;
  onBackToLanding: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const al = t[lang];
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // Client-side email format check — prevents unnecessary Supabase calls & rate limits
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (mode === "register" && !emailRegex.test(email.trim())) {
      setError(
        lang === "tr"
          ? "Geçerli bir e-posta adresi girin"
          : "Please enter a valid email address",
      );
      return;
    }
    if (mode === "register" && username.trim().length < 3) {
      setError(
        lang === "tr"
          ? "Kullanıcı adı en az 3 karakter olmalı"
          : "Username must be at least 3 characters",
      );
      return;
    }
    if (mode === "register" && password.length < 6) {
      setError(
        lang === "tr"
          ? "Şifre en az 6 karakter olmalı"
          : "Password must be at least 6 characters",
      );
      return;
    }
    setLoading(true);
    try {
      if (mode === "register") {
        if (password !== passwordConfirm) {
          setError(al.authPasswordMismatch);
          setLoading(false);
          return;
        }
        // Check username availability before signup
        const usernameAvailable = await checkUsernameAvailable(username);
        if (!usernameAvailable) {
          setError(
            lang === "tr"
              ? "Bu kullanıcı adı zaten alınmış"
              : "This username is already taken",
          );
          setLoading(false);
          return;
        }
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              username,
              display_name: `${firstName} ${lastName}`,
            },
          },
        });
        if (err) {
          setError(localizeAuthError(err.message, lang));
          setLoading(false);
          return;
        }
        // Create profile — notify user if it fails
        if (data.user) {
          const profileResult = await upsertProfile(data.user.id, {
            username,
            email,
            first_name: firstName,
            last_name: lastName,
          });
          if (!profileResult.ok) {
            console.warn(
              "[Aimlo] Profile creation failed:",
              profileResult.error,
            );
            // Non-blocking warning — user can still use email login
            setError(
              lang === "tr"
                ? "Hesap oluşturuldu ancak profil kaydedilemedi. Kullanıcı adı ile giriş çalışmayabilir."
                : "Account created but profile could not be saved. Username login may not work.",
            );
            // Don't block — continue with auth flow after brief display
          }
        }
        if (data.user && !data.session) {
          setCheckEmail(true);
          setLoading(false);
          return;
        }
        if (data.user && data.session) onAuth(data.user);
      } else {
        let loginEmail = email.trim();
        // Username login: secure RPC lookup (SECURITY DEFINER function)
        if (!loginEmail.includes("@")) {
          const { data: foundEmail, error: rpcError } = await supabase
            .rpc("lookup_email_by_username", {
              lookup_username: loginEmail.toLowerCase(),
            });
          if (rpcError || !foundEmail) {
            setError(localizeAuthError("Username not found", lang));
            setLoading(false);
            return;
          }
          loginEmail = foundEmail as string;
        }
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });
        if (err) {
          setError(localizeAuthError(err.message, lang));
          setLoading(false);
          return;
        }
        if (data.user) onAuth(data.user);
      }
    } catch {
      setError(al.authError);
    }
    setLoading(false);
  }
  if (checkEmail)
    return (
      <main className="min-h-screen bg-[#030711] flex items-center justify-center px-4">
        <AmbientBg />
        <div className="relative z-10 w-full max-w-sm space-y-8 text-center animate-slide-up-big">
          <img src="/aimlo-logo.png" alt="AIMLO" style={{ height: 34, width: 'auto' }} draggable={false} className="mx-auto opacity-30" />
          <div className="card-glow rounded-2xl p-10 space-y-6">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF4655]/[0.06] border border-[#FF4655]/15">
              <span className="text-3xl">✉️</span>
              <span className="absolute inset-0 rounded-2xl animate-ping bg-[#FF4655]/[0.05]" style={{ animationDuration: '2s' }} />
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">{al.authCheckEmail}</p>
            <button onClick={() => { setCheckEmail(false); setMode("login"); }} className="btn-ghost w-full rounded-xl py-3.5 text-sm">
              {al.authLogin}
            </button>
          </div>
        </div>
      </main>
    );

  const inputCls = "w-full rounded-xl border border-white/[0.06] bg-[#0a0f1e]/90 px-4 py-4 text-sm text-white outline-none transition-all duration-300 focus:border-[#FF4655]/25 focus:ring-2 focus:ring-[#FF4655]/10 focus:shadow-[0_0_20px_rgba(255,70,85,0.05)] placeholder-neutral-600";

  return (
    <main className="min-h-screen bg-[#030711] relative flex items-center justify-center px-4 py-12 overflow-hidden">
      <AmbientBg />
      {/* Decorative orbiting rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-30">
        <div className="absolute inset-0 rounded-full border border-[#FF4655]/[0.04] animate-rotate-slow" />
        <div className="absolute inset-16 rounded-full border border-[#4D7CFF]/[0.03] animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />
      </div>

      <div className="relative z-10 w-full max-w-[440px] space-y-8 animate-slide-up-big">
        <div className="text-center space-y-5">
          <button onClick={onBackToLanding} className="mx-auto flex items-center gap-2 text-[12px] text-neutral-600 transition hover:text-[#FF6B77] hover-underline">
            ← {al.back}
          </button>
          <img src="/aimlo-logo.png" alt="AIMLO" style={{ height: 34, width: 'auto' }} draggable={false} className="mx-auto opacity-30" />
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              {mode === "login" ? al.authLogin : al.authRegister}
            </h2>
            <p className="mt-2 text-sm text-neutral-500">{al.tagline}</p>
          </div>
        </div>

        <div className="card-glow rounded-2xl p-7 sm:p-9">
          {/* Top accent line */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#FF4655]/20 to-transparent" />
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.2em] text-[#FF4655]/35">{al.authFirstName}</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="" required className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.2em] text-[#FF4655]/35">{al.authLastName}</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="" required className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.2em] text-[#FF4655]/35">{al.authUsername}</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="" required className={inputCls} />
                </div>
              </>
            )}
            <div>
              <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.2em] text-[#FF4655]/35">{mode === "login" ? al.authEmailOrUsername : al.authEmail}</label>
              <input type={mode === "register" ? "email" : "text"} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="" required className={inputCls} />
            </div>
            <div>
              <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.2em] text-[#FF4655]/35">{al.authPassword}</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="" required minLength={6} className={inputCls} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-[#FF6B77] transition" tabIndex={-1}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            {mode === "register" && (
              <div>
                <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.2em] text-[#FF4655]/35">{al.authPasswordConfirm}</label>
                <div className="relative">
                  <input type={showPasswordConfirm ? "text" : "password"} value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="" required minLength={6} className={inputCls} style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-[#FF6B77] transition" tabIndex={-1}>
                    {showPasswordConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-xl bg-[#FF3D71]/[0.06] border border-[#FF3D71]/15 px-4 py-3 animate-scale-in">
                <p className="text-xs text-[#FF3D71] font-semibold">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-neon w-full rounded-xl py-4.5 text-sm mt-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#030711]/30 border-t-[#030711]" />
                  {al.authLoading}
                </span>
              ) : mode === "login" ? al.authLogin : al.authRegister}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-neutral-500">
          {mode === "login" ? al.authNoAccount : al.authHasAccount}{" "}
          <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="text-[#FF4655] hover:text-[#FF6B77]/70 transition font-black hover-underline">
            {mode === "login" ? al.authRegister : al.authLogin}
          </button>
        </p>
      </div>
    </main>
  );
}
/* ══════════════════════════════════════════════════════════
   MAIN APP — render-time setScreen FIXED
   ══════════════════════════════════════════════════════════ */
export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      })
      .catch((err) => {
        console.error("[Aimlo] getSession error:", err);
        setAuthLoading(false);
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[Aimlo] signOut error:", err);
    }
    setUser(null);
    setScreen("landing");
    clearDraft();
  }
  const [lang, setLang] = useState<Lang | null>(null);
  const [screen, setScreen] = useState<Screen>("landing");
  const [setup, setSetup] = useState<SetupData>({
    map: "",
    agent: "",
    side: "",
    teamComp: [],
    enemyComp: [],
    unknownEnemyComp: false,
  });
  const [setupStep, setSetupStep] = useState<SetupStep>("mapAgent");
  const [setupErrors, setSetupErrors] = useState<FormErrors>({});
  const [compTarget, setCompTarget] = useState<CompTarget>("team");
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [roundForm, setRoundForm] = useState<RoundForm>({
    deathLocation: "",
    enemyCount: "",
    yourNote: "",
  });
  const [roundErrors, setRoundErrors] = useState<FormErrors>({});
  const [roundMode, setRoundMode] = useState<RoundScreenMode>("input");
  const [currentFeedback, setCurrentFeedback] = useState<RoundFeedback | null>(
    null,
  );
  const [currentResult, setCurrentResult] = useState<RoundResult | null>(null);
  const [survived, setSurvived] = useState(false);
  const [matchScore, setMatchScore] = useState<MatchScore>({
    yours: "",
    enemy: "",
  });
  const [pendingFinishRound, setPendingFinishRound] =
    useState<RoundData | null>(null);
  const [report, setReport] = useState<ReturnType<
    typeof genMatchReport
  > | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [viewingReport, setViewingReport] = useState<SavedReport | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilterMap, setHistoryFilterMap] = useState("");
  const [historyFilterAgent, setHistoryFilterAgent] = useState("");
  const [historyFilterResult, setHistoryFilterResult] = useState<"all" | "wins" | "losses">("all");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadBannerDismissed, setDownloadBannerDismissed] = useState(false);
  const [verifiedBanner, setVerifiedBanner] = useState<
    "success" | "error" | null
  >(null);
  const locations = setup.map ? (MAP_LOCATIONS[setup.map] ?? []) : [];
  const roundNum = roundIdx + 1;
  // Check for email verification callback (?verified=true)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const verified = params.get("verified");
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (verified === "true") {
      setVerifiedBanner("success");
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
      // Auto-hide after 8 seconds
      timer = setTimeout(() => setVerifiedBanner(null), 8000);
    } else if (verified === "error") {
      setVerifiedBanner("error");
      window.history.replaceState({}, "", window.location.pathname);
      timer = setTimeout(() => setVerifiedBanner(null), 8000);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, []);
  // ALL hooks must be above early returns — React rules of hooks
  const finishLockRef = useRef(false);
  const submitLockRef = useRef(false);
  const winRate = useMemo(
    () =>
      savedReports.length > 0
        ? Math.round(
            (savedReports.filter((r) => r.won).length / savedReports.length) *
              100,
          )
        : 0,
    [savedReports],
  );
  const topDeathSpot = useMemo(() => {
    const spots: Record<string, number> = {};
    savedReports.forEach((r) => {
      r.rounds
        .filter((rd) => !rd.skipped && !rd.survived && rd.deathLocation)
        .forEach((rd) => {
          spots[rd.deathLocation] = (spots[rd.deathLocation] || 0) + 1;
        });
    });
    return Object.entries(spots).sort((a, b) => b[1] - a[1])[0];
  }, [savedReports]);
  const topAgent = useMemo(() => {
    const agents: Record<string, number> = {};
    savedReports.forEach((r) => {
      if (r.agent) agents[r.agent] = (agents[r.agent] || 0) + 1;
    });
    const top = Object.entries(agents).sort((a, b) => b[1] - a[1])[0];
    return top ? { name: top[0], count: top[1] } : null;
  }, [savedReports]);
  // Agent performance: win rate + match count per agent
  const agentPerf = useMemo(() => {
    const map: Record<string, { wins: number; total: number }> = {};
    savedReports.forEach((r) => {
      if (!r.agent) return;
      if (!map[r.agent]) map[r.agent] = { wins: 0, total: 0 };
      map[r.agent].total++;
      if (r.won) map[r.agent].wins++;
    });
    return Object.entries(map)
      .map(([name, d]) => ({ name, wins: d.wins, total: d.total, wr: d.total > 0 ? Math.round((d.wins / d.total) * 100) : 0 }))
      .sort((a, b) => b.total - a.total);
  }, [savedReports]);
  // Map performance: win rate + match count per map
  const mapPerf = useMemo(() => {
    const m: Record<string, { wins: number; total: number }> = {};
    savedReports.forEach((r) => {
      if (!r.map) return;
      if (!m[r.map]) m[r.map] = { wins: 0, total: 0 };
      m[r.map].total++;
      if (r.won) m[r.map].wins++;
    });
    return Object.entries(m)
      .map(([name, d]) => ({ name, wins: d.wins, total: d.total, wr: d.total > 0 ? Math.round((d.wins / d.total) * 100) : 0 }))
      .sort((a, b) => b.total - a.total);
  }, [savedReports]);
  // AI summary: most common mistake, strength, area to improve
  const aiSummary = useMemo(() => {
    if (savedReports.length === 0) return null;
    // Most common mistake — aggregate from mistake field
    const mistakes: Record<string, number> = {};
    savedReports.forEach((r) => {
      if (r.mistake) {
        const key = r.mistake.slice(0, 80);
        mistakes[key] = (mistakes[key] || 0) + 1;
      }
    });
    const topMistake = Object.entries(mistakes).sort((a, b) => b[1] - a[1])[0];
    // Strength — best agent by win rate (min 2 matches)
    const bestAgent = agentPerf.filter((a) => a.total >= 2).sort((a, b) => b.wr - a.wr)[0];
    // Improvement area — worst map by win rate (min 2 matches)
    const worstMap = mapPerf.filter((m) => m.total >= 2).sort((a, b) => a.wr - b.wr)[0];
    return {
      topMistake: topMistake ? topMistake[0] : null,
      strength: bestAgent ? `${bestAgent.name} (${bestAgent.wr}% WR)` : null,
      improveArea: worstMap ? `${worstMap.name} (${worstMap.wr}% WR)` : null,
    };
  }, [savedReports, agentPerf, mapPerf]);
  // AI Insight — coaching-style top message
  const aiInsight = useMemo(() => {
    const ll = t[lang ?? "en"];
    if (savedReports.length < 2) return ll.aiInsightNoData;

    const deathSpots: Record<string, number> = {};
    savedReports.forEach(r => r.rounds?.filter(rd => !rd.skipped && !rd.survived && rd.deathLocation)
      .forEach(rd => { deathSpots[rd.deathLocation] = (deathSpots[rd.deathLocation] || 0) + 1; }));
    const topDeath = Object.entries(deathSpots).sort((a, b) => b[1] - a[1])[0];

    const recent = savedReports.slice(0, 5);
    const recentWR = recent.length > 0 ? recent.filter(r => r.won).length / recent.length * 100 : 0;

    const mapWR: Record<string, { w: number; t: number }> = {};
    savedReports.forEach(r => {
      if (!mapWR[r.map]) mapWR[r.map] = { w: 0, t: 0 };
      mapWR[r.map].t++;
      if (r.won) mapWR[r.map].w++;
    });
    const worst = Object.entries(mapWR).filter(e => e[1].t >= 2).sort((a, b) => (a[1].w / a[1].t) - (b[1].w / b[1].t))[0];

    let text = "";
    if (lang === "tr") {
      if (topDeath) text += `${topDeath[0]}'de ${topDeath[1]} kez öldün — en zayıf bölgen. `;
      if (recentWR < 40) text += "Son maçlarda performans düşük. ";
      else if (recentWR > 60) text += "Performansın yükselişte. ";
      if (worst) text += `${worst[0]}'te winrate %${Math.round(worst[1].w / worst[1].t * 100)} — strateji değişikliği öneriyorum.`;
    } else {
      if (topDeath) text += `Died ${topDeath[1]} times at ${topDeath[0]} — your weakest spot. `;
      if (recentWR < 40) text += "Recent performance is declining. ";
      else if (recentWR > 60) text += "Performance is improving. ";
      if (worst) text += `${worst[0]} winrate ${Math.round(worst[1].w / worst[1].t * 100)}% — consider changing strategy.`;
    }
    return text || ll.aiInsightMoreData;
  }, [savedReports, lang]);
  // Problem areas — three weakest points
  const problemAreas = useMemo(() => {
    const deathSpots: Record<string, number> = {};
    savedReports.forEach(r => r.rounds?.filter(rd => !rd.skipped && !rd.survived && rd.deathLocation)
      .forEach(rd => { deathSpots[rd.deathLocation] = (deathSpots[rd.deathLocation] || 0) + 1; }));
    const topDeath = Object.entries(deathSpots).sort((a, b) => b[1] - a[1])[0];

    const mapWR: Record<string, { w: number; t: number }> = {};
    savedReports.forEach(r => {
      if (!r.map) return;
      if (!mapWR[r.map]) mapWR[r.map] = { w: 0, t: 0 };
      mapWR[r.map].t++;
      if (r.won) mapWR[r.map].w++;
    });
    const worstMap = Object.entries(mapWR).filter(e => e[1].t >= 2).sort((a, b) => (a[1].w / a[1].t) - (b[1].w / b[1].t))[0];

    // Pattern: find if any death location appears 3+ times in recent matches
    const recentDeaths: Record<string, number> = {};
    savedReports.slice(0, 5).forEach(r => r.rounds?.filter(rd => !rd.skipped && !rd.survived && rd.deathLocation)
      .forEach(rd => { recentDeaths[rd.deathLocation] = (recentDeaths[rd.deathLocation] || 0) + 1; }));
    const repeatingSpot = Object.entries(recentDeaths).filter(e => e[1] >= 3).sort((a, b) => b[1] - a[1])[0];

    return {
      deathSpot: topDeath ? { name: topDeath[0], count: topDeath[1] } : null,
      worstMap: worstMap ? { name: worstMap[0], wr: Math.round(worstMap[1].w / worstMap[1].t * 100) } : null,
      pattern: repeatingSpot ? { name: repeatingSpot[0], count: repeatingSpot[1] } : null,
    };
  }, [savedReports]);

  // ── Skill Profile (from lib) ──
  const webSkillProfile = useMemo(() => {
    if (savedReports.length < 2) return null;
    const matchData = savedReports.map(r => ({
      won: r.won,
      map: r.map,
      agent: r.agent,
      rounds: (r.rounds || []).map(rd => ({
        deathLocation: rd.deathLocation,
        survived: rd.survived,
        skipped: rd.skipped,
        result: rd.result,
        enemyCount: rd.enemyCount,
        yourNote: rd.yourNote,
      })),
    }));
    return calculateSkillProfile(matchData);
  }, [savedReports]);

  // ── Playstyle (from lib) ──
  const webPlaystyle = useMemo(() => {
    if (savedReports.length < 3) return null;
    const matchData = savedReports.map(r => ({
      won: r.won,
      agent: r.agent,
      rounds: (r.rounds || []).map(rd => ({
        deathLocation: rd.deathLocation,
        survived: rd.survived,
        skipped: rd.skipped,
        result: rd.result,
      })),
    }));
    return analyzePlaystyle(matchData);
  }, [savedReports]);

  // Match mini insight helper
  const getMatchInsight = useCallback((entry: SavedReport): string | null => {
    if (!entry.rounds || entry.rounds.length === 0) return null;
    const ll = t[lang ?? "en"];
    const deaths: Record<string, number> = {};
    entry.rounds.filter(rd => !rd.skipped && !rd.survived && rd.deathLocation)
      .forEach(rd => { deaths[rd.deathLocation] = (deaths[rd.deathLocation] || 0) + 1; });
    const topRepeat = Object.entries(deaths).filter(e => e[1] >= 3).sort((a, b) => b[1] - a[1])[0];
    if (topRepeat) {
      return lang === "tr"
        ? `${topRepeat[0]}'de ${topRepeat[1]} ${ll.matchInsightDeaths} — ${ll.matchInsightRepeat}`
        : `${topRepeat[1]} ${ll.matchInsightDeaths} at ${topRepeat[0]} — ${ll.matchInsightRepeat}`;
    }
    if (entry.won && entry.winPct >= 60) return ll.matchInsightStrong;
    if (!entry.won && entry.winPct <= 30) return ll.matchInsightBadLoss;
    return null;
  }, [lang]);
  // ── Premium dashboard helpers ──
  function generateMiniMatchInsight(report: SavedReport): string | null {
    if (!report.rounds || report.rounds.length === 0) return null;
    const deaths: Record<string, number> = {};
    report.rounds.filter(r => !r.skipped && !r.survived && r.deathLocation)
      .forEach(r => { deaths[r.deathLocation] = (deaths[r.deathLocation] || 0) + 1; });
    const top = Object.entries(deaths).sort((a,b) => b[1]-a[1])[0];
    if (top && top[1] >= 2) return `${top[0]}'de ${top[1]}x death — position repeat`;
    if (report.won && Number(report.score?.split(/[-–]/)?.[0]) >= 13) return lang === "tr" ? "Güçlü maç performansı" : "Strong match performance";
    if (!report.won) return lang === "tr" ? "Gelişim alanları tespit edildi" : "Improvement areas detected";
    return null;
  }
  function getMatchTagWeb(report: SavedReport): { label: string; color: string } | null {
    const played = report.rounds ? report.rounds.filter(r => !r.skipped).length : 0;
    const survRate = report.rounds ? report.rounds.filter(r => !r.skipped && r.survived).length / Math.max(played, 1) : 0.5;
    if (report.won && survRate > 0.55) return { label: "Dominant", color: "#10b981" };
    if (!report.won && survRate < 0.3) return { label: lang === "tr" ? "Riskli" : "Risky", color: "#ef4444" };
    if (report.won) return { label: lang === "tr" ? "Kontrollü" : "Controlled", color: "#22d3ee" };
    return { label: lang === "tr" ? "Gelişim" : "Growth", color: "#f59e0b" };
  }
  // Filtered reports for history screen
  const filteredReports = useMemo(() => {
    let filtered = savedReports;
    if (historyFilterMap) filtered = filtered.filter((r) => r.map === historyFilterMap);
    if (historyFilterAgent) filtered = filtered.filter((r) => r.agent === historyFilterAgent);
    if (historyFilterResult === "wins") filtered = filtered.filter((r) => r.won);
    if (historyFilterResult === "losses") filtered = filtered.filter((r) => !r.won);
    return filtered;
  }, [savedReports, historyFilterMap, historyFilterAgent, historyFilterResult]);
  const filteredWinRate = useMemo(() => {
    if (filteredReports.length === 0) return 0;
    return Math.round((filteredReports.filter((r) => r.won).length / filteredReports.length) * 100);
  }, [filteredReports]);
  // Unique maps and agents for filter dropdowns
  const uniqueMaps = useMemo(() => [...new Set(savedReports.map((r) => r.map).filter(Boolean))].sort(), [savedReports]);
  const uniqueAgents = useMemo(() => [...new Set(savedReports.map((r) => r.agent).filter(Boolean))].sort(), [savedReports]);
  // FIX: redirect "lang" via useEffect, not during render
  useEffect(() => {
    if (user && screen === "lang") setScreen("landing");
  }, [user, screen]);
  useEffect(() => {
    setLang(loadLang() || "en");
  }, []);
  useEffect(() => {
    if (screen === "setup" || screen === "round")
      saveDraft({ setup, setupStep, rounds, roundIdx, screen });
  }, [setup, setupStep, rounds, roundIdx, screen]);
  const draftRestored = useRef(false);
  useEffect(() => {
    if (!draftRestored.current && user && lang) {
      draftRestored.current = true;
      const draft = loadDraft();
      if (
        draft &&
        (draft.screen === "setup" || draft.screen === "round") &&
        draft.setup?.map &&
        Array.isArray(draft.rounds) &&
        typeof draft.roundIdx === "number"
      ) {
        setSetup(draft.setup);
        setSetupStep(draft.setupStep);
        setRounds(draft.rounds);
        setRoundIdx(draft.roundIdx);
        setScreen(draft.screen);
      } else if (draft) {
        // Invalid draft shape — clear it
        clearDraft();
      }
    }
  }, [user, lang]);
  const loadHistory = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    function rowToReport(row: Record<string, unknown>): SavedReport {
      const json = (row.raw_result_json as Record<string, unknown>) || {};
      const rawDateStr = (row.created_at as string) || new Date().toISOString();
      const parsedDate = new Date(rawDateStr);
      const isValidDate = !isNaN(parsedDate.getTime());
      return {
        id: (row.id as string) || crypto.randomUUID(),
        map: (json.map as string) || (row.riot_id as string) || "",
        agent: (json.agent as string) || (row.region as string) || "",
        side: (json.side as string) || "",
        score: (json.score as string) || "",
        won: (json.won as boolean) ?? false,
        rawDate: isValidDate
          ? parsedDate.toISOString()
          : new Date().toISOString(),
        date: isValidDate
          ? parsedDate.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "",
        summary: (row.summary as string) || (json.summary as string) || "",
        mistake: (row.weakness as string) || (json.mistake as string) || "",
        tendencies:
          (row.strength as string) || (json.tendencies as string) || "",
        adjustment: (row.focus as string) || (json.adjustment as string) || "",
        bestRound: (json.bestRound as string) || "",
        decisionScore: (json.decisionScore as string) || "",
        winPct: (json.winPct as number) || 0,
        roundsWon: (json.roundsWon as number) || 0,
        roundsLost: (json.roundsLost as number) || 0,
        roundsSkipped: (json.roundsSkipped as number) || 0,
        survivedCount: (json.survivedCount as number) || 0,
        totalRounds: (json.totalRounds as number) || 0,
        rounds: (json.rounds as RoundData[]) || [],
        setup: (json.setup as SetupData) || {
          map: "",
          agent: "",
          side: "",
          teamComp: [],
          enemyComp: [],
          unknownEnemyComp: false,
        },
      };
    }
    let allReports: SavedReport[] = [];
    try {
      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) console.error("[Aimlo] History load error:", error.message);
      else if (data?.length)
        allReports = data.map((row: Record<string, unknown>) =>
          rowToReport(row),
        );
    } catch (err) {
      console.error("[Aimlo] History load exception:", err);
    }
    try {
      const localRaw = JSON.parse(
        localStorage.getItem(`aimlo_local_reports_${user.id}`) || "[]",
      );
      if (localRaw.length > 0) {
        const lr: SavedReport[] = localRaw.map((row: Record<string, unknown>) =>
          rowToReport(row),
        );
        const ids = new Set(allReports.map((r) => r.id));
        for (const r of lr) {
          if (!ids.has(r.id)) allReports.push(r);
        }
        allReports.sort(
          (a, b) =>
            new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime(),
        );
      }
    } catch (localErr) {
      // Clear corrupted localStorage data
      console.error("[Aimlo] Local reports parse failed, clearing:", localErr);
      try {
        localStorage.removeItem(`aimlo_local_reports_${user.id}`);
      } catch {}
    }
    setSavedReports(allReports);
    setHistoryLoading(false);
  }, [user, lang]);
  useEffect(() => {
    if (user && lang) loadHistory();
  }, [user, lang, loadHistory]);
  async function saveReportToDb(
    rep: ReturnType<typeof genMatchReport>,
    sd: SetupData,
    rd: RoundData[],
    sc: MatchScore,
  ) {
    if (!user) return;
    // NOTE: DB columns riot_id/region are legacy names; they store map/agent respectively.
    // raw_result_json contains the canonical field names.
    const payload = {
      user_id: user.id,
      riot_id: sd.map, // legacy: stores map name
      region: sd.agent, // legacy: stores agent name
      summary: rep.summary,
      weakness: rep.mistake,
      strength: rep.tendencies,
      focus: rep.adjustment,
      raw_result_json: {
        map: sd.map,
        agent: sd.agent,
        side: sd.side,
        score: rep.scoreStr,
        won: rep.matchWon,
        winPct: rep.winPct,
        roundsWon: rep.won,
        roundsLost: rep.lost,
        roundsSkipped: rep.skipped,
        survivedCount: rep.survivedCount,
        totalRounds: rep.total,
        rounds: rd,
        setup: sd,
      },
    };
    let ok = false;
    try {
      const { error } = await supabase.from("analyses").insert(payload);
      if (error) console.error("[Aimlo] Save:", error.message);
      else ok = true;
    } catch (e) {
      console.error("[Aimlo] Save exception:", e);
    }
    if (!ok) {
      try {
        const ex = JSON.parse(
          localStorage.getItem(`aimlo_local_reports_${user.id}`) || "[]",
        );
        ex.unshift({
          ...payload,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        });
        localStorage.setItem(
          `aimlo_local_reports_${user.id}`,
          JSON.stringify(ex.slice(0, 100)),
        );
      } catch {}
    }
    loadHistory();
  }

  /* ══════════════════════════════════════════════════════════
     DELETE REPORT — remove from Supabase + localStorage
     ══════════════════════════════════════════════════════════ */
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function deleteReport(reportId: string) {
    if (!user) return;
    setDeletingId(reportId);
    try {
      const headers = await getAuthHeaders();
      const { error } = await supabase
        .from("analyses")
        .delete()
        .eq("id", reportId)
        .eq("user_id", user.id);
      if (error) {
        console.error("[Aimlo] Delete report:", error.message);
      }
      // Remove from localStorage fallback too
      try {
        const key = `aimlo_local_reports_${user.id}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          const arr = JSON.parse(raw) as unknown[];
          const filtered = arr.filter((r: any) => r?.id !== reportId);
          localStorage.setItem(key, JSON.stringify(filtered));
        }
      } catch {}
      // Update state immediately
      setSavedReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      console.error("[Aimlo] Delete report error:", err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  useEffect(() => {
    setSetup((prev) => {
      const comp = [...prev.teamComp];
      if (prev.agent) {
        const idx = comp.indexOf(prev.agent);
        if (idx > 0) comp.splice(idx, 1);
        comp[0] = prev.agent;
        const newComp = [prev.agent, ...comp.filter((a) => a && a !== prev.agent)];
        // Avoid unnecessary re-renders if teamComp hasn't actually changed
        if (
          newComp.length === prev.teamComp.length &&
          newComp.every((a, i) => a === prev.teamComp[i])
        ) {
          return prev;
        }
        return {
          ...prev,
          teamComp: newComp,
        };
      } else {
        const newComp = comp.filter((a) => a);
        if (
          newComp.length === prev.teamComp.length &&
          newComp.every((a, i) => a === prev.teamComp[i])
        ) {
          return prev;
        }
        if (comp.length > 0 && comp[0]) comp[0] = "";
        return { ...prev, teamComp: newComp };
      }
    });
  }, [setup.agent]);
  if (authLoading || !lang)
    return (
      <main className={`${ds.pageBg} flex items-center justify-center`}>
        <AmbientBg />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <AimloLogo size={72} className="animate-pulse" />
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      </main>
    );
  // ── Email verification banner (shows on any screen) ──
  const VerifiedBanner = verifiedBanner ? (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-3 px-6 py-4 text-base font-bold shadow-lg transition-all duration-300 ${
        verifiedBanner === "success"
          ? "bg-emerald-500/25 border-b-2 border-emerald-400/50 text-emerald-200"
          : "bg-red-500/25 border-b-2 border-red-400/50 text-red-200"
      }`}
      style={{ backdropFilter: "blur(12px)" }}
    >
      <span className={`text-lg ${verifiedBanner === "success" ? "text-emerald-400" : "text-red-400"}`}>
        {verifiedBanner === "success" ? "✓" : "✕"}
      </span>
      <span>
        {verifiedBanner === "success"
          ? lang === "tr"
            ? "E-posta başarıyla doğrulandı! Giriş yapabilirsiniz."
            : "Email verified successfully! You can now sign in."
          : lang === "tr"
            ? "E-posta doğrulama başarısız oldu. Lütfen tekrar deneyin."
            : "Email verification failed. Please try again."}
      </span>
      <button
        onClick={() => setVerifiedBanner(null)}
        className="ml-3 rounded-lg px-3 py-1 text-sm opacity-70 hover:opacity-100 transition hover:bg-white/10"
      >
        ✕
      </button>
    </div>
  ) : null;
  if (screen === "landing")
    return (
      <>
        {VerifiedBanner}
        <LandingPage
        lang={lang}
        user={user}
        onStartAnalysis={() => {
          setAuthMode("register");
          setScreen("lang");
        }}
        onLogin={() => {
          setAuthMode("login");
          setScreen("lang");
        }}
        onRegister={() => {
          setAuthMode("register");
          setScreen("lang");
        }}
        onLangToggle={() => {
          const nl = lang === "tr" ? "en" : "tr";
          setLang(nl);
          saveLang(nl);
        }}
        onDashboard={() => setScreen("dashboard")}
        onSignOut={handleSignOut}
      />
      </>
    );
  if (!user)
    return (
      <AuthScreen
        lang={lang}
        onAuth={(u) => {
          setUser(u);
          setScreen("dashboard");
        }}
        initialMode={authMode}
        onBackToLanding={() => setScreen("landing")}
      />
    );
  // useEffect redirects "lang" screen — show loading spinner briefly
  if (screen === "lang")
    return (
      <main className={`${ds.pageBg} flex items-center justify-center`}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </main>
    );
  const l = t[lang];
  function updateSetup<K extends keyof SetupData>(key: K, val: SetupData[K]) {
    setSetup((p) => ({ ...p, [key]: val }));
    setSetupErrors((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });
  }
  function updateRound<K extends keyof RoundForm>(key: K, val: string) {
    setRoundForm((p) => ({ ...p, [key]: val }));
    setRoundErrors((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });
  }
  function handleCompSelect(type: "teamComp" | "enemyComp", agent: string) {
    setSetup((prev) => {
      const arr = [...prev[type]];
      if (type === "teamComp" && agent === prev.agent) return prev;
      const idx = arr.indexOf(agent);
      if (idx >= 0) arr.splice(idx, 1);
      else if (arr.length < 5) arr.push(agent);
      return { ...prev, [type]: arr };
    });
    setSetupErrors((p) => {
      const n = { ...p };
      delete n[type];
      return n;
    });
  }
  function loadRoundAtIndex(idx: number) {
    setRoundIdx(idx);
    setRoundErrors({});
    setRoundMode("input");
    setCurrentFeedback(null);
    setCurrentResult(null);
    setSurvived(false);
    if (idx < rounds.length) {
      const r = rounds[idx];
      setSurvived(r.survived);
      setRoundForm(
        r.skipped
          ? { deathLocation: "", enemyCount: "", yourNote: "" }
          : {
              deathLocation: r.deathLocation,
              enemyCount: r.enemyCount,
              yourNote: r.yourNote,
            },
      );
    } else setRoundForm({ deathLocation: "", enemyCount: "", yourNote: "" });
  }
  function saveRoundData(rd: RoundData) {
    setRounds((prev) => {
      const c = [...prev];
      if (roundIdx < c.length) c[roundIdx] = rd;
      else c.push(rd);
      return c;
    });
  }
  function getRoundsForReport(extra?: RoundData): RoundData[] {
    const c = [...rounds];
    if (extra) {
      if (roundIdx < c.length) c[roundIdx] = extra;
      else c.push(extra);
    }
    return c;
  }
  function goToScoreInput(extraRound?: RoundData) {
    if (extraRound) {
      setPendingFinishRound(extraRound);
      saveRoundData(extraRound);
    } else setPendingFinishRound(null);
    setMatchScore({ yours: "", enemy: "" });
    setScreen("scoreInput");
  }
  async function finishWithScore(yours: string, enemy: string) {
    if (reportLoading || finishLockRef.current) return;
    finishLockRef.current = true;
    const sc: MatchScore = { yours, enemy };
    const all = getRoundsForReport(pendingFinishRound ?? undefined);
    if (pendingFinishRound) setRounds(all);
    setReport(null); // clear stale report
    setReportLoading(true);
    setScreen("report");
    let rep: ReturnType<typeof genMatchReport>;
    try {
      const reportAuthHeaders = await getAuthHeaders();
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: reportAuthHeaders,
        body: JSON.stringify({
          setup,
          rounds: all,
          lang: lang ?? "tr",
          score: sc,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        rep = isValidReport(json)
          ? json
          : genMatchReport(setup, all, lang ?? "tr", sc);
      } else {
        rep = genMatchReport(setup, all, lang ?? "tr", sc);
      }
    } catch {
      rep = genMatchReport(setup, all, lang ?? "tr", sc);
    } finally {
      setReportLoading(false);
      finishLockRef.current = false;
    }
    setReport(rep);
    saveReportToDb(rep, setup, all, sc);
    clearDraft();
  }
  function handleLangToggle() {
    const nl = lang === "tr" ? "en" : "tr";
    setLang(nl);
    saveLang(nl);
  }
  function resetForNewMatch() {
    setSetup({
      map: "",
      agent: "",
      side: "",
      teamComp: [],
      enemyComp: [],
      unknownEnemyComp: false,
    });
    setRounds([]);
    setRoundIdx(0);
    setReport(null);
    setRoundMode("input");
    setCurrentFeedback(null);
    setCurrentResult(null);
    setSurvived(false);
    setSetupStep("mapAgent");
    clearDraft();
    setScreen("setup");
  }
  const SETUP_STEPS: SetupStep[] = ["mapAgent", "sideComp", "confirm"];
  function getStepLabel(step: SetupStep): string {
    return {
      mapAgent: l.stepMapAgent,
      sideComp: l.stepSideComp,
      confirm: l.stepConfirm,
    }[step];
  }
  const navProps = {
    user,
    lang,
    onSignOut: handleSignOut,
    onLogoClick: () => setScreen("landing"),
    onLangToggle: handleLangToggle,
    signOutLabel: l.authSignOut,
    onHome: () => setScreen("landing"),
    homeLabel: l.homePage,
    onDownload: () => {
      setScreen("landing");
      setTimeout(() => document.getElementById("download-section")?.scrollIntoView({ behavior: "smooth" }), 100);
    },
    downloadLabel: l.navDownload,
  };
  /* DASHBOARD */
  if (screen === "dashboard") {
    const dashDisplayName = user?.user_metadata?.first_name || user?.user_metadata?.username || user?.email?.split("@")[0] || "Player";
    return (
      <main className="min-h-screen bg-black">
        <AmbientBg />
        <Navbar {...navProps} />
        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-20 pb-12">

          {/* ═══ HERO ═══ */}
          <div className="relative overflow-hidden rounded-xl border border-[#1e2a3a]/60 bg-gradient-to-br from-[#0a1628] via-[#0d1117] to-[#0a0f16] p-8 mb-8" style={{ minHeight: 200 }}>
            {/* Ambient glow */}
            <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FF4655]/[0.06] blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#4D7CFF]/[0.04] blur-[100px]" />

            {/* Agent splash (right side) — large, animated, majestic */}
            {topAgent && (
              <div className="absolute -right-8 -top-4 -bottom-4 w-1/2 overflow-hidden pointer-events-none">
                <img
                  src={agentImgUrl(topAgent.name)}
                  alt=""
                  className="h-[120%] w-auto object-cover animate-float-slow"
                  style={{
                    opacity: 0.35,
                    filter: `drop-shadow(0 0 40px rgba(255,70,85,0.2)) saturate(1.3)`,
                    maskImage: 'linear-gradient(to left, rgba(0,0,0,0.8) 20%, transparent 80%)',
                    WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.8) 20%, transparent 80%)',
                  }}
                />
                {/* Glow ring behind agent */}
                <div className="absolute top-1/2 right-16 -translate-y-1/2 w-48 h-48 rounded-full bg-[#FF4655]/[0.08] blur-[60px] animate-glow-pulse" />
              </div>
            )}

            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#FF4655]/60 mb-2">AI-POWERED VALORANT COACH</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
                {l.dashTitle}, <span className="bg-gradient-to-r from-[#FF4655] to-[#4D7CFF] bg-clip-text text-transparent">{dashDisplayName}</span>
              </h1>
              <p className="text-sm text-neutral-500 mb-6">{l.dashSub}</p>

              {/* Quick stats row */}
              <div className="flex items-center gap-6 flex-wrap">
                <div>
                  <span className="text-2xl font-black text-white">{savedReports.length}</span>
                  <span className="text-xs text-neutral-500 ml-1.5">{l.dashMatches}</span>
                </div>
                <div className="w-px h-8 bg-white/[0.06]" />
                <div>
                  <span className={`text-2xl font-black ${winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>{savedReports.length > 0 ? `${winRate}%` : '\u2014'}</span>
                  <span className="text-xs text-neutral-500 ml-1.5">Win Rate</span>
                </div>
                <div className="w-px h-8 bg-white/[0.06]" />
                {topAgent && (
                  <div className="flex items-center gap-2">
                    <img src={agentImgUrl(topAgent.name)} alt="" className="w-7 h-7 rounded-lg ring-1 ring-[#FF4655]/30" />
                    <div>
                      <span className="text-sm font-bold text-white">{topAgent.name}</span>
                      <span className="text-[10px] text-neutral-500 block">{lang === "tr" ? "En çok oynanan" : "Most played"}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══ AI INSIGHT ═══ */}
          <div className="rounded-xl border border-[#FF4655]/10 bg-gradient-to-br from-[#0a1628]/90 to-[#0d1117]/95 p-6 mb-6 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#FF4655]/[0.03] to-transparent" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-[#FF4655]" style={{ boxShadow: '0 0 8px rgba(255,70,85,0.5)' }} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#FF4655]">AI INSIGHT</span>
                  <span className="rounded-md bg-[#FF4655]/[0.08] border border-[#FF4655]/15 px-2 py-0.5 text-[9px] font-semibold text-[#FF4655]/70">AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-neutral-600">{savedReports.length} {l.dashMatches.toLowerCase()} {lang === "tr" ? "analizi" : "analyzed"}</span>
                  <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-400">{lang === "tr" ? "ORTA G\u00dcVEN" : "MED CONFIDENCE"}</span>
                </div>
              </div>
              <p className="text-[15px] leading-relaxed text-neutral-200 mb-4">{aiInsight}</p>
              <button className="rounded-lg bg-[#FF4655]/[0.08] border border-[#FF4655]/20 px-4 py-2 text-[11px] font-semibold text-[#FF4655] transition hover:bg-[#FF4655]/15">
                {lang === "tr" ? "Detayl\u0131 Analiz \u2192" : "Detailed Analysis \u2192"}
              </button>
            </div>
          </div>

          {/* ═══ PROBLEM AREAS ═══ */}
          {savedReports.length >= 2 && (problemAreas.deathSpot || problemAreas.worstMap || problemAreas.pattern) && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded-full bg-red-400" style={{ boxShadow: '0 0 6px rgba(239,68,68,0.4)' }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-red-400">{l.problemAreasTitle}</span>
                <div className="flex-1 h-px bg-white/[0.03]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-red-500/10 bg-gradient-to-b from-red-500/[0.04] to-transparent p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-red-400 to-transparent" />
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-red-400/70 mb-2">{l.problemDeathZone}</p>
                  <p className="text-lg font-extrabold text-white">{problemAreas.deathSpot?.name || '\u2014'}</p>
                  <p className="text-[11px] text-neutral-500 mt-1">{problemAreas.deathSpot ? `${problemAreas.deathSpot.count}x ${l.problemDeathDesc}` : l.problemNoData}</p>
                </div>
                <div className="rounded-lg border border-amber-500/10 bg-gradient-to-b from-amber-500/[0.04] to-transparent p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-amber-400/70 mb-2">{l.problemWeakMap}</p>
                  <p className="text-lg font-extrabold text-white">{problemAreas.worstMap?.name || '\u2014'}</p>
                  <p className="text-[11px] text-neutral-500 mt-1">{problemAreas.worstMap ? `${problemAreas.worstMap.wr}% ${l.problemMapDesc}` : l.problemNoData}</p>
                </div>
                <div className="rounded-lg border border-purple-500/10 bg-gradient-to-b from-purple-500/[0.04] to-transparent p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-purple-400 to-transparent" />
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-purple-400/70 mb-2">{l.problemPattern}</p>
                  <p className="text-lg font-extrabold text-white">{problemAreas.pattern?.name || '\u2014'}</p>
                  <p className="text-[11px] text-neutral-500 mt-1">{problemAreas.pattern ? `${problemAreas.pattern.count}x ${l.problemPatternDesc}` : l.problemNoData}</p>
                </div>
              </div>
            </div>
          )}

          {/* ═══ PERFORMANS SKORU ═══ */}
          {webSkillProfile && webSkillProfile.overall > 0 && (
            <div className="rounded-xl border border-[#1e2a3a]/60 bg-gradient-to-br from-[#0a1628]/90 to-[#0d1117]/95 p-6 mb-6 relative overflow-hidden">
              <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#FF4655]/[0.06] blur-[80px]" />
              <div className="relative text-center mb-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#FF4655] mb-4">{lang === "tr" ? "SEV\u0130YE & \u0130LERLEME" : "LEVEL & PROGRESS"}</div>
                <div className="text-5xl font-black text-[#FF4655] mb-1" style={{ textShadow: '0 0 30px rgba(255,70,85,0.3)' }}>
                  {webSkillProfile.overall}
                </div>
                <div className="text-sm font-bold text-white mb-1">{webSkillProfile.rank}</div>
                <div className="text-xs text-neutral-500">{webSkillProfile.explanations?.decisionMaking || ''}</div>
              </div>
              {/* 3 metric bars */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: lang === "tr" ? 'Hayatta Kalma' : 'Survival', value: webSkillProfile.survival, color: '#FF4655' },
                  { label: lang === "tr" ? 'Pozisyonlama' : 'Positioning', value: webSkillProfile.positioning, color: '#4D7CFF' },
                  { label: lang === "tr" ? 'Karar Verme' : 'Decision Making', value: webSkillProfile.decisionMaking, color: '#B44DFF' },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xl font-extrabold mb-1" style={{ color: s.color, textShadow: `0 0 12px ${s.color}30` }}>{s.value}</div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-2">{s.label}</div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: s.color, boxShadow: `0 0 8px ${s.color}50` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ OYUN TARZI ═══ */}
          {webPlaystyle && webPlaystyle.archetype !== "unknown" && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded-full bg-purple-400" style={{ boxShadow: '0 0 6px rgba(167,139,250,0.4)' }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-purple-400">{lang === "tr" ? "OYUN TARZI" : "PLAYSTYLE"}</span>
                <div className="flex-1 h-px bg-white/[0.03]" />
              </div>
              <div className="rounded-xl border border-purple-500/10 bg-gradient-to-br from-purple-500/[0.04] to-[#0d1117]/95 p-6 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-purple-500/[0.03] to-transparent" />
                <div className="relative">
                  <p className="text-lg font-black text-white mb-1">{webPlaystyle.archetypeLabel}</p>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-3">{webPlaystyle.archetypeDescription}</p>
                  {webPlaystyle.mismatch && webPlaystyle.mismatch.detected && (
                    <div className="bg-red-500/[0.08] border border-red-500/20 rounded-lg p-3 mb-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">{lang === "tr" ? "UYARI" : "WARNING"}</p>
                      <p className="text-xs text-red-300/80">{webPlaystyle.mismatch.message}</p>
                    </div>
                  )}
                  <p className="text-xs text-neutral-500 italic">{webPlaystyle.coachMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* ═══ AI ANALİZ ÖZETİ ═══ */}
          {aiSummary && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded-full bg-blue-400" style={{ boxShadow: '0 0 6px rgba(96,165,250,0.4)' }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-400">{l.dashAISummary}</span>
                <div className="flex-1 h-px bg-white/[0.03]" />
              </div>
              <div className="rounded-xl border border-[#1e2a3a]/60 bg-gradient-to-br from-[#0a1628]/90 to-[#0d1117]/95 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-red-400">{l.dashMostMistake}</p>
                    <p className="text-[13px] leading-relaxed text-neutral-300 line-clamp-3">{aiSummary.topMistake || "\u2014"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-400">{l.dashStrength}</p>
                    <p className="text-[13px] leading-relaxed text-neutral-300">{aiSummary.strength || "\u2014"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-400">{l.dashImproveArea}</p>
                    <p className="text-[13px] leading-relaxed text-neutral-300">{aiSummary.improveArea || "\u2014"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ AJAN PERFORMANSI ═══ */}
          {agentPerf.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded-full bg-[#FF4655]" style={{ boxShadow: '0 0 6px rgba(255,70,85,0.4)' }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#FF4655]">{l.dashAgentPerf}</span>
                <div className="flex-1 h-px bg-white/[0.03]" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {agentPerf.map((ap) => (
                  <div key={ap.name} className="rounded-xl border border-[#1e2a3a]/60 bg-gradient-to-b from-[#0a1628]/80 to-[#0d1117]/90 p-4 text-center relative overflow-hidden transition hover:border-[#2d4a6f]/40 hover:shadow-lg hover:shadow-black/20">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF4655]/40 via-[#FF4655]/20 to-transparent" />
                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-black/30 ring-1 ring-white/[0.08] mx-auto mb-2" style={{ filter: 'saturate(1.2)' }}>
                      <img src={agentImgUrl(ap.name)} alt={ap.name} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <p className="text-[11px] font-bold text-white truncate">{ap.name}</p>
                    <p className={`text-xl font-extrabold tabular-nums ${ap.wr >= 50 ? "text-emerald-400" : "text-red-400"}`} style={{ textShadow: ap.wr >= 50 ? '0 0 10px rgba(16,185,129,0.2)' : '0 0 10px rgba(239,68,68,0.2)' }}>{ap.wr}%</p>
                    <p className="text-[9px] text-neutral-600 font-medium">{ap.wins}W {ap.total - ap.wins}L</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ HARİTA PERFORMANSI ═══ */}
          {mapPerf.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded-full bg-blue-400" style={{ boxShadow: '0 0 6px rgba(96,165,250,0.4)' }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-400">{l.dashMapPerf}</span>
                <div className="flex-1 h-px bg-white/[0.03]" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {mapPerf.map((mp) => (
                  <div key={mp.name} className="rounded-xl border border-[#1e2a3a]/60 overflow-hidden transition hover:border-[#2d4a6f]/40 hover:shadow-lg hover:shadow-black/20">
                    <div className="relative h-20">
                      <img src={MAP_IMAGES[mp.name]} alt={mp.name} className="h-full w-full object-cover opacity-60" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/60 to-transparent" />
                      <div className="absolute bottom-2 left-0 right-0 text-center">
                        <p className="text-[11px] font-bold text-white drop-shadow-lg">{mp.name}</p>
                      </div>
                    </div>
                    <div className="p-3 text-center bg-gradient-to-b from-[#0a1628]/90 to-[#0d1117]/95">
                      <p className={`text-xl font-extrabold tabular-nums ${mp.wr >= 50 ? "text-emerald-400" : "text-red-400"}`} style={{ textShadow: mp.wr >= 50 ? '0 0 10px rgba(16,185,129,0.2)' : '0 0 10px rgba(239,68,68,0.2)' }}>{mp.wr}%</p>
                      <p className="text-[9px] text-neutral-600 font-medium">{mp.wins}W {mp.total - mp.wins}L</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ RECENT MATCHES ═══ */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.4)' }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-400">{l.dashRecentTitle}</span>
              <div className="flex-1 h-px bg-white/[0.03]" />
              {savedReports.length > 0 && (
                <button
                  onClick={() => setScreen("history")}
                  className="text-[11px] font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  {l.dashHistory} {IC.arrow}
                </button>
              )}
            </div>
            {historyLoading ? (
              <div className="rounded-xl border border-[#1e2a3a]/60 bg-[#0a1628]/80 p-8 flex justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FF4655] border-t-transparent" />
              </div>
            ) : savedReports.length === 0 ? (
              <div className="rounded-xl border border-[#1e2a3a]/60 bg-gradient-to-br from-[#0a1628]/80 to-[#0d1117]/90 p-10 text-center">
                <AimloLogo size={72} className="mx-auto opacity-10 mb-4" />
                <p className="text-sm font-semibold text-neutral-400">{l.dashNoData}</p>
                <p className="mt-1 text-xs text-neutral-600">{l.dashNoDataDesc}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedReports.slice(0, 5).map((entry) => {
                  const miniInsight = generateMiniMatchInsight(entry);
                  const tag = getMatchTagWeb(entry);
                  return (
                    <button key={entry.id} onClick={() => { setViewingReport(entry); setScreen("reportDetail"); }}
                      className="w-full text-left rounded-lg border border-[#1e2a3a]/60 bg-gradient-to-r from-[#0a1628]/80 to-[#0d1117]/90 p-4 flex items-center gap-4 transition-all duration-200 hover:border-[#2d4a6f]/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 mb-2">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/[0.06]">
                        <img src={MAP_IMAGES[entry.map]} alt="" className="h-full w-full object-cover opacity-80" />
                        <div className={`absolute inset-0 ${entry.won ? 'bg-emerald-500/10' : 'bg-red-500/10'}`} />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <img src={agentImgUrl(entry.agent)} alt="" className="w-8 h-8 rounded-lg ring-1 ring-white/10" style={{ filter: 'saturate(1.2)' }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{entry.map}</span>
                          <span className="text-xs text-neutral-600">&middot;</span>
                          <span className="text-xs text-neutral-500">{entry.agent}</span>
                          {tag && <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-semibold" style={{ color: tag.color }}>{tag.label}</span>}
                        </div>
                        <p className="mt-0.5 text-[11px] text-neutral-600">{entry.date}</p>
                        {miniInsight && <p className="mt-1 text-[10px] text-[#FF4655]/60">{miniInsight}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-extrabold text-white tracking-tight">{entry.score}</p>
                        <p className={`text-[10px] font-bold uppercase ${entry.won ? 'text-emerald-400' : 'text-red-400'}`}>
                          {entry.won ? l.victory : l.defeat}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }
  /* HISTORY */
  if (screen === "history")
    return (
      <main className="min-h-screen bg-black">
        <AmbientBg />
        <Navbar {...navProps} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 pt-20 pb-12">

          {/* ═══ HEADER — Valorant career style ═══ */}
          <div className="mb-8 animate-slide-up">
            <button onClick={() => setScreen("dashboard")} className="text-[12px] text-neutral-600 transition hover:text-white mb-4 flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              {l.back}
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2" style={{ letterSpacing: '-1.5px' }}>
              {lang === "tr" ? "Maç " : "Match "}<span className="bg-gradient-to-r from-[#FF4655] to-[#4D7CFF] bg-clip-text text-transparent">{lang === "tr" ? "Geçmişi" : "History"}</span>
            </h1>
            {/* Stats bar */}
            {filteredReports.length > 0 && (
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white">{filteredReports.length}</span>
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider">{l.dashMatches}</span>
                </div>
                <div className="w-px h-6 bg-white/[0.06]" />
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-black ${filteredWinRate >= 50 ? "text-emerald-400" : "text-[#FF4655]"}`}>{filteredWinRate}%</span>
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider">{l.dashWinRate}</span>
                </div>
                <div className="w-px h-6 bg-white/[0.06]" />
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-emerald-400">{filteredReports.filter(r => r.won).length}</span>
                  <span className="text-[9px] text-neutral-600">W</span>
                  <span className="text-2xl font-black text-[#FF4655]">{filteredReports.filter(r => !r.won).length}</span>
                  <span className="text-[9px] text-neutral-600">L</span>
                </div>
              </div>
            )}
          </div>

          {/* ═══ FILTERS ═══ */}
          {savedReports.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 animate-slide-up stagger-1">
              <select value={historyFilterMap} onChange={(e) => setHistoryFilterMap(e.target.value)} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] text-neutral-300 outline-none transition hover:border-white/[0.15] focus:border-[#FF4655]/30">
                <option value="">{l.historyFilterMap}: {l.historyAll}</option>
                {uniqueMaps.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={historyFilterAgent} onChange={(e) => setHistoryFilterAgent(e.target.value)} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] text-neutral-300 outline-none transition hover:border-white/[0.15] focus:border-[#FF4655]/30">
                <option value="">{l.historyFilterAgent}: {l.historyAll}</option>
                {uniqueAgents.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <select value={historyFilterResult} onChange={(e) => setHistoryFilterResult(e.target.value as "all" | "wins" | "losses")} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] text-neutral-300 outline-none transition hover:border-white/[0.15] focus:border-[#FF4655]/30">
                <option value="all">{l.historyFilterResult}: {l.historyAll}</option>
                <option value="wins">{l.historyWins}</option>
                <option value="losses">{l.historyLosses}</option>
              </select>
            </div>
          )}

          {/* ═══ MATCH LIST — Valorant style ═══ */}
          {savedReports.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-16 text-center animate-slide-up">
              <AimloLogo size={72} className="mx-auto opacity-10 mb-4" />
              <p className="text-sm text-neutral-400">{l.historyEmpty}</p>
              <p className="mt-1 text-xs text-neutral-600">{l.historyEmptyDesc}</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-10 text-center animate-slide-up">
              <p className="text-sm text-neutral-400">{l.dashNoData}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredReports.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="match-card-enter group relative rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Map background */}
                  <div className="absolute inset-0">
                    <img src={MAP_IMAGES[entry.map]} alt="" className="h-full w-full object-cover opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
                  </div>

                  {/* Win/loss indicator bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${entry.won ? "bg-emerald-400" : "bg-[#FF4655]"}`} style={{ boxShadow: entry.won ? "0 0 10px rgba(52,211,153,0.4)" : "0 0 10px rgba(255,70,85,0.4)" }} />

                  <div className="relative flex items-center gap-4 p-4 sm:p-5 pl-5">
                    {/* Agent portrait */}
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/[0.08]">
                      <img src={agentImgUrl(entry.agent)} alt={entry.agent} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" style={{ filter: "saturate(1.2)" }} />
                    </div>

                    {/* Map thumbnail */}
                    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/[0.06] hidden sm:block">
                      <img src={MAP_IMAGES[entry.map]} alt={entry.map} className="h-full w-full object-cover opacity-80" loading="lazy" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1" onClick={() => { setViewingReport(entry); setScreen("reportDetail"); }} style={{ cursor: "pointer" }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{entry.map}</span>
                        <span className="text-[11px] text-neutral-500">{entry.agent}</span>
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${entry.won ? "bg-emerald-500/10 text-emerald-400" : "bg-[#FF4655]/10 text-[#FF4655]"}`}>
                          {entry.won ? l.victory : l.defeat}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-neutral-600">{entry.date} · {entry.side === "attack" ? l.sideAttack : l.sideDefense}</p>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0 mr-2" onClick={() => { setViewingReport(entry); setScreen("reportDetail"); }} style={{ cursor: "pointer" }}>
                      <p className="text-xl font-black text-white tracking-tight">{entry.score}</p>
                    </div>

                    {/* Delete button */}
                    {confirmDeleteId === entry.id ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => deleteReport(entry.id)}
                          disabled={deletingId === entry.id}
                          className="rounded-lg bg-[#FF4655]/10 border border-[#FF4655]/30 px-3 py-1.5 text-[10px] font-bold text-[#FF4655] transition hover:bg-[#FF4655]/20 disabled:opacity-50"
                        >
                          {deletingId === entry.id ? "..." : (lang === "tr" ? "Sil" : "Delete")}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-2.5 py-1.5 text-[10px] text-neutral-500 transition hover:text-white"
                        >
                          {lang === "tr" ? "İptal" : "Cancel"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(entry.id)}
                        className="shrink-0 rounded-lg p-2 text-neutral-700 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-[#FF4655] hover:bg-[#FF4655]/[0.06]"
                        title={lang === "tr" ? "Maçı sil" : "Delete match"}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  /* REPORT DETAIL */
  if (screen === "reportDetail" && viewingReport) {
    const vr = viewingReport;
    // Compute per-match metrics
    const vrDeaths = vr.rounds.filter((r) => !r.skipped && !r.survived).length;
    const vrSurvivedRounds = vr.rounds.filter((r) => !r.skipped && r.survived).length;
    const vrDeathLocs: Record<string, number> = {};
    vr.rounds.filter((r) => !r.skipped && !r.survived && r.deathLocation).forEach((r) => {
      vrDeathLocs[r.deathLocation] = (vrDeathLocs[r.deathLocation] || 0) + 1;
    });
    const vrTopDeathLoc = Object.entries(vrDeathLocs).sort((a, b) => b[1] - a[1])[0];
    return (
      <main className={`${ds.pageBg} relative`}>
        <MapBg map={vr.map} />
        <Navbar {...navProps} />
        <div className="relative z-10 mx-auto max-w-lg px-4 pt-20 pb-12 space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setScreen("history")}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-400 transition hover:text-white"
            >
              {"\u2190"} {l.back}
            </button>
            <h2 className="text-lg font-bold text-white">{l.reportTitle}</h2>
          </div>
          {/* ── Score Header ── */}
          <div className={`${ds.card} overflow-hidden`}>
            <div className="relative p-6">
              <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
                <img src={MAP_IMAGES[vr.map]} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="relative flex items-end justify-between">
                <div>
                  <p className={ds.label}>{l.matchResult}</p>
                  <p className="mt-1 text-4xl font-extrabold tracking-tight text-white">{vr.score}</p>
                  <p className={`mt-1 text-xs font-bold uppercase ${vr.won ? "text-emerald-400" : "text-red-400"}`}>
                    {vr.won ? l.victory : l.defeat}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[11px] text-neutral-500">{vr.map} {IC.dot} {vr.agent}</p>
                  <p className="text-[11px] text-neutral-600">{vr.date}</p>
                  <p className="text-lg font-extrabold text-blue-400">{vr.winPct}%</p>
                </div>
              </div>
              <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${vr.winPct}%` }} />
              </div>
              <div className="relative mt-3 grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wider">
                <div><span className="text-neutral-500">{l.enteredRounds}</span><br /><span className="text-white text-sm">{vr.totalRounds}</span></div>
                <div><span className="text-neutral-500">{l.roundsWon}</span><br /><span className="text-emerald-400 text-sm">{vr.roundsWon}</span></div>
                <div><span className="text-neutral-500">{l.roundsLost}</span><br /><span className="text-red-400 text-sm">{vr.roundsLost}</span></div>
                <div><span className="text-neutral-500">{l.roundsSkipped}</span><br /><span className="text-neutral-400 text-sm">{vr.roundsSkipped}</span></div>
              </div>
            </div>
          </div>
          {/* ── Performance Metrics ── */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-500">{l.reportPerfMetrics}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label={l.reportWinRate} value={`${vr.winPct}%`} color={vr.winPct >= 50 ? "text-emerald-400" : "text-red-400"} />
              <StatCard label={l.reportDeaths} value={String(vrDeaths)} color="text-red-400" />
              <StatCard label={l.reportSurvivedRounds} value={String(vrSurvivedRounds)} color="text-emerald-400" />
              <StatCard label={l.reportTopDeathLoc} value={vrTopDeathLoc ? vrTopDeathLoc[0] : "\u2014"} color="text-amber-400" sub={vrTopDeathLoc ? `${vrTopDeathLoc[1]}x` : undefined} />
            </div>
          </div>
          {/* ── Round-by-Round Timeline ── */}
          {vr.rounds.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-500">{l.reportRoundTimeline}</h3>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {vr.rounds.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const el = document.getElementById(`round-detail-${i}`);
                      el?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase border cursor-pointer transition-all duration-200 hover:scale-105 ${r.result === "win" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15 hover:bg-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/15 hover:bg-red-500/20"} ${r.skipped ? "opacity-40" : ""}`}
                  >
                    R{r.roundNumber} {r.result === "win" ? l.wonLabel : l.lostLabel}{r.skipped ? l.skippedLabel : ""}
                  </button>
                ))}
              </div>
              {/* ── Round Details with AI Feedback ── */}
              <div className="space-y-2 mt-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-500">{l.reportRoundFeedback}</h3>
                {vr.rounds.map((r, i) => (
                  <div
                    key={i}
                    id={`round-detail-${i}`}
                    className={`${ds.card} p-4 border-l-2 ${r.result === "win" ? "border-l-emerald-500/40" : "border-l-red-500/40"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold ${r.result === "win" ? "text-emerald-400" : "text-red-400"}`}>
                        Round {r.roundNumber} {r.result === "win" ? l.wonLabel : l.lostLabel}
                        {r.survived ? ` ${IC.dot} ${l.survivedShort}` : ""}
                      </span>
                      {!r.skipped && r.deathLocation && (
                        <span className="text-[10px] text-neutral-500">{r.deathLocation}</span>
                      )}
                    </div>
                    {r.skipped ? (
                      <p className="text-[11px] text-neutral-600 italic">{l.roundsSkipped}</p>
                    ) : r.feedback ? (
                      <div className="space-y-2">
                        {r.feedback.deathAnalysis && (
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-red-400/70">{l.deathAnalysis}</span>
                            <p className="text-[12px] text-neutral-300 leading-relaxed">{r.feedback.deathAnalysis}</p>
                          </div>
                        )}
                        {r.feedback.enemyPatterns && r.feedback.enemyPatterns.length > 0 && (
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400/70">{l.enemyPatterns}</span>
                            <p className="text-[12px] text-neutral-300 leading-relaxed">{Array.isArray(r.feedback.enemyPatterns) ? r.feedback.enemyPatterns.join(" \u2022 ") : String(r.feedback.enemyPatterns)}</p>
                          </div>
                        )}
                        {r.feedback.nextRoundPlan && (
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400/70">{l.nextRoundPlan}</span>
                            <p className="text-[12px] text-neutral-300 leading-relaxed">{r.feedback.nextRoundPlan}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-neutral-600 italic">{l.noFeedback}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* ── Report Cards ── */}
          <div className="space-y-4">
            <ReportCard icon={IC.diamond} color="text-cyan-400" label={l.overallSummary} text={vr.summary} />
            <ReportCard icon={IC.cross} color="text-red-400" label={l.mainRecurringMistake} text={vr.mistake} />
            <ReportCard icon={IC.circle} color="text-amber-400" label={l.enemyTendencies} text={vr.tendencies} />
            <ReportCard icon={IC.play} color="text-emerald-400" label={l.suggestedAdjustment} text={vr.adjustment} />
            {vr.bestRound && <ReportCard icon={IC.bolt} color="text-blue-400" label={l.bestRound} text={vr.bestRound} />}
            {vr.decisionScore && <ReportCard icon={IC.diamond} color="text-purple-400" label={l.decisionScore} text={vr.decisionScore} />}
          </div>
          <div className="space-y-3">
            <button onClick={resetForNewMatch} className={ds.btnPrimary}>{l.newMatch}</button>
            <button onClick={() => setScreen("dashboard")} className={ds.btnSecondary}>{l.returnToMenu}</button>
          </div>
        </div>
      </main>
    );
  }
  /* SETUP — redirected to dashboard (manual analysis removed from web app) */
  if (screen === "setup") {
    setScreen("dashboard");
  }
  if (false as boolean) { /* setup disabled — use AIMLO Desktop */
    const stepIdx = SETUP_STEPS.indexOf(setupStep);
    function nextStep() {
      const e: FormErrors = {};
      if (setupStep === "mapAgent") {
        if (!setup.map) e.map = l.required;
        if (!setup.agent) e.agent = l.required;
      }
      if (setupStep === "sideComp") {
        if (!setup.side) e.side = l.required;
        if (setup.teamComp.filter(Boolean).length < 5) e.teamComp = l.selectAll;
        if (
          !setup.unknownEnemyComp &&
          setup.enemyComp.filter(Boolean).length < 5
        )
          e.enemyComp = l.selectAll;
      }
      setSetupErrors(e);
      if (Object.keys(e).length > 0) return;
      if (stepIdx < SETUP_STEPS.length - 1) {
        setSetupStep(SETUP_STEPS[stepIdx + 1]);
        setSetupErrors({});
      } else {
        setRounds([]);
        setRoundIdx(0);
        setRoundForm({ deathLocation: "", enemyCount: "", yourNote: "" });
        setRoundErrors({});
        setRoundMode("input");
        setCurrentFeedback(null);
        setCurrentResult(null);
        setSurvived(false);
        setScreen("round");
      }
    }
    function prevStep() {
      if (stepIdx > 0) {
        setSetupStep(SETUP_STEPS[stepIdx - 1]);
        setSetupErrors({});
      } else setScreen("dashboard");
    }
    return (
      <main className={`${ds.pageBg} relative`}>
        {setup.map ? <MapBg map={setup.map} /> : <AmbientBg />}
        <Navbar {...navProps} />
        <div className="relative z-10 mx-auto max-w-2xl px-4 pt-20 pb-12 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{l.setupTitle}</h2>
          </div>
          <div className="flex items-center justify-center gap-1">
            {SETUP_STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (i <= stepIdx) {
                      setSetupStep(s);
                      setSetupErrors({});
                    }
                  }}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${i === stepIdx ? "bg-blue-500/12 text-blue-400 ring-1 ring-blue-500/30" : i < stepIdx ? "bg-white/[0.05] text-neutral-400 cursor-pointer hover:text-white" : "bg-white/[0.02] text-neutral-700"}`}
                >
                  {getStepLabel(s)}
                </button>
                {i < SETUP_STEPS.length - 1 && (
                  <span className="text-neutral-700 text-xs">{IC.mid}</span>
                )}
              </div>
            ))}
          </div>
          <div className={`${ds.card} ${ds.cardInner} space-y-6`}>
            {setupStep === "mapAgent" && (
              <>
                <div>
                  <Label text={l.map} />
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                    {MAPS.map((m) => (
                      <button
                        key={m}
                        onClick={() => updateSetup("map", m)}
                        className={`relative overflow-hidden rounded-xl border py-4 text-sm font-medium transition-all duration-200 ${setup.map === m ? "border-blue-500/50 bg-blue-500/10 text-white ring-1 ring-blue-500/30 shadow-lg shadow-blue-500/5" : "border-white/[0.06] bg-[#070c16] text-neutral-400 hover:border-white/[0.1] hover:text-white"}`}
                      >
                        {setup.map === m && (
                          <div className="pointer-events-none absolute inset-0 opacity-20">
                            <img
                              src={MAP_IMAGES[m]}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <span className="relative">{m}</span>
                      </button>
                    ))}
                  </div>
                  <InlineError msg={setupErrors.map} />
                </div>
                <div className="border-t border-white/[0.06] pt-6">
                  <Label text={l.agent} />
                  {setup.agent && (
                    <div className="mb-4 flex items-center gap-3 rounded-xl bg-blue-500/[0.06] border border-blue-500/15 px-4 py-3">
                      <div className="h-10 w-10 overflow-hidden rounded-xl bg-black/20 ring-1 ring-blue-500/15">
                        <img
                          src={agentImgUrl(setup.agent)}
                          alt={setup.agent}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white">
                          {setup.agent}
                        </span>
                        <p className="text-[10px] text-blue-400">
                          {l.selected}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-5">
                    {Object.entries(AGENT_GROUPS).map(([group, agents]) => (
                      <div key={group}>
                        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-600">
                          {AGENT_GROUP_LABELS[group][lang]}
                        </p>
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                          {agents.map((a) => (
                            <AgentMiniCard
                              key={a}
                              name={a}
                              selected={setup.agent === a}
                              disabled={false}
                              onClick={() =>
                                updateSetup("agent", setup.agent === a ? "" : a)
                              }
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <InlineError msg={setupErrors.agent} />
                </div>
              </>
            )}
            {setupStep === "sideComp" && (
              <>
                <div>
                  <Label text={l.side} />
                  <div className="flex gap-4">
                    {(
                      [
                        [
                          "attack",
                          l.sideAttack,
                          "border-orange-500/25 bg-orange-500/[0.06]",
                        ],
                        [
                          "defense",
                          l.sideDefense,
                          "border-sky-500/25 bg-sky-500/[0.06]",
                        ],
                      ] as const
                    ).map(([val, label, activeStyle]) => (
                      <button
                        key={val}
                        onClick={() => updateSetup("side", val)}
                        className={`flex-1 rounded-xl border py-5 text-sm font-bold transition-all duration-200 ${setup.side === val ? `${activeStyle} text-white ring-1 ring-blue-500/30 shadow-lg` : "border-white/[0.06] bg-[#070c16] text-neutral-400 hover:border-white/[0.1] hover:text-white"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <InlineError msg={setupErrors.side} />
                </div>
                <div className="border-t border-white/[0.06] pt-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">
                      {l.compTitle}
                    </h2>
                    <label className="flex cursor-pointer items-center gap-2 text-[11px] text-neutral-500">
                      <input
                        type="checkbox"
                        checked={setup.unknownEnemyComp}
                        onChange={(e) =>
                          updateSetup("unknownEnemyComp", e.target.checked)
                        }
                        className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 accent-blue-500"
                      />
                      {l.unknownEnemy}
                    </label>
                  </div>
                  <div className="flex gap-4 justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-400">
                          {l.yourTeam}
                        </p>
                        <span className="text-[9px] text-neutral-600">
                          {l.slotsRemaining(5 - setup.teamComp.length)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <CompSlot
                            key={i}
                            agent={setup.teamComp[i] || ""}
                            index={i}
                            locked={
                              i === 0 &&
                              setup.teamComp[0] === setup.agent &&
                              !!setup.agent
                            }
                            onRemove={() => {
                              if (i === 0 && setup.teamComp[0] === setup.agent)
                                return;
                              const c = [...setup.teamComp];
                              c.splice(i, 1);
                              updateSetup("teamComp", c);
                            }}
                          />
                        ))}
                      </div>
                      <InlineError msg={setupErrors.teamComp} />
                    </div>
                    {!setup.unknownEnemyComp && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-400">
                            {l.enemyTeam}
                          </p>
                          <span className="text-[9px] text-neutral-600">
                            {l.slotsRemaining(5 - setup.enemyComp.length)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <CompSlot
                              key={i}
                              agent={setup.enemyComp[i] || ""}
                              index={i}
                              onRemove={() => {
                                const c = [...setup.enemyComp];
                                c.splice(i, 1);
                                updateSetup("enemyComp", c);
                              }}
                            />
                          ))}
                        </div>
                        <InlineError msg={setupErrors.enemyComp} />
                      </div>
                    )}
                  </div>
                  {!setup.unknownEnemyComp && (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setCompTarget("team")}
                        className={`rounded-lg px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${compTarget === "team" ? "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/25" : "bg-white/[0.05] text-neutral-500 hover:text-white"}`}
                      >
                        + {l.yourTeam}
                      </button>
                      <button
                        onClick={() => setCompTarget("enemy")}
                        className={`rounded-lg px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${compTarget === "enemy" ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/25" : "bg-white/[0.05] text-neutral-500 hover:text-white"}`}
                      >
                        + {l.enemyTeam}
                      </button>
                    </div>
                  )}
                  <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-600">
                      {l.agentPool}
                    </p>
                    <div className="space-y-4">
                      {Object.entries(AGENT_GROUPS).map(([group, agents]) => {
                        const target = setup.unknownEnemyComp
                          ? "team"
                          : compTarget;
                        const currentArr =
                          target === "team" ? setup.teamComp : setup.enemyComp;
                        return (
                          <div key={group}>
                            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-neutral-700">
                              {AGENT_GROUP_LABELS[group][lang]}
                            </p>
                            <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8">
                              {agents.map((a) => {
                                const isIn = currentArr.includes(a);
                                const isLocked =
                                  target === "team" &&
                                  a === setup.agent &&
                                  setup.teamComp[0] === a;
                                return (
                                  <AgentMiniCard
                                    key={a}
                                    name={a}
                                    selected={isIn}
                                    disabled={isIn && !isLocked}
                                    locked={isLocked}
                                    onClick={() => {
                                      if (isLocked) return;
                                      handleCompSelect(
                                        target === "team"
                                          ? "teamComp"
                                          : "enemyComp",
                                        a,
                                      );
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
            {setupStep === "confirm" && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-white">
                    {l.confirmTitle}
                  </h3>
                  <p className="text-sm text-neutral-500">{l.confirmDesc}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`${ds.card} p-4 text-center`}>
                    <p className={ds.label}>{l.map}</p>
                    <div className="relative h-20 w-full overflow-hidden rounded-xl bg-black/20 mb-2 ring-1 ring-white/[0.06]">
                      <img
                        src={MAP_IMAGES[setup.map]}
                        alt={setup.map}
                        className="h-full w-full object-cover opacity-65"
                      />
                    </div>
                    <p className="text-sm font-bold text-white">{setup.map}</p>
                  </div>
                  <div className={`${ds.card} p-4 text-center`}>
                    <p className={ds.label}>{l.agent}</p>
                    <div className="mx-auto h-14 w-14 overflow-hidden rounded-xl bg-black/20 mb-2 ring-1 ring-white/[0.06]">
                      <img
                        src={agentImgUrl(setup.agent)}
                        alt={setup.agent}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-sm font-bold text-white">
                      {setup.agent}
                    </p>
                  </div>
                </div>
                <div
                  className={`${ds.card} p-4 flex items-center justify-between`}
                >
                  <span className={ds.label + " mb-0"}>{l.side}</span>
                  <span className="text-sm font-bold text-white">
                    {setup.side === "attack" ? l.sideAttack : l.sideDefense}
                  </span>
                </div>
                <div className={`${ds.card} p-4`}>
                  <p className={ds.label}>{l.yourTeam}</p>
                  <div className="flex gap-2 mt-2">
                    {setup.teamComp.map(
                      (a, i) =>
                        a && (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-2 py-1"
                          >
                            <div className="h-5 w-5 rounded overflow-hidden">
                              <img
                                src={agentImgUrl(a)}
                                alt={a}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <span className="text-[11px] text-neutral-300">
                              {a}
                            </span>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-3 pt-2">
              <button onClick={nextStep} className={ds.btnPrimary}>
                {setupStep === "confirm" ? l.startMatch : l.next}
              </button>
              <button onClick={prevStep} className={ds.btnSecondary}>
                {l.back}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }
  /* ROUND — redirected to dashboard (manual analysis removed from web app) */
  if (screen === "round") {
    setScreen("dashboard");
  }
  if (false as boolean) { /* round disabled — use AIMLO Desktop */
    function validateRound(): FormErrors {
      const e: FormErrors = {};
      if (!survived) {
        if (!roundForm.deathLocation) e.deathLocation = l.required;
        if (!roundForm.enemyCount) e.enemyCount = l.required;
      }
      if (!roundForm.yourNote.trim()) e.yourNote = l.required;
      else if (roundForm.yourNote.trim().length < 3)
        e.yourNote = l.noteTooShort;
      return e;
    }
    async function handleSubmitRound(result: RoundResult) {
      const e = validateRound();
      setRoundErrors(e);
      if (Object.keys(e).length > 0) return;
      if (isSubmitting || submitLockRef.current) return;
      submitLockRef.current = true;
      setIsSubmitting(true);
      setFeedbackLoading(true);
      const prev = rounds.slice(0, roundIdx);
      const fallbackFb = () =>
        genRoundFeedback(
          setup,
          roundForm,
          result,
          prev,
          lang ?? "tr",
          survived,
        );
      let fb: RoundFeedback;
      try {
        const authHeaders = await getAuthHeaders();
        const res = await fetch("/api/ai/feedback", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            setup,
            form: roundForm,
            result,
            allRounds: prev,
            lang: lang ?? "tr",
            survived,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          fb = isValidFeedback(json) ? json : fallbackFb();
        } else {
          fb = fallbackFb();
        }
      } catch {
        fb = fallbackFb();
      } finally {
        setFeedbackLoading(false);
        setIsSubmitting(false);
        submitLockRef.current = false;
      }
      const rd: RoundData = {
        roundNumber: roundNum,
        deathLocation: survived ? "" : roundForm.deathLocation,
        enemyCount: survived ? "" : roundForm.enemyCount,
        yourNote: roundForm.yourNote,
        result,
        skipped: false,
        survived,
        feedback: fb,
      };
      saveRoundData(rd);
      setCurrentFeedback(fb);
      setCurrentResult(result);
      setRoundMode("feedback");
    }
    function handleSkipConfirm(result: RoundResult) {
      const rd: RoundData = {
        roundNumber: roundNum,
        deathLocation: "",
        enemyCount: "",
        yourNote: "",
        result,
        skipped: true,
        survived: false,
        feedback: null,
      };
      saveRoundData(rd);
      loadRoundAtIndex(roundIdx + 1);
    }
    function handleNextRound() {
      loadRoundAtIndex(roundIdx + 1);
    }
    function handleBack() {
      if (roundIdx > 0) loadRoundAtIndex(roundIdx - 1);
      else {
        setScreen("setup");
        setSetupStep("confirm");
      }
    }
    function handleFinishFromFeedback() {
      goToScoreInput();
    }
    function handleFinishFromInput() {
      const e = validateRound();
      if (Object.keys(e).length === 0) {
        const prev = rounds.slice(0, roundIdx);
        const fb = genRoundFeedback(
          setup,
          roundForm,
          "loss",
          prev,
          lang ?? "tr",
          survived,
        );
        const rd: RoundData = {
          roundNumber: roundNum,
          deathLocation: survived ? "" : roundForm.deathLocation,
          enemyCount: survived ? "" : roundForm.enemyCount,
          yourNote: roundForm.yourNote,
          result: "loss",
          skipped: false,
          survived,
          feedback: fb,
        };
        goToScoreInput(rd);
      } else goToScoreInput();
    }
    return (
      <main className={`${ds.pageBg} relative`}>
        <MapBg map={setup.map} />
        <Navbar {...navProps} />
        <div className="relative z-10 mx-auto max-w-lg px-4 pt-20 pb-12 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-white">
              {l.roundTitle(roundNum)}
            </h2>
            <p className="text-sm text-neutral-500">
              {setup.map} {IC.dot} {setup.agent} {IC.dot}{" "}
              {setup.side === "attack" ? l.sideAttack : l.sideDefense}
            </p>
          </div>
          {(rounds.length > 0 || roundIdx > 0) && (
            <div className="flex flex-wrap gap-1.5 justify-center">
              {rounds.map((r, i) => (
                <button
                  key={i}
                  onClick={() => loadRoundAtIndex(i)}
                  className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition border ${i === roundIdx ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-[#050810]" : ""} ${r.result === "win" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-red-500/10 text-red-400 border-red-500/10"} ${r.skipped ? "opacity-40" : ""}`}
                >
                  R{r.roundNumber}{" "}
                  {r.result === "win" ? l.wonLabel : l.lostLabel}
                  {r.skipped ? l.skippedLabel : ""}
                </button>
              ))}
              {roundIdx >= rounds.length && (
                <span className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 ring-2 ring-blue-500 ring-offset-1 ring-offset-[#050810]">
                  R{roundNum}
                </span>
              )}
            </div>
          )}
          {roundMode === "input" && (
            <div className={`${ds.card} ${ds.cardInner} space-y-5`}>
              <button
                onClick={() => {
                  setSurvived(!survived);
                  if (!survived)
                    setRoundForm((f) => ({
                      ...f,
                      deathLocation: "",
                      enemyCount: "",
                    }));
                }}
                className={`w-full rounded-xl border-2 py-4 text-base font-extrabold uppercase tracking-wider transition-all duration-200 ${survived ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/15" : "border-white/[0.08] bg-[#070c16] text-neutral-500 hover:border-emerald-500/25 hover:text-emerald-400 hover:bg-emerald-500/[0.04]"}`}
              >
                {survived ? IC.check + " " : ""}
                {l.survived}
              </button>
              {!survived && (
                <>
                  <div>
                    <Label text={l.deathLocation} />
                    <select
                      value={roundForm.deathLocation}
                      onChange={(e) =>
                        updateRound("deathLocation", e.target.value)
                      }
                      className={ds.selectBase}
                    >
                      <option value="" disabled className="bg-[#050810]">
                        {l.deathLocationPh}
                      </option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc} className="bg-[#050810]">
                          {loc}
                        </option>
                      ))}
                    </select>
                    <InlineError msg={roundErrors.deathLocation} />
                  </div>
                  <div>
                    <Label text={l.enemyCount} />
                    <select
                      value={roundForm.enemyCount}
                      onChange={(e) =>
                        updateRound("enemyCount", e.target.value)
                      }
                      className={ds.selectBase}
                    >
                      <option value="" disabled className="bg-[#050810]">
                        {l.enemyCountPh}
                      </option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option
                          key={n}
                          value={String(n)}
                          className="bg-[#050810]"
                        >
                          {n}
                        </option>
                      ))}
                    </select>
                    <InlineError msg={roundErrors.enemyCount} />
                  </div>
                </>
              )}
              <div>
                <Label text={l.yourNote} />
                <textarea
                  value={roundForm.yourNote}
                  onChange={(e) => updateRound("yourNote", e.target.value)}
                  placeholder={
                    survived
                      ? lang === "tr"
                        ? "ör. lurk oynadım, info verdim\u2026"
                        : "e.g. lurked, gave info\u2026"
                      : l.yourNotePh
                  }
                  rows={3}
                  className={ds.inputBase + " resize-none"}
                />
                <InlineError msg={roundErrors.yourNote} />
              </div>
              <div>
                <Label text={l.roundResult} />
                {feedbackLoading ? (
                  <div className="flex items-center justify-center gap-3 py-6">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="text-sm text-neutral-400">
                      {lang === "tr"
                        ? "AI analiz ediyor..."
                        : "AI analyzing..."}
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSubmitRound("win")}
                      disabled={isSubmitting}
                      className="flex-1 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] py-3.5 text-sm font-bold text-emerald-400 transition-all hover:bg-emerald-500/[0.1] active:scale-[0.98] disabled:opacity-40"
                    >
                      {l.roundResultWin}
                    </button>
                    <button
                      onClick={() => handleSubmitRound("loss")}
                      disabled={isSubmitting}
                      className="flex-1 rounded-xl border border-red-500/20 bg-red-500/[0.06] py-3.5 text-sm font-bold text-red-400 transition-all hover:bg-red-500/[0.1] active:scale-[0.98] disabled:opacity-40"
                    >
                      {l.roundResultLoss}
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setRoundMode("skipConfirm")}
                  className={ds.btnSecondary}
                >
                  {l.skipRound}
                </button>
                <div className="flex gap-3">
                  <button onClick={handleBack} className={ds.btnSecondary}>
                    {l.back}
                  </button>
                  <button
                    onClick={handleFinishFromInput}
                    className={ds.btnAccent}
                  >
                    {l.finishMatch}
                  </button>
                </div>
              </div>
            </div>
          )}
          {roundMode === "skipConfirm" && (
            <div className={`${ds.card} p-6 sm:p-8 space-y-5 text-center`}>
              <p className="text-sm font-bold text-white">
                {l.skipConfirmTitle}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSkipConfirm("win")}
                  className="flex-1 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] py-3.5 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/[0.1]"
                >
                  {l.yes}
                </button>
                <button
                  onClick={() => handleSkipConfirm("loss")}
                  className="flex-1 rounded-xl border border-red-500/20 bg-red-500/[0.06] py-3.5 text-sm font-bold text-red-400 transition hover:bg-red-500/[0.1]"
                >
                  {l.no}
                </button>
              </div>
              <button
                onClick={() => setRoundMode("input")}
                className={ds.btnSecondary}
              >
                {l.back}
              </button>
            </div>
          )}
          {roundMode === "feedback" && currentFeedback && (
            <div className="space-y-5">
              <div className={`${ds.card} ${ds.cardInner}`}>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-blue-400">
                    {l.feedbackTitle}
                  </h2>
                  <div className="flex items-center gap-2">
                    {survived && (
                      <span className="rounded-md bg-emerald-500/10 border border-emerald-400/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                        {l.survivedShort}
                      </span>
                    )}
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase border ${currentResult === "win" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-red-500/10 text-red-400 border-red-500/10"}`}
                    >
                      {currentResult === "win"
                        ? l.roundResultWin
                        : l.roundResultLoss}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <FeedbackCard
                    icon={IC.cross}
                    color="text-red-400"
                    label={l.deathAnalysis}
                    text={currentFeedback.deathAnalysis}
                  />
                  <FeedbackCard
                    icon={IC.circle}
                    color="text-amber-400"
                    label={l.enemyPatterns}
                    text={Array.isArray(currentFeedback.enemyPatterns) ? currentFeedback.enemyPatterns.join(" \u2022 ") : String(currentFeedback.enemyPatterns)}
                  />
                  <FeedbackCard
                    icon={IC.bolt}
                    color="text-cyan-400"
                    label={l.nextRoundPlan}
                    text={currentFeedback.nextRoundPlan}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={handleNextRound} className={ds.btnPrimary}>
                  {l.nextRound}
                </button>
                <div className="flex gap-3">
                  <button onClick={handleBack} className={ds.btnSecondary}>
                    {l.back}
                  </button>
                  <button
                    onClick={handleFinishFromFeedback}
                    className={ds.btnAccent}
                  >
                    {l.finishMatch}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }
  /* SCORE INPUT — redirected to dashboard (manual analysis removed from web app) */
  if (screen === "scoreInput") {
    setScreen("dashboard");
  }
  if (false as boolean) /* scoreInput disabled — use AIMLO Desktop */
    return (
      <main
        className={`${ds.pageBg} relative flex items-center justify-center px-4`}
      >
        <MapBg map={setup.map} />
        <div className="relative z-10 w-full max-w-md space-y-8">
          <div className="text-center space-y-1">
            <AimloLogo size={56} className="mx-auto opacity-40 mb-2" />
            <h2 className="text-xl font-bold text-white">{l.scoreTitle}</h2>
          </div>
          <div className={`${ds.card} ${ds.cardInner} space-y-5`}>
            <Label text={l.selectScore} />
            <div className="grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto pr-1">
              {SCORE_OPTIONS.map((s) => {
                const [y, e] = s.split(" - ");
                const isWin = Number(y) > Number(e);
                const sel = matchScore.yours === y && matchScore.enemy === e;
                return (
                  <button
                    key={s}
                    onClick={() => setMatchScore({ yours: y, enemy: e })}
                    className={`rounded-xl border py-3 text-sm font-bold transition-all duration-200 ${sel ? "border-blue-500/50 bg-blue-500/10 text-white ring-1 ring-blue-500/30 shadow-lg" : isWin ? "border-emerald-500/10 bg-emerald-500/[0.04] text-emerald-400 hover:bg-emerald-500/[0.07]" : "border-red-500/10 bg-red-500/[0.04] text-red-400 hover:bg-red-500/[0.07]"}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  if (matchScore.yours && matchScore.enemy)
                    finishWithScore(matchScore.yours, matchScore.enemy);
                }}
                disabled={
                  !matchScore.yours || !matchScore.enemy || reportLoading
                }
                className={ds.btnPrimary}
              >
                {reportLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {lang === "tr" ? "Oluşturuluyor..." : "Generating..."}
                  </span>
                ) : (
                  l.confirmScore
                )}
              </button>
              <button
                onClick={() => setScreen("round")}
                className={ds.btnSecondary}
              >
                {l.back}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  /* REPORT */
  if (screen === "report" && (reportLoading || !report))
    return (
      <main className={`${ds.pageBg} relative`}>
        <MapBg map={setup.map} />
        <Navbar {...navProps} />
        <div className="relative z-10 mx-auto max-w-lg px-4 pt-40 flex flex-col items-center gap-5">
          <AimloLogo size={72} className="animate-pulse" />
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm text-neutral-400">
            {lang === "tr"
              ? "AI rapor oluşturuyor..."
              : "AI generating report..."}
          </p>
        </div>
      </main>
    );
  if (screen === "report" && report)
    return (
      <main className={`${ds.pageBg} relative`}>
        <MapBg map={setup.map} />
        <Navbar {...navProps} />
        <div className="relative z-10 mx-auto max-w-lg px-4 pt-20 pb-12 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-white">{l.reportTitle}</h2>
            <p className="text-sm text-neutral-500">
              {setup.map} {IC.dot} {setup.agent}
            </p>
          </div>
          <div className={`${ds.card} overflow-hidden`}>
            <div className="relative p-6">
              <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
                <img
                  src={MAP_IMAGES[setup.map]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="relative flex items-end justify-between">
                <div>
                  <p className={ds.label}>{l.matchResult}</p>
                  <p className="mt-1 text-4xl font-extrabold tracking-tight text-white">
                    {report.scoreStr}
                  </p>
                  <p
                    className={`mt-1.5 text-xs font-bold uppercase ${report.matchWon ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {report.matchWon ? l.victory : l.defeat}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-blue-400">
                    {report.winPct}%
                  </p>
                </div>
              </div>
              <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${report.winPct}%` }}
                />
              </div>
              <div className="relative mt-3 grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wider">
                <div>
                  <span className="text-neutral-500">{l.enteredRounds}</span>
                  <br />
                  <span className="text-white text-sm">{report.total}</span>
                </div>
                <div>
                  <span className="text-neutral-500">{l.roundsWon}</span>
                  <br />
                  <span className="text-emerald-400 text-sm">{report.won}</span>
                </div>
                <div>
                  <span className="text-neutral-500">{l.roundsLost}</span>
                  <br />
                  <span className="text-red-400 text-sm">{report.lost}</span>
                </div>
                <div>
                  <span className="text-neutral-500">{l.roundsSkipped}</span>
                  <br />
                  <span className="text-neutral-400 text-sm">
                    {report.skipped}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {rounds.map((r, i) => (
              <span
                key={i}
                className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase border ${r.result === "win" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-red-500/10 text-red-400 border-red-500/10"} ${r.skipped ? "opacity-40" : ""}`}
              >
                R{r.roundNumber} {r.result === "win" ? l.wonLabel : l.lostLabel}
                {r.skipped ? l.skippedLabel : ""}
              </span>
            ))}
          </div>
          <div className="space-y-4">
            <ReportCard
              icon={IC.diamond}
              color="text-cyan-400"
              label={l.overallSummary}
              text={report.summary}
            />
            <ReportCard
              icon={IC.cross}
              color="text-red-400"
              label={l.mainRecurringMistake}
              text={report.mistake}
            />
            <ReportCard
              icon={IC.circle}
              color="text-amber-400"
              label={l.enemyTendencies}
              text={report.tendencies}
            />
            <ReportCard
              icon={IC.play}
              color="text-emerald-400"
              label={l.suggestedAdjustment}
              text={report.adjustment}
            />
            {report.bestRound && (
              <ReportCard
                icon={IC.bolt}
                color="text-blue-400"
                label={l.bestRound}
                text={report.bestRound}
              />
            )}
            {report.decisionScore && (
              <ReportCard
                icon={IC.diamond}
                color="text-purple-400"
                label={l.decisionScore}
                text={report.decisionScore}
              />
            )}
          </div>
          <div className="space-y-3">
            <button onClick={resetForNewMatch} className={ds.btnPrimary}>
              {l.newMatch}
            </button>
            <button
              onClick={() => {
                setScreen("dashboard");
                loadHistory();
              }}
              className={ds.btnSecondary}
            >
              {l.returnToMenu}
            </button>
          </div>
        </div>
      </main>
    );
  // Fallback — should never reach here, redirect to landing
  return (
    <main className={`${ds.pageBg} flex items-center justify-center`}>
      <div className="text-center space-y-4">
        <p className="text-neutral-500 text-sm">
          {lang === "tr" ? "Sayfa bulunamadı" : "Page not found"}
        </p>
        <button
          onClick={() => setScreen("landing")}
          className={ds.btnPrimary + " max-w-xs mx-auto"}
        >
          {lang === "tr" ? "Ana Sayfaya Dön" : "Go to Home"}
        </button>
      </div>
    </main>
  );
}
