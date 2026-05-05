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
      // Redacted: error.details from Supabase can include the conflicting
      // value (email/username), so we only log the code + a generic class.
      const errClass = (error.code || "unknown").toString();
      console.error(`[Aimlo] Profile upsert attempt ${attempt + 1} class=${errClass}`);
      if (attempt === 1) return { ok: false, error: error.message };
    } catch (err) {
      // Don't log the full error object — may include Supabase response with PII.
      const cls = err instanceof Error ? err.name : "unknown";
      console.error(`[Aimlo] Profile upsert exception attempt ${attempt + 1} class=${cls}`);
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
const AIMLO_LOGO_SRC = "/aimlo-logo.png?v=3";
function AimloLogo({ size = 48, className = "", interactive = false }: { size?: number; className?: string; interactive?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2, maxT = 12;
    setTilt({ x: Math.max(-maxT, Math.min(maxT, ((e.clientY - cy) / (rect.height / 2)) * -maxT)), y: Math.max(-maxT, Math.min(maxT, ((e.clientX - cx) / (rect.width / 2)) * maxT)) });
  }, [interactive]);
  const handleMouseLeave = useCallback(() => { setTilt({ x: 0, y: 0 }); setIsHovered(false); }, []);
  if (!interactive) return <img src={AIMLO_LOGO_SRC} alt="Aimlo" style={{ height: size, width: "auto", maxWidth: `min(88vw, ${Math.round(size * 3)}px)` }} className={`object-contain object-left shrink-0 ${className}`} draggable={false} />;
  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} onMouseEnter={() => setIsHovered(true)} onMouseLeave={handleMouseLeave} className={`relative inline-flex items-center justify-center ${className}`} style={{ perspective: "600px" }}>
      <div className="pointer-events-none absolute inset-0 transition-opacity duration-500" style={{ opacity: isHovered ? 1 : 0, background: "radial-gradient(ellipse at center, rgba(255,70,85,0.15), rgba(77,124,255,0.08), transparent 70%)", filter: "blur(20px)", transform: "scale(1.5)" }} />
      <img src={AIMLO_LOGO_SRC} alt="Aimlo" style={{ height: size, width: "auto", maxWidth: `min(88vw, ${Math.round(size * 3)}px)`, transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.08 : 1})`, transition: isHovered ? "transform 0.15s ease-out, filter 0.4s ease" : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease", filter: isHovered ? "drop-shadow(0 0 12px rgba(255,70,85,0.35)) drop-shadow(0 0 30px rgba(77,124,255,0.15))" : "drop-shadow(0 0 6px rgba(255,70,85,0.1))", willChange: "transform, filter" }} className="object-contain shrink-0 relative z-10" draggable={false} />
    </div>
  );
}
function HeroEye({ size = 180 }: { size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const maxT = 22, maxP = 10;
    setTilt({ x: Math.max(-maxT, Math.min(maxT, ((e.clientY - cy) / (rect.height / 2)) * -maxT)), y: Math.max(-maxT, Math.min(maxT, ((e.clientX - cx) / (rect.width / 2)) * maxT)) });
    setPupil({ x: Math.max(-maxP, Math.min(maxP, ((e.clientX - cx) / (rect.width / 2)) * maxP)), y: Math.max(-maxP, Math.min(maxP, ((e.clientY - cy) / (rect.height / 2)) * maxP)) });
  }, []);
  const handleMouseLeave = useCallback(() => { setTilt({ x: 0, y: 0 }); setPupil({ x: 0, y: 0 }); setIsHovered(false); }, []);
  const pupilSize = size * 0.30;
  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseEnter={() => setIsHovered(true)} onMouseLeave={handleMouseLeave} className="relative inline-flex items-center justify-center cursor-pointer" style={{ perspective: "600px", width: size * 2.5, height: size * 1.6, padding: `${size * 0.3}px ${size * 0.65}px` }}>
      <div className="pointer-events-none absolute inset-0 transition-opacity duration-500" style={{ opacity: isHovered ? 1 : 0.3, background: "radial-gradient(ellipse at center, rgba(0,212,255,0.15), rgba(168,85,247,0.1), rgba(255,70,144,0.08), transparent 70%)", filter: "blur(30px)", transform: "scale(1.6)" }} />
      {/* Outer eye - tilts */}
      <img
        src="/aimlo-eye-outer.png"
        alt="AIMLO Eye"
        style={{
          height: size,
          width: "auto",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.12 : 1})`,
          transition: isHovered ? "transform 0.12s ease-out, filter 0.4s ease" : "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease",
          filter: isHovered
            ? "drop-shadow(0 0 20px rgba(0,212,255,0.5)) drop-shadow(0 0 50px rgba(168,85,247,0.25))"
            : "drop-shadow(0 0 10px rgba(0,212,255,0.2)) drop-shadow(0 0 25px rgba(168,85,247,0.1))",
          willChange: "transform, filter",
        }}
        className="relative z-10 object-contain"
        draggable={false}
      />
      {/* Pupil - follows mouse */}
      <img
        src="/aimlo-pupil.png"
        alt=""
        style={{
          position: "absolute",
          width: pupilSize,
          height: pupilSize,
          left: `calc(50% - ${pupilSize / 2 + 3}px + ${pupil.x}px)`,
          top: `calc(50% - ${pupilSize / 2}px + ${pupil.y}px)`,
          transform: `scale(${isHovered ? 1.1 : 1})`,
          transition: isHovered ? "left 0.1s ease-out, top 0.1s ease-out, transform 0.2s ease, filter 0.4s ease" : "left 0.5s cubic-bezier(0.16, 1, 0.3, 1), top 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s ease, filter 0.5s ease",
          filter: isHovered
            ? "drop-shadow(0 0 10px rgba(168,85,247,0.4))"
            : "none",
          willChange: "left, top, transform",
        }}
        className="z-20 object-contain pointer-events-none"
        draggable={false}
      />
    </div>
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
      "Uygulamayı aç, Valorant oyna. AI her şeyi otomatik izler, maç sonunda kişisel analiz ve gelişim raporu sunar. Sen sadece oyna.",
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
      "Kendi temponuzda ilerleyin. Her maçınızı analiz edin, hatalarınızı tespit edin ve AI destekli önerilerle rank atlayın. Sadece 10$ ile başlayın, gelişiminizi takip edin.",
    landingFaqTitle: "Sıkça Sorulan Sorular",
    landingBlogTitle: "Blog & İçgörüler",
    landingBlogText:
      "AI destekli Valorant analizleri, rank geçiş rehberleri, meta içgörüleri ve topluluktan en iyi pratikler.",
    landingBlogReadMore: "Devamını Oku",
    landingBlogAll: "Tüm Yazılar",
    landingBlogPosts: [
      {
        category: "Rank Rehberi",
        title: "Gold'dan Diamond'a: En Sık Yapılan 5 Pozisyonlama Hatası",
        excerpt: "AIMLO'nun 10.000+ maç analizine göre Gold-Diamond geçişinde oyuncuların %78'inin yaptığı kritik pozisyonlama hataları ve çözümleri.",
        readTime: "5 dk",
        date: "3 saat önce",
        color: "#FF4655",
        content: `Gold ve Diamond arasındaki fark sadece aim değildir. AIMLO'nun 10.000'den fazla maç analizine göre bu geçişte en çok kaybedilen round'ların %78'i pozisyonlama hatalarından kaynaklanıyor. İşte en kritik 5 hata ve çözümleri:

## 1. Aynı Noktadan İkinci Peek

Oyuncuların %42'si bir round'da aynı açıdan iki kez peek atıyor. Bu, AI'ın tespit ettiği en yaygın hata. Rakip ilk peek'te seni görmediyse bile, sesini duydu ve crosshair'ini oraya sabitledi. İkinci peek = kesin ölüm.

**Çözüm:** Her peek sonrası 2-3 metre yer değiştir. Farklı yükseklikten (headglitch, crouch) peek at. Sma köşeyi kullan, swing yap.

## 2. Kötü Off-angle Kullanımı

Diamond+ oyuncular standart pozisyonlara girmek yerine beklenmeyen açılar kullanır. Gold oyuncularının %63'ü hâlâ default "köşede otur" mantığıyla oynuyor.

**Çözüm:** Her haritada 3 off-angle öğren. Ascent A Site'ta Generator üstü, Bind'da Hookah back veya Ascent Heaven gibi. Her round farklı bir off-angle kullan.

## 3. Trade Mesafesi Hatası

Entry fragger'dan 5+ metre uzakta duruyorsan trade edemezsin. 1 metreden yakınsan utility ile ikiniz birden ölürsünüz. İdeal: 2-3 saniye içinde destek verebileceğin mesafe.

**Çözüm:** Entry'den sonra hemen arkasından değil, yandan destek ver. Farklı açıdan bakabilen pozisyona geç. Entry öldüğünde 2 saniye içinde trade kill alman lazım.

## 4. Crosshair Placement Zayıflığı

AIMLO verilerine göre Gold oyuncuları ortalama %38 daha fazla aim düzeltmesi yapıyor çünkü crosshair'leri yanlış yerde. Yere bakmak, duvara bakmak, havaya bakmak = kaybedilen round.

**Çözüm:** Crosshair her zaman **baş hizasında** ve **rakip olabilecek köşelerde** olmalı. Yürürken bile aim place yap. Bu alışkanlığı custom game'de 15 dakika çalış.

## 5. Sound Cue'ları Görmezden Gelme

Adım, reload, ability sesleri en değerli info kaynağı. Düşük rank oyuncular genellikle müzik dinleyerek oynuyor veya ses seviyesini düşürüyor. Bu %40'a kadar info kaybı demek.

**Çözüm:** İyi headphone kullan. Müziği kapat. Her round başında dinle, callout yap. Sound cue'ları pozisyonlamanın parçası yap.

## Sonuç

Bu 5 hatayı düzelten AIMLO kullanıcılarının ortalama **2-3 ay içinde Diamond'a çıkma oranı %61 arttı**. Pozisyonlama, aim'den daha önemlidir. AI ile her round'unu analiz edersen hangi hataları tekrarladığını görebilir ve hızlıca düzeltebilirsin.`,
      },
      {
        category: "Meta Analizi",
        title: "2026 Meta: Duelist Havuzundaki Değişimler",
        excerpt: "Jett'in gerilemesinden Waylay'in yükselişine. Bu patch'te hangi duelist'ler öne çıkıyor? AI verilerine dayalı detaylı analiz.",
        readTime: "7 dk",
        date: "12 saat önce",
        color: "#4D7CFF",
        content: `2026 yılının ilk patch'iyle birlikte Valorant duelist havuzu önemli değişimler geçirdi. AIMLO'nun topluluktaki 15.000+ ranked maç verisiyle bu değişimleri inceledik. İşte öne çıkan bulgular:

## Jett'in Gerilemesi

Jett, 3 yıl boyunca Valorant'ın kral duelist'iydi. Ancak AIMLO verilerine göre pick rate'i son 6 ayda **%47'den %28'e** düştü. Win rate'i de %52'den %49'a geriledi.

**Neden?** Dash nerfleri, Cloudburst cooldown değişiklikleri ve haritalara uyum sağlayamama. Özellikle Lotus ve Sunset gibi yeni haritalarda Jett'in mobilitesi yeterince etkili olmuyor.

## Waylay'in Yükselişi

Yeni duelist Waylay, eklenmesinin ardından pick rate'te **%23'e** fırladı. Radiant seviyesinde Waylay win rate'i **%54**, bu tüm duelist'ler arasında en yüksek.

**Neden güçlü?** Light Speed ability'si ile agresif peek'lerden sonra geri çekilme imkanı veriyor. Ultimate'i Fracture ve Bind gibi kapalı haritalarda oyunu tersine çevirebiliyor.

## Raze: Stabil Performans

Raze, pick rate'te küçük düşüşle (%31 → %28) birlikte hâlâ güçlü. Win rate'i **%51.5** ile stabil. Özellikle Icebox ve Split gibi dar koridorlu haritalarda satchel combat mobility sağlıyor.

## Iso: Gizli Şampiyon

Iso hâlâ düşük pick rate'te (%8) ama AIMLO verilerine göre Diamond+ maçlarda **%56 win rate** ile en verimli duelist. Shield ability'si ile 1v1'lerde neredeyse garantili kazanç sağlıyor.

## Neon: Düşüş Yolunda

Neon'un pick rate'i %19'dan %11'e düştü. Nerfler Run It Down mekaniğini yavaşlattı. Ancak Lotus'ta hâlâ Tier S.

## Tahminler

2026'nın ikinci yarısında:
- **Waylay** meta lider kalacak
- **Jett** sadece 2 haritada (Ascent, Haven) pick edilecek
- **Iso** pro maçlarda daha çok görünmeye başlayacak
- Yeni bir duelist'in Q3'te gelmesi bekleniyor

## Sonuç

Meta değişiyor ve agent havuzunu güncel tutmak rank atlamak için kritik. AIMLO her maçından sonra meta'ya uygun agent önerileri sunar. Şu an **Waylay** veya **Iso** öğrenerek hızla rank atlayabilirsin.`,
      },
      {
        category: "Harita Rehberi",
        title: "Ascent B Site: Komple Anchor Rehberi",
        excerpt: "B Main, B Link ve Market kontrolü. Sentinel oyuncuları için step-by-step anchor rehberi ve en iyi setup pozisyonları.",
        readTime: "6 dk",
        date: "1 gün önce",
        color: "#B44DFF",
        content: `Ascent, Valorant'ın en eski ve en çok oynanan haritalarından biri. B Site ise anchor'lar için en zorlu noktalardan biri. AIMLO'nun Ascent B Site analizlerinden derlediğimiz kapsamlı rehber:

## Harita Dinamiği

B Site Ascent'te **3 farklı giriş noktası** var: B Main, B Link ve Market. Bir anchor olarak bu üç açıyı da kontrol etmen gerekiyor. AIMLO verilerine göre B Site'ta en çok executeler B Main'den (%64) geliyor, Market ise %21 ile ikinci sırada.

## En İyi Anchor Pozisyonları

### 1. CT Default Pozisyonu
**Stair top'ta** durmak en güvenli ve en yaygın pozisyon. Hem B Main'i hem de Site içini görebilirsin. Fakat bu pozisyon çok bilinen bir spot, swing ile kolayca ölebilirsin.

### 2. Boathouse İçi
**Boathouse'un içine** gizlenmek sürpriz pozisyon yaratır. B Main'den gelen düşmanlar içeriye girdiğinde arkalarından tarayabilirsin. Özellikle Killjoy ultilarında veya Chamber tripwire'ları ile kombine ederek kullanışlı.

### 3. Default Box Arkası
Site'ın ortasındaki kutuların arkasında **crouch** ile saklanma taktiği. Düşük rank'te pek kullanılmıyor ama Diamond+ seviyede %58 başarı oranı var.

## Agent Önerileri

- **Killjoy:** Mutlak en iyi B Site anchor. Turret'ı Market'e, Alarm Bot'u B Link'e, Nanoswarm'ları default'a yerleştir. Ultimate ile retake'te sayısal üstünlük yaratırsın.

- **Cypher:** Tripwire'ları Market ve B Main'e koy. Spycam'ı Boathouse'a yönlendir. Ultimate bomb planlama sonrası düşman pozisyonu için paha biçilmez.

- **Chamber:** Trademark'ı B Main'e kur. Headhunter ile uzun mesafeden pick alırsın. Rendezvous ile hem site'ı hem de Link'i kontrol edebilirsin.

- **Sage:** Slow Orb'ları B Main girişine at. Barrier Wall'ı execute zamanı B Main'i kapat. Retake'te kritik değer.

## Kritik Info Noktaları

B Link'ten gelen ses bazen kaçırılır. **Stairs seslerine** özellikle dikkat et. Market'ten gelen footstep'ler 8 saniye içinde default'a gelir, bu süreyi takım rotate'i için kullan.

## Utility Kullanımı

- Site'a execute sırasında **B Main smoke'u** varsa %70 ihtimalle zamana oynarlar
- **Market flash** geldiğinde hemen dönüp Market girişine bak
- **Molly sesi** B Link'ten geliyorsa Heaven'a çekil

## Takım Koordinasyonu

Anchor olarak **"1 kill 1 rotate"** kuralına uy. 1 kill aldıktan sonra mutlaka pozisyon değiştir veya rotate çağrısı yap. Single kill ile site tutulmaz.

## Sonuç

B Site'ı anchor etmek disiplin, info yönetimi ve doğru utility kullanımı gerektirir. AIMLO maçlarını analiz ederek anchor performansını ölç ve hangi pozisyonların sana uygun olduğunu bul.`,
      },
      {
        category: "Strateji",
        title: "Eco Round'u Kazanmanın 3 Altın Kuralı",
        excerpt: "Eco round'lar sadece şanstan ibaret değil. Pro oyuncuların kullandığı eco kazanma stratejileri ve AI'ın önerdiği optimal yaklaşımlar.",
        readTime: "4 dk",
        date: "2 gün önce",
        color: "#2ECC71",
        content: `Eco round'lar Valorant'ta en yanlış oynanan round'lardan biri. Oyuncuların %72'si eco round'u "kaybedilecek round" olarak görüyor ve yeterince efor sarfetmiyor. Ama AIMLO verilerine göre **doğru oynanan eco round'ların %31'i kazanılıyor**. İşte 3 altın kural:

## 1. Stack ve Pick Oyna

Eco'da asla açık alanlarda savaşma. **Köşelere saklan, angle hold et, pick al**. Rakip full-buy olduğu için agresif peek yapar. Sen sadece bekle.

**Pro Tip:** Tüm takım 1-2 pozisyonda stack olsun. 5 kişi farklı yerlerde = 5 ayrı 1v5. 5 kişi bir arada = 5v5 sahte ekonomi etkisi.

## 2. Ekonomi Hasarı Öncelik

Eco round'u kazanmak güzel ama asıl amaç rakibin ekonomisini bozmak. **Operator çalmak, Vandal çalmak** = sonraki round'da kullanırsın. Rakip yeniden buy etmek zorunda kalır.

**AIMLO Verisi:** Silah çalınan round'lardan sonraki round'ların %44'ü silah çalanın takımı tarafından kazanılıyor.

## 3. Rotate ve Split

Tek site'a basma. Bir-iki oyuncu fake yapsın, gerçek saldırı diğer site'tan gelsin. Eco'da rakip defansı rotate'i tahmin edemez.

**Classic Kombo:** 2 oyuncu A'da noise yap, 3 oyuncu B'den silent rush. Rakip rotate ettiğinde B zaten alınmış olur.

## Bonus: Full Save vs Force Buy

Eğer takım ekonomisi **2000'in altındaysa** full save daha mantıklı. 2000-3000 arasında ise pistol+armor force buy denenebilir. AIMLO AI maç içinde sana optimal ekonomi önerisi sunar.

## Hangi Pistol'ü Al?

- **Sheriff:** Aim iyiyse 1-tap için en iyi seçim
- **Ghost:** Orta mesafe ve spam için güvenli seçim
- **Frenzy:** Close-range rush için sürpriz factor
- **Classic:** Sadece full save durumunda kalır

## Sonuç

Eco round'lar rank atlatacak kadar önemli. Her eco round'u kazanırsan rakibin ekonomisi çöker ve sonraki 2-3 round'u da alma şansın artar. AIMLO ile ekonomi yönetimini optimize et, maç kazanmaya başla.`,
      },
      {
        category: "Ajan Rehberi",
        title: "Sova Dart'ları: Haven'de 8 Temel Line-up",
        excerpt: "A Site, B Site ve C Site için AIMLO topluluğunun en çok kullandığı Sova recon dart line-up'ları. Görsel rehberle birlikte.",
        readTime: "8 dk",
        date: "4 gün önce",
        color: "#ECB73E",
      },
      {
        category: "Ajan Rehberi",
        title: "Clove Rehberi: Yeni Controller'ı Sıfırdan Öğren",
        excerpt: "Clove'un tüm yeteneklerini, ultimate kombolarını ve hangi haritalarda en etkili olduğunu AI destekli istatistiklerle öğren.",
        readTime: "9 dk",
        date: "1 hafta önce",
        color: "#FF4655",
      },
      {
        category: "Rank Rehberi",
        title: "Radiant Oyuncuların 5 Ortak Alışkanlığı",
        excerpt: "AIMLO'nun takip ettiği 200+ Radiant oyuncunun analizi: karar verme hızı, crosshair placement ve iletişim pattern'leri.",
        readTime: "6 dk",
        date: "2 hafta önce",
        color: "#4D7CFF",
      },
      {
        category: "Harita Rehberi",
        title: "Split Mid Kontrolü: Attack Tarafı Taktikleri",
        excerpt: "Split'in en kritik bölgesi olan Mid'i nasıl kontrol edersin? AI istatistiklerine göre %63 kazanma oranlı 4 execute stratejisi.",
        readTime: "7 dk",
        date: "3 hafta önce",
        color: "#B44DFF",
      },
      {
        category: "Meta Analizi",
        title: "Chamber Rework Sonrası: Hala Viable mi?",
        excerpt: "Rework sonrası Chamber'ın pick rate'i düştü ama hala kazanma oranı yüksek. Hangi haritalarda ve takım kompozisyonlarında işe yarıyor?",
        readTime: "5 dk",
        date: "1 ay önce",
        color: "#32B8B8",
      },
      {
        category: "Strateji",
        title: "Round Ekonomisi 101: Loss Bonus Matematiği",
        excerpt: "Pro maçlarda sıkça görülen ekonomi yönetimi hatalarını önlemek için temel kurallar. Save/force/eco kararlarını veriye dayalı al.",
        readTime: "6 dk",
        date: "1 ay önce",
        color: "#2ECC71",
      },
      {
        category: "Ajan Rehberi",
        title: "Viper Ultimate Kullanımı: 12 En İyi Post-plant",
        excerpt: "Viper's Pit ile post-plant'te nasıl dominant olursun? AIMLO verilerinden derlenmiş en yüksek kazanma oranlı 12 pozisyon.",
        readTime: "10 dk",
        date: "2 ay önce",
        color: "#ECB73E",
      },
      {
        category: "Rank Rehberi",
        title: "Iron'dan Silver'a: Yeni Başlayanlar İçin 7 Altın Kural",
        excerpt: "Valorant'ta ilk rank maçlarına giren oyuncular için: crosshair ayarları, temel pozisyonlama ve iletişim ipuçları.",
        readTime: "5 dk",
        date: "3 ay önce",
        color: "#FF4655",
      },
    ],
    landingHelpText:
      "Sorularınız mı var? Bize e-posta gönderin, en kısa sürede dönüş yapalım.",
    landingHelpEmail: "İletişim: support@aimlo.gg",
    landingNav: { about: "Hakkımızda", blog: "Blog", faq: "SSS" },
    landingFaqs: [
      {
        q: "AIMLO ne kadar?",
        a: "AIMLO sadece 10$. Bu tek ödemeyle maç analizi, round bazlı geri bildirim, maç sonu raporu ve AI destekli kişiselleştirilmiş koçluk gibi tüm özelliklere erişim sağlarsın. Gelişmiş AI destekli derinlemesine analiz, geçmiş maç karşılaştırması ve kişiselleştirilmiş gelişim haritası gibi premium özellikler de dahildir.",
      },
      {
        q: "Nasıl çalışıyor?",
        a: "AIMLO Windows uygulamasını başlatmak yeterli. Sen sadece Valorant oynarsın, AIMLO arka planda çalışır ve maçını otomatik olarak izler. Yapay zeka maç verilerini, ölüm konumlarını, düşman pozisyonlarını ve round sonuçlarını tamamen otomatik olarak çeker. Hiçbir şey yazmana, not girmene veya kurulum yapmana gerek yok. Maç bittiğinde AI sana tekrarlayan hatalarını, düşman eğilimlerini ve kişiselleştirilmiş gelişim önerilerini içeren kapsamlı bir rapor sunar.",
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
        title: "Otomatik İzleme",
        desc: "AI maçını arka planda izler, hiçbir şey yapmana gerek yok",
      },
      {
        icon: "chart",
        title: "Detaylı Raporlar",
        desc: "Maç sonu kapsamlı performans raporu otomatik hazırlanır",
      },
      {
        icon: "target",
        title: "Hata Tespiti",
        desc: "AI tekrarlayan hatalarını otomatik tespit eder ve çözüm sunar",
      },
      {
        icon: "trend",
        title: "Gelişim Takibi",
        desc: "Zaman içindeki ilerlemeni AI otomatik olarak analiz eder",
      },
    ],
    landingHowTitle: "Nasıl Çalışıyor?",
    landingHowSteps: [
      { step: "1", title: "Uygulamayı İndir", desc: "AIMLO'yu Windows'a yükle ve başlat" },
      {
        step: "2",
        title: "Valorant'ı Oyna",
        desc: "AIMLO arka planda çalışır, hiçbir şey yapman gerekmez",
      },
      {
        step: "3",
        title: "AI Otomatik İzler",
        desc: "Yapay zeka maçını canlı analiz eder ve her round'u inceler",
      },
      {
        step: "4",
        title: "Detaylı Rapor Al",
        desc: "Maç sonunda hatalarını, güçlü yönlerini ve gelişim önerilerini gör",
      },
    ],
    landingDiffTitle: "Neden AIMLO?",
    landingDiffItems: [
      {
        title: "Sıfır Efor, Maksimum Analiz",
        desc: "Hiçbir şey girmeden, hiçbir şey yazmadan. AI tüm verileri otomatik çeker, sen sadece oynarsın.",
      },
      {
        title: "Sadece Rakam Değil, Çözüm",
        desc: "Diğer araçlar kill/death gösterir. AIMLO neden kaybettiğini açıklar ve çözüm sunar.",
      },
      {
        title: "Kişisel Gelişim Haritası",
        desc: "AI zaman içinde hatalarının nasıl azaldığını ve hangi alanlarda geliştiğini takip eder.",
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
      "Launch the app and play Valorant. AI watches everything automatically and delivers your personal analysis and improvement report after each match. You just play.",
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
      "Progress at your own pace. Analyze every match, identify your mistakes, and climb ranks with AI-powered suggestions. Start for just $10 and track your improvement.",
    landingFaqTitle: "Frequently Asked Questions",
    landingBlogTitle: "Blog & Insights",
    landingBlogText:
      "AI-powered Valorant analyses, rank climbing guides, meta insights, and best practices from the community.",
    landingBlogReadMore: "Read More",
    landingBlogAll: "All Posts",
    landingBlogPosts: [
      {
        category: "Rank Guide",
        title: "Gold to Diamond: Top 5 Positioning Mistakes",
        excerpt: "Based on AIMLO's analysis of 10,000+ matches, these are the critical positioning mistakes 78% of players make during the Gold-Diamond transition.",
        readTime: "5 min",
        date: "3 hours ago",
        color: "#FF4655",
      },
      {
        category: "Meta Analysis",
        title: "2026 Meta: Shifts in the Duelist Pool",
        excerpt: "From Jett's decline to Waylay's rise. Which duelists dominate this patch? A detailed AI-driven data analysis.",
        readTime: "7 min",
        date: "12 hours ago",
        color: "#4D7CFF",
      },
      {
        category: "Map Guide",
        title: "Ascent B Site: Complete Anchor Guide",
        excerpt: "B Main, B Link, and Market control. A step-by-step anchoring guide and optimal setup positions for sentinel players.",
        readTime: "6 min",
        date: "1 day ago",
        color: "#B44DFF",
      },
      {
        category: "Strategy",
        title: "3 Golden Rules for Winning Eco Rounds",
        excerpt: "Eco rounds are not just luck. Pro player strategies and AI-recommended optimal approaches for winning eco situations.",
        readTime: "4 min",
        date: "2 days ago",
        color: "#2ECC71",
      },
      {
        category: "Agent Guide",
        title: "Sova Darts: 8 Essential Line-ups on Haven",
        excerpt: "Most-used Sova recon dart line-ups for A, B, and C sites by the AIMLO community. Includes visual guides.",
        readTime: "8 min",
        date: "4 days ago",
        color: "#ECB73E",
      },
      {
        category: "Agent Guide",
        title: "Clove Guide: Learn the New Controller from Zero",
        excerpt: "Master Clove's abilities, ult combos, and best-performing maps with AI-powered stats and scenarios.",
        readTime: "9 min",
        date: "1 week ago",
        color: "#FF4655",
      },
      {
        category: "Rank Guide",
        title: "5 Common Habits of Radiant Players",
        excerpt: "An analysis of 200+ Radiant players tracked by AIMLO: decision speed, crosshair placement, and communication patterns.",
        readTime: "6 min",
        date: "2 weeks ago",
        color: "#4D7CFF",
      },
      {
        category: "Map Guide",
        title: "Split Mid Control: Attack Side Tactics",
        excerpt: "How to control Split's most critical area. 4 execute strategies with 63% win rates based on AI data.",
        readTime: "7 min",
        date: "3 weeks ago",
        color: "#B44DFF",
      },
      {
        category: "Meta Analysis",
        title: "Post-Rework Chamber: Still Viable?",
        excerpt: "Chamber's pick rate dropped after the rework, but his win rate is still high. Which maps and comps does he shine on?",
        readTime: "5 min",
        date: "1 month ago",
        color: "#32B8B8",
      },
      {
        category: "Strategy",
        title: "Round Economy 101: Loss Bonus Math",
        excerpt: "Basic rules to avoid economy management mistakes seen in pro matches. Make save/force/eco decisions backed by data.",
        readTime: "6 min",
        date: "1 month ago",
        color: "#2ECC71",
      },
      {
        category: "Agent Guide",
        title: "Viper Ultimate Usage: 12 Best Post-plants",
        excerpt: "How to dominate post-plants with Viper's Pit. 12 highest win-rate positions compiled from AIMLO data.",
        readTime: "10 min",
        date: "2 months ago",
        color: "#ECB73E",
      },
      {
        category: "Rank Guide",
        title: "Iron to Silver: 7 Golden Rules for Beginners",
        excerpt: "For new players entering ranked: crosshair settings, basic positioning, and communication tips.",
        readTime: "5 min",
        date: "3 months ago",
        color: "#FF4655",
      },
    ],
    landingHelpText:
      "Have questions? Send us an email and we'll get back to you as soon as possible.",
    landingHelpEmail: "Contact: support@aimlo.gg",
    landingNav: { about: "About", blog: "Blog", faq: "FAQ" },
    landingFaqs: [
      {
        q: "How much does AIMLO cost?",
        a: "AIMLO is just $10. With this one-time payment you get full access to all features including match analysis, round-by-round feedback, end-of-match reports, and AI-powered personalized coaching. Premium features like advanced AI-powered deep analysis, historical match comparison, and personalized improvement roadmaps are also included.",
      },
      {
        q: "How does it work?",
        a: "Just launch the AIMLO Windows app and play Valorant. AIMLO runs in the background and automatically watches your match. The AI pulls all match data — death locations, enemy positions, round outcomes — completely on its own. You don't need to type, take notes, or configure anything. When the match ends, the AI delivers a comprehensive report with recurring mistakes, enemy tendencies, and personalized improvement recommendations.",
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
        title: "Automatic Tracking",
        desc: "AI watches your match in the background, no input required",
      },
      {
        icon: "chart",
        title: "Detailed Reports",
        desc: "Comprehensive post-match performance report generated automatically",
      },
      {
        icon: "target",
        title: "Mistake Detection",
        desc: "AI automatically detects recurring mistakes and offers solutions",
      },
      {
        icon: "trend",
        title: "Progress Tracking",
        desc: "AI analyzes your improvement over time automatically",
      },
    ],
    landingHowTitle: "How It Works",
    landingHowSteps: [
      {
        step: "1",
        title: "Download the App",
        desc: "Install AIMLO on Windows and launch it",
      },
      {
        step: "2",
        title: "Play Valorant",
        desc: "AIMLO runs in the background, no manual input needed",
      },
      {
        step: "3",
        title: "AI Watches Automatically",
        desc: "The AI analyzes your match live and reviews every round",
      },
      {
        step: "4",
        title: "Get Detailed Report",
        desc: "See your mistakes, strengths, and improvement tips after each match",
      },
    ],
    landingDiffTitle: "Why AIMLO?",
    landingDiffItems: [
      {
        title: "Zero Effort, Maximum Analysis",
        desc: "No typing, no notes, no setup. AI pulls all the data automatically — you just play.",
      },
      {
        title: "Solutions, Not Just Numbers",
        desc: "Other tools show K/D. AIMLO explains why you lost and delivers real solutions.",
      },
      {
        title: "Personal Growth Map",
        desc: "AI tracks how your mistakes decrease and where you improve over time.",
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
          <AimloLogo size={60} interactive />
          <span className="text-xl font-black tracking-wider ml-1" style={{ background: "linear-gradient(135deg, #00D4FF 0%, #A855F7 50%, #FF4690 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", filter: "drop-shadow(0 0 8px rgba(0,212,255,0.2))" }}>
            AIMLO
          </span>
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
  const [showAllBlog, setShowAllBlog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);

  // ESC to close blog modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedPost !== null) setSelectedPost(null);
        else if (showAllBlog) setShowAllBlog(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [selectedPost, showAllBlog]);

  const { ref: howRevealRef, visible: howRevealVisible } = useScrollReveal(0.15);
  const { ref: diffRevealRef, visible: diffRevealVisible } = useScrollReveal(0.15);
  const { ref: featRevealRef, visible: featRevealVisible } = useScrollReveal(0.1);

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
    <main className="min-h-screen bg-[#080c14] relative overflow-x-hidden">
      <AmbientBg />

      {/* ─── NAVBAR — Xtract style ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-xtract">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2">
            <AimloLogo size={32} interactive />
            <span className="text-lg font-black tracking-wider" style={{ background: "linear-gradient(135deg, #00D4FF 0%, #A855F7 50%, #FF4690 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", filter: "drop-shadow(0 0 6px rgba(0,212,255,0.2))" }}>
              AIMLO
            </span>
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

        {/* Hero Eye — interactive with 3D tilt + glow */}
        <div className="mt-6 -mb-8 animate-slide-up stagger-4 flex items-center justify-center">
          <HeroEye size={160} />
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
                <img src="/aimlo-logo.png?v=3" alt="" className="w-5 h-auto" />
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
        <h2 className="text-center text-3xl sm:text-[44px] font-semibold text-white tracking-tight mb-10 animate-slide-up stagger-4" style={{ letterSpacing: '-1.5px' }}>
          {lang === "tr" ? "Her Seviyeye Uygun Koçluk" : "Coaching for Every Rank"}
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

      {/* Ambient orb — left side */}
      <div className="pointer-events-none absolute left-[-200px] top-[1200px] w-[500px] h-[500px] rounded-full bg-[#FF4655]/[0.06] blur-[150px] animate-orb" style={{ zIndex: 0 }} />

      {/* ─── FEATURES — Xtract card grid ─── */}
      <section ref={featRevealRef} id="section-features" data-animate className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 pb-28">
        <div className="section-divider mb-16" />
        <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[#FF4655]/50 font-semibold mb-4">
          {lang === "tr" ? "Özellikler" : "Features"}
        </p>
        <h2 className={`text-3xl sm:text-[44px] font-semibold text-white text-center mb-14 leading-tight transition-all duration-700 ${featRevealVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ letterSpacing: '-1.5px' }}>
          {lang === "tr" ? "AI ile Oyununu Bir Üst Seviyeye Taşı" : "Take Your Game to the Next Level with AI"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {l.landingFeatures.map((f, i) => {
            const v = featureVisuals[i];
            return (
              <div key={i} className={`card-xtract group overflow-hidden transition-all duration-700 ${featRevealVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 100}ms` }}>
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
      <section ref={howRevealRef} id="section-how" data-animate className="relative z-10 mx-auto max-w-3xl px-5 sm:px-8 pb-28">
        <div className="section-divider mb-16" />
        <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[#FF4655]/50 font-semibold mb-4">
          {lang === "tr" ? "Süreç" : "Process"}
        </p>
        <h2 className={`text-3xl sm:text-[44px] font-semibold text-white tracking-tight text-center mb-14 leading-tight transition-all duration-700 ${howRevealVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ letterSpacing: '-1.5px' }}>
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
              <div key={i} className={`group flex items-center gap-5 card-xtract p-5 sm:p-6 transition-all duration-700 ${howRevealVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${i * 120}ms` }}>
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

      {/* Ambient orb — right side */}
      <div className="pointer-events-none absolute right-[-200px] top-[2200px] w-[400px] h-[400px] rounded-full bg-[#4D7CFF]/[0.05] blur-[130px] animate-orb" style={{ zIndex: 0, animationDelay: '5s' }} />

      {/* ─── WHY AIMLO — Benefits grid like Xtract ─── */}
      <section ref={diffRevealRef} id="section-about" data-animate className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 pb-28">
        <div className="section-divider mb-16" />
        <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[#FF4655]/50 font-semibold mb-4">
          {lang === "tr" ? "Avantajlar" : "Benefits"}
        </p>
        <h2 className={`text-3xl sm:text-[44px] font-semibold text-white tracking-tight text-center mb-14 leading-tight transition-all duration-700 ${diffRevealVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ letterSpacing: '-1.5px' }}>
          {lang === "tr" ? "Neden AIMLO?" : "Why AIMLO?"}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {l.landingDiffItems.map((item, i) => {
            const colors = ["#FF4655", "#4D7CFF", "#B44DFF"];
            return (
              <div key={i} className={`card-xtract p-8 group transition-all duration-500 ${diffRevealVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 120}ms` }}>
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
        <p className="text-center text-[12px] text-neutral-500 mb-12 max-w-xl mx-auto">
          {lang === "tr"
            ? "Closed beta'dan oyuncuların gerçek geri bildirimlerinden seçtiklerimiz. Discord ve in-app feedback formundan toplandı."
            : "Selected feedback from real beta players — collected from Discord and the in-app feedback form."}
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {(lang === "tr" ? [
            {
              handle: "@kahve_op",
              rank: "Plat 2",
              maps: "Bind / Lotus",
              text: "Yusuf'un B Long sürekli ölme problemim varmış. Üst üste 4 round tek rapor 'aynı açıdan ikinci peek atıyorsun' dedi. Haklıymış. O round'lardan sonra Bind defansta %30 daha iyiyim. Reklam edilen 'Diamond garanti' olayı yok ama kendi hatalarını görmek için işe yarıyor.",
              color: "#32B8B8",
            },
            {
              handle: "@ash_jett",
              rank: "Diamond 1",
              maps: "Ascent",
              text: "Coach insight feature'i zayıf round'larda iyi, full util execute round'larında biraz generic. Ama şunu sevdim: pattern context bölümü gerçekten son 3-4 round'a referans veriyor, copy-paste tavsiye değil. Round başına 2-3 saniye cost ediyor ama overlay küçük, oyunu engellemiyor.",
              color: "#B489FF",
            },
            {
              handle: "@tepe_smoke",
              rank: "Asc 3 → Imm 1",
              maps: "Lotus / Sunset",
              text: "Tek başıma queue atarken takım iletişimi yoktu, AI'in 'savunmacılar son round B stack yaptı, A'ya geç' tarzı çağrıları işime yaradı. Bazı pattern'leri kaçırdığını gördüm (clutch round'larda). Roadmap'lerinde fix etmeye çalışıyorlar, support ekibi cevap veriyor.",
              color: "#ECB73E",
            },
          ] : [
            {
              handle: "@kahve_op",
              rank: "Plat 2",
              maps: "Bind / Lotus",
              text: "Found out I was dying on B Long every time — 4 rounds in a row the report said 'second peek same angle.' Fair. Bind defense is ~30% better since. Not a 'climb to Diamond' silver bullet but it makes your own mistakes obvious.",
              color: "#32B8B8",
            },
            {
              handle: "@ash_jett",
              rank: "Diamond 1",
              maps: "Ascent",
              text: "Coach insight is good on rough rounds, a bit generic on clean full-util executes. What I liked: the pattern-context block actually references the last 3-4 rounds, not generic copy. Costs 2-3s per round but the overlay is small and doesn't block gameplay.",
              color: "#B489FF",
            },
            {
              handle: "@tepe_smoke",
              rank: "Asc 3 → Imm 1",
              maps: "Lotus / Sunset",
              text: "Solo queueing without team comms, AI calls like 'defenders stacked B last round, swing A' were genuinely useful. It misses some clutch patterns. Roadmap mentions fixing it — support actually responds.",
              color: "#ECB73E",
            },
          ]).map((t, i) => (
            <div key={i} className="card-xtract p-6 group">
              <p className="text-[13px] text-neutral-300 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}25` }}>
                  {t.handle.charAt(1).toUpperCase()}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-white">{t.handle}</p>
                  <p className="text-[10px] font-medium text-neutral-500">
                    <span style={{ color: t.color }}>{t.rank}</span>
                    <span className="mx-1.5 text-neutral-700">•</span>
                    {t.maps}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ambient orb — left side lower */}
      <div className="pointer-events-none absolute left-[-150px] top-[3200px] w-[450px] h-[450px] rounded-full bg-[#FF4655]/[0.05] blur-[140px] animate-orb" style={{ zIndex: 0, animationDelay: '10s' }} />

      {/* ─── BLOG SECTION ─── */}
      <section id="section-blog" data-animate className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 pb-28">
        <div className="section-divider mb-16" />
        <div className="text-center mb-14">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#FF4655]/70 font-semibold mb-3">
            {l.landingBlogTitle}
          </p>
          <h2 className="text-3xl sm:text-[44px] font-semibold text-white tracking-tight leading-tight mb-4" style={{ letterSpacing: '-1.5px' }}>
            {lang === "tr" ? "Rank Atlamanın Anahtarı" : "The Key to Ranking Up"}
          </h2>
          <p className="text-[15px] text-neutral-400 max-w-xl mx-auto leading-relaxed">
            {l.landingBlogText}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {l.landingBlogPosts.slice(0, 4).map((post, i) => (
            <article
              key={i}
              onClick={() => setSelectedPost(i)}
              className="card-xtract group p-7 cursor-pointer relative overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, ${post.color}, transparent)` }}
              />
              {/* Category + date */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-md"
                  style={{
                    color: post.color,
                    background: `${post.color}12`,
                    border: `1px solid ${post.color}20`,
                  }}
                >
                  {post.category}
                </span>
                <span className="text-[11px] text-neutral-500 flex items-center gap-2">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {post.readTime}
                </span>
              </div>
              {/* Title */}
              <h3 className="text-[18px] sm:text-[20px] font-bold text-white leading-snug mb-3 group-hover:text-white transition-colors" style={{ letterSpacing: '-0.3px' }}>
                {post.title}
              </h3>
              {/* Excerpt */}
              <p className="text-[13px] text-neutral-400 leading-relaxed mb-5">
                {post.excerpt}
              </p>
              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <span className="text-[11px] text-neutral-500">{post.date}</span>
                <span
                  className="text-[12px] font-semibold flex items-center gap-1.5 group-hover:gap-2.5 transition-all"
                  style={{ color: post.color }}
                >
                  {l.landingBlogReadMore}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </article>
          ))}
        </div>
        <div className="text-center mt-10">
          <button
            onClick={() => setShowAllBlog(true)}
            className="btn-ghost rounded-xl px-8 py-3 text-[13px] inline-flex items-center gap-2"
          >
            {l.landingBlogAll}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </section>

      {/* ─── ALL BLOG POSTS MODAL ─── */}
      {showAllBlog && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-8 animate-fade-in overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)" }}
          onClick={() => setShowAllBlog(false)}
        >
          <div
            className="relative max-w-6xl w-full my-auto bg-[#0b1120] border border-white/10 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowAllBlog(false)}
              className="absolute top-5 right-5 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {/* Top accent bar */}
            <div className="h-1 w-full rounded-t-2xl" style={{ background: "linear-gradient(90deg, #FF4655, #4D7CFF, #B44DFF, #2ECC71)" }} />
            <div className="p-8 sm:p-12">
              {/* Header */}
              <div className="mb-10">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#FF4655]/70 font-semibold mb-3">
                  {l.landingBlogTitle}
                </p>
                <h2 className="text-3xl sm:text-[40px] font-bold text-white leading-tight mb-3" style={{ letterSpacing: "-1px" }}>
                  {lang === "tr" ? "Tüm Blog Yazıları" : "All Blog Posts"}
                </h2>
                <p className="text-[14px] text-neutral-400 max-w-2xl">
                  {l.landingBlogText}
                </p>
              </div>
              {/* All posts grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {l.landingBlogPosts.map((post, i) => (
                  <article
                    key={i}
                    onClick={() => {
                      setSelectedPost(i);
                      setShowAllBlog(false);
                    }}
                    className="card-xtract group p-5 cursor-pointer relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(90deg, ${post.color}, transparent)` }}
                    />
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-md"
                        style={{
                          color: post.color,
                          background: `${post.color}12`,
                          border: `1px solid ${post.color}20`,
                        }}
                      >
                        {post.category}
                      </span>
                      <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-[15px] font-bold text-white leading-snug mb-2" style={{ letterSpacing: "-0.2px" }}>
                      {post.title}
                    </h3>
                    <p className="text-[12px] text-neutral-400 leading-relaxed mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                      <span className="text-[10px] text-neutral-500">{post.date}</span>
                      <span
                        className="text-[11px] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                        style={{ color: post.color }}
                      >
                        {l.landingBlogReadMore}
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── BLOG POST MODAL ─── */}
      {selectedPost !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-[#0b1120] border border-white/10 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {/* Top accent bar */}
            <div
              className="h-1 w-full rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, ${l.landingBlogPosts[selectedPost].color}, transparent)` }}
            />
            <div className="p-8 sm:p-12">
              {/* Category + meta */}
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-md"
                  style={{
                    color: l.landingBlogPosts[selectedPost].color,
                    background: `${l.landingBlogPosts[selectedPost].color}15`,
                    border: `1px solid ${l.landingBlogPosts[selectedPost].color}25`,
                  }}
                >
                  {l.landingBlogPosts[selectedPost].category}
                </span>
                <span className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {l.landingBlogPosts[selectedPost].readTime}
                </span>
                <span className="text-[11px] text-neutral-500">·</span>
                <span className="text-[11px] text-neutral-500">{l.landingBlogPosts[selectedPost].date}</span>
              </div>
              {/* Title */}
              <h2 className="text-2xl sm:text-[32px] font-bold text-white leading-tight mb-6" style={{ letterSpacing: "-0.5px" }}>
                {l.landingBlogPosts[selectedPost].title}
              </h2>
              {/* Excerpt as lead */}
              <p className="text-[15px] text-neutral-300 leading-relaxed mb-8 pl-4 border-l-2" style={{ borderColor: `${l.landingBlogPosts[selectedPost].color}50` }}>
                {l.landingBlogPosts[selectedPost].excerpt}
              </p>
              {/* Full content */}
              <div className="prose prose-invert max-w-none text-[14px] text-neutral-300 leading-[1.8] space-y-5">
                {(((l.landingBlogPosts[selectedPost] as { content?: string }).content) || (lang === "tr" ? "İçerik yakında eklenecek..." : "Content coming soon...")).split("\n\n").map((paragraph, pi) => {
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h3 key={pi} className="text-[18px] font-bold text-white mt-8 mb-2" style={{ color: l.landingBlogPosts[selectedPost].color }}>
                        {paragraph.replace("## ", "")}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith("### ")) {
                    return (
                      <h4 key={pi} className="text-[15px] font-semibold text-white mt-5 mb-1">
                        {paragraph.replace("### ", "")}
                      </h4>
                    );
                  }
                  return (
                    <p key={pi} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') }} />
                  );
                })}
              </div>
              {/* Footer close button */}
              <div className="mt-10 pt-6 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-neutral-500">{lang === "tr" ? "Yazıyı kapatmak için ESC'ye bas" : "Press ESC to close"}</span>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-[12px] font-semibold px-5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all text-white"
                >
                  {lang === "tr" ? "Kapat" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              ? "AI maçını otomatik izler, tüm verileri çeker ve maç sonu kişiselleştirilmiş koçluk raporu sunar. Sen sadece oyna."
              : "AI watches your match automatically, pulls all the data, and delivers a personalized coaching report. You just play."}
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-[13px] text-neutral-400">
            {[
              lang === "tr" ? "Otomatik izleme" : "Auto tracking",
              lang === "tr" ? "In-game overlay" : "In-game overlay",
              lang === "tr" ? "Sadece 10$" : "Only $10",
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
              <img src="/aimlo-logo.png?v=3" alt="AIMLO" style={{ height: 22, width: 'auto', opacity: 0.4 }} draggable={false} />
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
          <img src="/aimlo-logo.png?v=3" alt="AIMLO" style={{ height: 34, width: 'auto' }} draggable={false} className="mx-auto opacity-30" />
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
          <img src="/aimlo-logo.png?v=3" alt="AIMLO" style={{ height: 34, width: 'auto' }} draggable={false} className="mx-auto opacity-30" />
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

  // Manual setup/round/scoreInput web flow has been removed from the web app
  // — round-by-round analysis lives entirely in AIMLO Desktop. If a stored
  // session lands on one of those legacy screens, redirect to dashboard.
  useEffect(() => {
    if (screen === "setup" || screen === "round" || screen === "scoreInput") {
      setScreen("dashboard");
    }
  }, [screen]);

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
          const filtered = arr.filter((r): boolean => (r as { id?: string } | null)?.id !== reportId);
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
          <AimloLogo size={120} className="animate-pulse" />
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
      <main className="min-h-screen bg-[#080c14] relative overflow-hidden">
        <AmbientBg />
        {/* Dashboard hero orbs — red/blue glow like landing */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="hero-orb absolute -top-40 left-1/2 -translate-x-1/2" />
          <div className="hero-orb-inner absolute top-20 left-1/3" />
        </div>
        <Navbar {...navProps} />
        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-20 pb-12">

          {/* ═══ HERO ═══ */}
          <div className="relative overflow-hidden rounded-xl border border-[#1e2a3a]/60 bg-gradient-to-br from-[#0a1628] via-[#0d1117] to-[#0a0f16] p-8 mb-8" style={{ minHeight: 200 }}>
            {/* Ambient glow */}
            <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FF4655]/[0.06] blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#4D7CFF]/[0.04] blur-[100px]" />

            {/* Agent splash - background right side */}
            {topAgent && (
              <div className="absolute right-0 top-0 bottom-0 w-1/3 overflow-hidden pointer-events-none">
                <img
                  src={agentImgUrl(topAgent.name)}
                  alt=""
                  className="h-full w-auto object-cover opacity-20"
                  style={{ maskImage: 'linear-gradient(to left, rgba(0,0,0,0.6), transparent)', WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.6), transparent)' }}
                />
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
      <main className="min-h-screen bg-[#080c14]">
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

          {/* ═══ FILTERS — minimal pill style ═══ */}
          {savedReports.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 animate-slide-up stagger-1">
              <select value={historyFilterMap} onChange={(e) => setHistoryFilterMap(e.target.value)} className="appearance-none rounded-full border-none bg-white/[0.04] px-4 py-1.5 text-[11px] text-neutral-400 outline-none transition hover:bg-white/[0.08] hover:text-white focus:bg-white/[0.08] cursor-pointer">
                <option value="">{l.historyFilterMap}: {l.historyAll}</option>
                {uniqueMaps.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={historyFilterAgent} onChange={(e) => setHistoryFilterAgent(e.target.value)} className="appearance-none rounded-full border-none bg-white/[0.04] px-4 py-1.5 text-[11px] text-neutral-400 outline-none transition hover:bg-white/[0.08] hover:text-white focus:bg-white/[0.08] cursor-pointer">
                <option value="">{l.historyFilterAgent}: {l.historyAll}</option>
                {uniqueAgents.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <select value={historyFilterResult} onChange={(e) => setHistoryFilterResult(e.target.value as "all" | "wins" | "losses")} className="appearance-none rounded-full border-none bg-white/[0.04] px-4 py-1.5 text-[11px] text-neutral-400 outline-none transition hover:bg-white/[0.08] hover:text-white focus:bg-white/[0.08] cursor-pointer">
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
                    {/* Agent icon */}
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/[0.08]">
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
                  <p className="text-lg font-extrabold text-[#FF4655]">{vr.winPct}%</p>
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
  // (Legacy manual-analysis screens removed — redirect handled in useEffect at top of component.)
}
