"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */
type Lang = "tr" | "en";
type Screen =
  | "landing"
  | "lang"
  | "dashboard"
  | "setup"
  | "round"
  | "scoreInput"
  | "report"
  | "history"
  | "reportDetail";
type RoundResult = "win" | "loss";
type SetupStep = "mapAgent" | "sideComp" | "confirm";
type SetupData = {
  map: string;
  agent: string;
  side: string;
  teamComp: string[];
  enemyComp: string[];
  unknownEnemyComp: boolean;
};
type RoundFeedback = {
  mainMistake: string;
  enemyHabit: string;
  microPlan: string;
};
type RoundData = {
  roundNumber: number;
  deathLocation: string;
  enemyCount: string;
  yourNote: string;
  result: RoundResult;
  skipped: boolean;
  survived: boolean;
  feedback: RoundFeedback | null;
};
type RoundForm = {
  deathLocation: string;
  enemyCount: string;
  yourNote: string;
};
type FormErrors = Record<string, string>;
type RoundScreenMode = "input" | "skipConfirm" | "feedback";
type MatchScore = { yours: string; enemy: string };
type CompTarget = "team" | "enemy";
type AuthMode = "login" | "register";
type SavedReport = {
  id: string;
  map: string;
  agent: string;
  side: string;
  score: string;
  won: boolean;
  date: string;
  rawDate: string; // ISO string for reliable sorting
  summary: string;
  mistake: string;
  tendencies: string;
  adjustment: string;
  winPct: number;
  roundsWon: number;
  roundsLost: number;
  roundsSkipped: number;
  survivedCount: number;
  totalRounds: number;
  rounds: RoundData[];
  setup: SetupData;
};
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
    typeof o.mainMistake === "string" &&
    typeof o.enemyHabit === "string" &&
    typeof o.microPlan === "string"
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
const AIMLO_LOGO_SRC = "/aimlo-logo.png?v=5d2fb8b5";
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
/* ══════════════════════════════════════════════════════════
   SCROLL REVEAL HOOK
   ══════════════════════════════════════════════════════════ */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}
/* ══════════════════════════════════════════════════════════
   AGENTS
   ══════════════════════════════════════════════════════════ */
const AGENT_GROUPS: Record<string, string[]> = {
  Controllers: ["Brimstone", "Viper", "Omen", "Astra", "Harbor", "Clove"],
  Duelists: [
    "Jett",
    "Raze",
    "Reyna",
    "Phoenix",
    "Yoru",
    "Neon",
    "Iso",
    "Waylay",
  ],
  Initiators: ["Sova", "Breach", "Skye", "KAY/O", "Fade", "Gekko", "Tejo"],
  Sentinels: ["Sage", "Cypher", "Killjoy", "Chamber", "Deadlock", "Vyse"],
};
const AGENT_GROUP_LABELS: Record<string, Record<Lang, string>> = {
  Controllers: { tr: "Kontrolcüler", en: "Controllers" },
  Duelists: { tr: "Düellistler", en: "Duelists" },
  Initiators: { tr: "Öncüler", en: "Initiators" },
  Sentinels: { tr: "Gözcüler", en: "Sentinels" },
};
const AGENT_COLORS: Record<string, string> = {
  Controllers: "from-emerald-500/30 to-emerald-900/20",
  Duelists: "from-red-500/30 to-red-900/20",
  Initiators: "from-sky-500/30 to-sky-900/20",
  Sentinels: "from-amber-500/30 to-amber-900/20",
};
const AGENT_BORDER: Record<string, string> = {
  Controllers: "border-emerald-500/50",
  Duelists: "border-red-500/50",
  Initiators: "border-sky-500/50",
  Sentinels: "border-amber-500/50",
};
const AGENT_ACCENT: Record<string, string> = {
  Controllers: "text-emerald-400",
  Duelists: "text-red-400",
  Initiators: "text-sky-400",
  Sentinels: "text-amber-400",
};
function getAgentRole(agent: string): string {
  for (const [role, agents] of Object.entries(AGENT_GROUPS)) {
    if (agents.includes(agent)) return role;
  }
  return "Controllers";
}
function getAgentInitials(name: string): string {
  if (name === "KAY/O") return "K/O";
  return name.slice(0, 2).toUpperCase();
}
function agentImgUrl(name: string): string {
  const slug: Record<string, string> = {
    Brimstone: "9f0d8ba9-4140-b941-57d3-a7ad57c6b417",
    Viper: "707eab51-4836-f488-046a-cda6bf494859",
    Omen: "8e253930-4c05-31dd-1b6c-968525494517",
    Astra: "41fb69c1-4189-7b37-f117-bcaf1e96f1bf",
    Harbor: "95b78ed7-4637-86d9-7e41-71ba8c293152",
    Clove: "1dbf2edd-4729-0984-3115-daa5eed44993",
    Jett: "add6443a-41bd-e414-f6ad-e58d267f4e95",
    Raze: "f94c3b30-42be-e959-889c-5aa313dba261",
    Reyna: "a3bfb853-43b2-7238-a4f1-ad90e9e46bcc",
    Phoenix: "eb93336a-449b-9c1b-0a54-a891f7921d69",
    Yoru: "7f94d92c-4234-0a36-9646-3a87eb8b5c89",
    Neon: "bb2a4828-46eb-8cd1-e765-15848195d751",
    Iso: "0e38b510-41a8-5780-5e8f-568b2a4f2d6c",
    Waylay: "efba5359-4016-a1e5-7626-b1ae76895940",
    Sova: "320b2a48-4d9b-a075-30f1-1f93a9b638fa",
    Breach: "5f8d3a7f-467b-97f3-062c-13acf203c006",
    Skye: "6f2a04ca-43e0-be17-7f36-b3908627744d",
    "KAY/O": "601dbbe7-43ce-be57-2a40-4abd24953621",
    Fade: "dade69b4-4f5a-8528-247b-219e5a1facd6",
    Gekko: "e370fa57-4757-3604-3648-499e1f642d3f",
    Tejo: "b444168c-4e35-8076-db47-ef9bf368f384",
    Sage: "569fdd95-4d10-43ab-ca70-79becc718b46",
    Cypher: "117ed9e3-49f3-6512-3ccf-0cada7e3823b",
    Killjoy: "1e58de9c-4950-5125-93e9-a0aee9f98746",
    Chamber: "22697a3d-45bf-8dd7-4fec-84a9e28c69d7",
    Deadlock: "cc8b64c8-4b25-4ff9-6e7f-37b4da43d235",
    Vyse: "efba5359-4016-a1e5-7626-b1ae76895940",
  };
  const id = slug[name];
  if (!id) return "";
  return `https://media.valorant-api.com/agents/${id}/displayicon.png`;
}
/* ══════════════════════════════════════════════════════════
   MAP DATA
   ══════════════════════════════════════════════════════════ */
const MAP_LOCATIONS: Record<string, string[]> = {
  Ascent: [
    "A Main",
    "A Short",
    "A Site",
    "A Heaven",
    "B Main",
    "B Site",
    "B Market",
    "Mid Top",
    "Mid Bottom",
    "Mid Cubby",
    "Tree",
    "CT Spawn",
    "Garden",
  ],
  Bind: [
    "A Short",
    "A Bath",
    "A Site",
    "A Lamps",
    "A Tower",
    "B Long",
    "B Short",
    "B Site",
    "B Elbow",
    "B Garden",
    "B Hall",
    "Hookah",
    "CT Spawn",
  ],
  Haven: [
    "A Main",
    "A Short",
    "A Site",
    "A Sewer",
    "B Main",
    "B Site",
    "B Back",
    "C Main",
    "C Long",
    "C Site",
    "C Cubby",
    "Garage",
    "Mid Window",
    "CT Spawn",
  ],
  Split: [
    "A Main",
    "A Ramp",
    "A Rafters",
    "A Site",
    "A Heaven",
    "B Main",
    "B Heaven",
    "B Site",
    "B Back",
    "Mid Vent",
    "Mid Mail",
    "Mid Top",
    "CT Spawn",
  ],
  Lotus: [
    "A Main",
    "A Root",
    "A Site",
    "A Rubble",
    "A Tree",
    "B Main",
    "B Upper",
    "B Site",
    "B Pillar",
    "C Main",
    "C Mound",
    "C Site",
    "C Hall",
    "CT Spawn",
  ],
  Sunset: [
    "A Main",
    "A Elbow",
    "A Site",
    "A Alley",
    "B Main",
    "B Market",
    "B Site",
    "B Boba",
    "Mid Top",
    "Mid Bottom",
    "Mid Courtyard",
    "CT Spawn",
  ],
  Icebox: [
    "A Main",
    "A Belt",
    "A Site",
    "A Nest",
    "A Pipes",
    "B Main",
    "B Orange",
    "B Site",
    "B Green",
    "B Yellow",
    "Mid Boiler",
    "Mid Blue",
    "CT Spawn",
  ],
  Breeze: [
    "A Main",
    "A Hall",
    "A Site",
    "A Cave",
    "A Bridge",
    "B Main",
    "B Elbow",
    "B Site",
    "B Back",
    "Mid Pillar",
    "Mid Nest",
    "CT Spawn",
  ],
  Fracture: [
    "A Main",
    "A Dish",
    "A Site",
    "A Drop",
    "A Rope",
    "B Main",
    "B Arcade",
    "B Site",
    "B Tree",
    "B Tower",
    "Mid Hall",
    "CT Spawn",
  ],
  Pearl: [
    "A Main",
    "A Art",
    "A Site",
    "A Dugout",
    "B Main",
    "B Long",
    "B Site",
    "B Hall",
    "B Link",
    "Mid Plaza",
    "Mid Top",
    "CT Spawn",
  ],
  Abyss: [
    "A Main",
    "A Short",
    "A Site",
    "A Ramp",
    "B Main",
    "B Site",
    "B Tower",
    "B Ramp",
    "Mid Link",
    "Mid Bridge",
    "CT Spawn",
  ],
};
const MAPS = Object.keys(MAP_LOCATIONS);
const MAP_IMAGES: Record<string, string> = {
  Ascent:
    "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png",
  Bind: "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png",
  Haven:
    "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png",
  Split:
    "https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png",
  Lotus:
    "https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/splash.png",
  Sunset:
    "https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/splash.png",
  Icebox:
    "https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/splash.png",
  Breeze:
    "https://media.valorant-api.com/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/splash.png",
  Fracture:
    "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png",
  Pearl:
    "https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/splash.png",
  Abyss:
    "https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/splash.png",
};
const SCORE_OPTIONS = [
  "13 - 0",
  "13 - 1",
  "13 - 2",
  "13 - 3",
  "13 - 4",
  "13 - 5",
  "13 - 6",
  "13 - 7",
  "13 - 8",
  "13 - 9",
  "13 - 10",
  "13 - 11",
  "14 - 12",
  "13 - 12",
  "12 - 14",
  "12 - 13",
  "11 - 13",
  "10 - 13",
  "9 - 13",
  "8 - 13",
  "7 - 13",
  "6 - 13",
  "5 - 13",
  "4 - 13",
  "3 - 13",
  "2 - 13",
  "1 - 13",
  "0 - 13",
];
/* ══════════════════════════════════════════════════════════
   ICON CONSTANTS — real unicode, not HTML entities
   ══════════════════════════════════════════════════════════ */
const IC = {
  diamond: "\u25C6",
  cross: "\u2715",
  circle: "\u25CE",
  play: "\u25B8",
  bolt: "\u26A1",
  check: "\u2713",
  arrow: "\u2192",
  dot: "\u00B7",
  copy: "\u00A9",
  mid: "\u203A",
};
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
    mainMistake: "Ana Hata",
    enemyHabit: "Düşman Alışkanlığı",
    microPlan: "Sonraki Round Mikro Planı",
    reportTitle: "Maç Raporu",
    overallSummary: "Genel Maç Özeti",
    mainRecurringMistake: "Ana Tekrarlayan Hata",
    enemyTendencies: "Düşman Eğilimleri",
    suggestedAdjustment: "Önerilen Düzenleme",
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
    dashNewMatch: "Yeni Maç Başlat",
    dashNewMatchDesc: "Yeni bir maç analizi ve koçluk oturumu başlat",
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
    landingCTA: "AI Analiz Başlat",
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
    mainMistake: "Main Mistake",
    enemyHabit: "Enemy Habit",
    microPlan: "Next Round Micro Plan",
    reportTitle: "Match Report",
    overallSummary: "Overall Match Summary",
    mainRecurringMistake: "Main Recurring Mistake",
    enemyTendencies: "Enemy Tendencies",
    suggestedAdjustment: "Suggested Adjustment",
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
    dashNewMatch: "Start New Match",
    dashNewMatchDesc: "Start a new match analysis and coaching session",
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
    landingCTA: "Start AI Analysis",
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
  const note = form.yourNote.toLowerCase();
  const sideLabel = isTr
    ? setup.side === "attack"
      ? "saldırı"
      : "savunma"
    : setup.side === "attack"
      ? "attack"
      : "defense";
  const prevDeaths = allRounds.filter(
    (r) => !r.skipped && !r.survived && r.deathLocation === loc,
  );
  const repeatCount = prevDeaths.length;
  let mistake: string;
  if (survived) {
    mistake =
      result === "win"
        ? isTr
          ? "Hayatta kaldın ve round kazanıldı. İyi iş! Pozisyonunu korumaya devam et."
          : "You survived and won. Good job! Keep holding your position."
        : isTr
          ? "Hayatta kaldın ama round kaybedildi. Takım koordinasyonunu gözden geçir."
          : "You survived but the round was lost. Review team coordination.";
  } else if (repeatCount >= 2) {
    mistake = isTr
      ? `${loc} konumunda daha önce ${repeatCount} kez öldün. Farklı bir açıya geçmeyi düşün.`
      : `You've died at ${loc} ${repeatCount} times before. Consider switching to a different angle.`;
  } else if (Number(cnt) >= 3) {
    mistake = isTr
      ? `${loc} konumunda ${cnt} düşmana karşı sayısal dezavantajdaydın. Geri çekilip bilgi vermeliydin.`
      : `You faced ${cnt} enemies at ${loc}. Fall back and call info.`;
  } else if (
    note.includes("rotate") ||
    note.includes("rotasyon") ||
    note.includes("döndüm")
  ) {
    mistake = isTr
      ? `Rotasyonun ${loc} bölgesinde seni açık bıraktı. ${sideLabel} tarafında erken rotasyon düşmana kolay entry verir.`
      : `Your rotation left you exposed at ${loc}. On ${sideLabel}, rotating early gives easy entry.`;
  } else if (note.includes("solo") || note.includes("tek")) {
    mistake = isTr
      ? `${loc} bölgesinde solo oynaman riskli oldu. Takım desteği olmadan tutunamaman normal.`
      : `Playing solo at ${loc} was risky. It's expected to struggle without team support.`;
  } else if (
    note.includes("util") ||
    note.includes("ability") ||
    note.includes("yetenek")
  ) {
    mistake = isTr
      ? `Utility sonrası ${loc} konumunda savunmasız kaldın. Util sonrası kısa bekleme ekle.`
      : `After using utility you were vulnerable at ${loc}. Add a short delay after ability usage.`;
  } else {
    mistake = isTr
      ? `${loc} konumunda pozisyonun ${sideLabel} tarafı için ideal değildi. Daha korunaklı bir açı seçmeliydin.`
      : `Your position at ${loc} wasn't ideal for ${sideLabel}. Choose a more covered angle.`;
  }
  const avgEnemy =
    allRounds.length > 0
      ? (
          allRounds
            .filter((r) => !r.skipped)
            .reduce((s, r) => s + Number(r.enemyCount || 0), 0) /
          Math.max(allRounds.filter((r) => !r.skipped).length, 1)
        ).toFixed(1)
      : cnt || "0";
  let habit: string;
  if (survived && !cnt) {
    habit = isTr
      ? "Düşman hareket kalıplarını izlemeye devam et."
      : "Keep observing enemy movement patterns.";
  } else if (Number(cnt) >= 4) {
    habit = isTr
      ? `Düşman bu bölgeye ${cnt} kişiyle geldi. Yoğun baskı devam ediyor.`
      : `The enemy pushed with ${cnt} players. Heavy pressure continues.`;
  } else if (Number(cnt) <= 2) {
    habit = isTr
      ? `Düşman ${cnt} kişiyle hareket etti. Temkinli oyun veya lurker paterni.`
      : `Enemy moved with ${cnt} players. Cautious play or lurker pattern.`;
  } else {
    habit = isTr
      ? `Düşman ortalama ${avgEnemy} kişilik gruplarla baskı yapıyor.`
      : `Enemy pressing with groups averaging ${avgEnemy}.`;
  }
  const altLocations = (MAP_LOCATIONS[setup.map] ?? []).filter(
    (x) => x !== loc,
  );
  const suggestedLoc =
    altLocations[Math.floor(Math.random() * altLocations.length)] ||
    loc ||
    "a different position";
  let microPlan: string;
  if (survived && result === "win") {
    microPlan = isTr
      ? "İyi gidiyorsun. Aynı stratejiyi koru, hafif açı değişikliği düşün."
      : "You're doing well. Keep strategy, consider slight angle changes.";
  } else if (survived && result === "loss") {
    microPlan = isTr
      ? "Bireysel olarak iyiydin ama takım kaybetti. Daha erken bilgi ver ve trade pozisyonu kur."
      : "You played well but team lost. Share info earlier and set up trades.";
  } else if (result === "loss" && repeatCount >= 2) {
    microPlan = isTr
      ? `${suggestedLoc} konumunda oyna. Derin açı tut ve ilk bilgiyi bekle.`
      : `Play ${suggestedLoc}. Hold a deep angle and wait for first info.`;
  } else if (result === "loss" && Number(cnt) >= 3) {
    microPlan = isTr
      ? `Retake oyna. ${suggestedLoc} civarında geri dur ve takımını bekle.`
      : `Play retake. Fall back near ${suggestedLoc} and wait for team.`;
  } else if (result === "loss") {
    microPlan = isTr
      ? `${suggestedLoc} konumuna geç. Utility'ni erken kullan ve geri çekil.`
      : `Switch to ${suggestedLoc}. Use utility early and fall back.`;
  } else {
    microPlan = isTr
      ? `Aynı stratejiyi koru ama açını hafifçe değiştir. ${suggestedLoc} iyi alternatif.`
      : `Keep strategy but shift angle. ${suggestedLoc} could be good.`;
  }
  return { mainMistake: mistake, enemyHabit: habit, microPlan };
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
  const allNotes = nonSkipped.map((r) => r.yourNote.toLowerCase()).join(" ");
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
  return {
    summary,
    mistake,
    tendencies,
    adjustment,
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
/* ══════════════════════════════════════════════════════════
   LOCALSTORAGE
   ══════════════════════════════════════════════════════════ */
const LS_KEYS = { draft: "aimlo_draft", lang: "aimlo_lang" };
type DraftState = {
  setup: SetupData;
  setupStep: SetupStep;
  rounds: RoundData[];
  roundIdx: number;
  screen: Screen;
};
function saveDraft(d: DraftState) {
  try {
    localStorage.setItem(LS_KEYS.draft, JSON.stringify(d));
  } catch {}
}
function loadDraft(): DraftState | null {
  try {
    const s = localStorage.getItem(LS_KEYS.draft);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}
function clearDraft() {
  try {
    localStorage.removeItem(LS_KEYS.draft);
  } catch {}
}
function saveLang(l: Lang) {
  try {
    localStorage.setItem(LS_KEYS.lang, l);
  } catch {}
}
function loadLang(): Lang | null {
  try {
    return localStorage.getItem(LS_KEYS.lang) as Lang | null;
  } catch {
    return null;
  }
}
/* ══════════════════════════════════════════════════════════
   DESIGN SYSTEM
   ══════════════════════════════════════════════════════════ */
const ds = {
  card: "rounded-2xl border border-white/[0.07] bg-[#0b1120]/80 shadow-lg shadow-black/25 backdrop-blur-sm",
  cardInner: "p-5 sm:p-6",
  cardHover:
    "transition-all duration-300 hover:border-white/[0.12] hover:bg-[#0e1528]/90 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-950/20",
  inputBase:
    "w-full rounded-xl border border-white/[0.08] bg-[#070c16] px-4 py-3 text-sm text-white outline-none transition-all duration-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 placeholder-neutral-600",
  selectBase:
    "w-full cursor-pointer appearance-none rounded-xl border border-white/[0.08] bg-[#070c16] px-4 py-3 text-sm text-white outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-30",
  btnPrimary:
    "w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-800/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-40",
  btnSecondary:
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.02] py-3 text-sm font-medium text-neutral-400 transition-all duration-200 hover:border-white/[0.14] hover:text-white hover:bg-white/[0.05]",
  btnAccent:
    "w-full rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] py-3 text-sm font-semibold text-cyan-300 transition-all duration-200 hover:bg-cyan-500/[0.1] hover:border-cyan-500/35",
  label:
    "mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500",
  pageBg: "min-h-screen bg-[#050810]",
};
function Label({ text }: { text: string }) {
  return <label className={ds.label}>{text}</label>;
}
function InlineError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-red-400">{msg}</p>;
}
function AmbientBg() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-blue-950/[0.08] blur-[100px]" />
      <div className="absolute -bottom-32 -left-32 h-[300px] w-[300px] rounded-full bg-cyan-950/[0.06] blur-[80px]" />
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
}: {
  user: User;
  lang: Lang;
  onSignOut: () => void;
  onLogoClick: () => void;
  onLangToggle: () => void;
  signOutLabel: string;
  onHome?: () => void;
  homeLabel?: string;
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#050810]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80"
        >
          <AimloLogo size={24} />
          <AimloWordmark size="text-base" />
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
function LandingPage({
  lang,
  user,
  onStartAnalysis,
  onLogin,
  onRegister,
  onLangToggle,
  onDashboard,
  onSignOut,
}: {
  lang: Lang;
  user: User | null;
  onStartAnalysis: () => void;
  onLogin: () => void;
  onRegister: () => void;
  onLangToggle: () => void;
  onDashboard: () => void;
  onSignOut: () => void;
}) {
  const l = t[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const statsReveal = useScrollReveal(0.2);
  const howReveal = useScrollReveal(0.15);
  const diffReveal = useScrollReveal(0.15);
  function scrollTo(id: string) {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <main className={`${ds.pageBg} relative overflow-x-hidden`}>
      <AmbientBg />
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#050810]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <AimloLogo size={26} />
            <AimloWordmark size="text-lg" />
            <span className="hidden sm:inline rounded-md bg-blue-500/10 border border-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-400 uppercase tracking-wider">
              Beta
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {Object.entries(l.landingNav).map(([key, label]) => (
              <button
                key={key}
                onClick={() => scrollTo(`section-${key}`)}
                className="text-[13px] font-medium text-neutral-400 transition-colors duration-200 hover:text-white"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onLangToggle}
              className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold text-neutral-400 transition-all hover:border-white/[0.12] hover:text-white"
            >
              {lang === "tr" ? "TR" : "EN"}
            </button>
            {user ? (
              <>
                <button
                  onClick={onDashboard}
                  className="hidden sm:block rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-[12px] font-bold text-white shadow-md shadow-blue-900/20 transition-all duration-300 hover:shadow-lg hover:brightness-110"
                >
                  {l.goToDashboard}
                </button>
                <span className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400 shrink-0">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="text-[11px] font-semibold text-neutral-300 truncate max-w-[100px]">
                    {user.user_metadata?.username || user.user_metadata?.first_name || user.email?.split("@")[0] || "User"}
                  </span>
                </span>
                <button
                  onClick={onSignOut}
                  className="hidden sm:block rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] font-medium text-neutral-500 transition-all hover:text-red-400 hover:border-red-500/20"
                >
                  {l.authSignOut}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  className="hidden sm:block rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[12px] font-semibold text-neutral-300 transition-all hover:border-white/[0.14] hover:text-white"
                >
                  {l.authLogin}
                </button>
                <button
                  onClick={onRegister}
                  className="hidden sm:block rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-[12px] font-bold text-white shadow-md shadow-blue-900/20 transition-all duration-300 hover:shadow-lg hover:brightness-110"
                >
                  {l.authRegister}
                </button>
              </>
            )}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-neutral-400 hover:text-white transition"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-white/[0.06] bg-[#050810]/95 backdrop-blur-xl px-4 py-4 space-y-3">
            {Object.entries(l.landingNav).map(([key, label]) => (
              <button
                key={key}
                onClick={() => scrollTo(`section-${key}`)}
                className="block w-full text-left text-sm text-neutral-400 py-2 transition hover:text-white"
              >
                {label}
              </button>
            ))}
            <div className="flex gap-2 pt-2">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setMobileMenu(false);
                      onDashboard();
                    }}
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-2.5 text-sm font-bold text-white"
                  >
                    {l.goToDashboard}
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenu(false);
                      onSignOut();
                    }}
                    className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-medium text-neutral-400"
                  >
                    {l.authSignOut}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenu(false);
                      onLogin();
                    }}
                    className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-semibold text-neutral-300"
                  >
                    {l.authLogin}
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenu(false);
                      onRegister();
                    }}
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-2.5 text-sm font-bold text-white"
                  >
                    {l.authRegister}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      <section className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pt-32 sm:pt-40 pb-20 sm:pb-28 text-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/[0.05] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
              AI-Powered Coaching
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            {l.landingHeroTitle}
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-neutral-400 leading-relaxed">
            {l.landingHeroSub}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={user ? onDashboard : onStartAnalysis}
              className="group rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-900/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-800/30 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {user ? l.goToDashboard : l.landingCTA}
              <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
                {IC.arrow}
              </span>
            </button>
            {!user && (
              <button
                onClick={onLogin}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-8 py-4 text-base font-semibold text-neutral-300 transition-all duration-200 hover:border-white/[0.14] hover:text-white"
              >
                {l.authLogin}
              </button>
            )}
          </div>
        </div>
      </section>
      <section className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {l.landingFeatures.map((f, i) => (
            <div
              key={i}
              className={`${ds.card} ${ds.cardInner} ${ds.cardHover} text-center`}
            >
              <div className="relative mx-auto mb-4">
                <div className="absolute inset-0 m-auto h-12 w-12 rounded-xl bg-blue-500/[0.12] blur-xl" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/[0.12] to-cyan-500/[0.08] border border-blue-500/15 shadow-lg shadow-blue-900/10">
                  <FeatureIcon icon={f.icon} />
                </div>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
              <p className="text-[12px] text-neutral-500 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section
        ref={howReveal.ref}
        className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pb-24"
      >
        <h2
          className={`text-2xl sm:text-3xl font-extrabold text-white mb-10 text-center transition-all duration-700 ${howReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          {l.landingHowTitle}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {l.landingHowSteps.map((s, i) => (
            <div
              key={i}
              className={`${ds.card} ${ds.cardInner} text-center transition-all duration-700 ${howReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="relative mx-auto mb-4">
                <div className="absolute inset-0 m-auto h-10 w-10 rounded-full bg-blue-500/20 blur-lg" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 shadow-lg shadow-blue-900/25 ring-1 ring-white/10">
                  {i === 0 && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        strokeWidth="0"
                        fill="rgba(255,255,255,0.15)"
                      />
                      <path d="M12 6v6l4 2" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  )}
                  {i === 1 && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  )}
                  {i === 2 && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  )}
                  {i === 3 && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0b1120] ring-2 ring-blue-500/30 text-[9px] font-bold text-blue-400">
                  {s.step}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{s.title}</h3>
              <p className="text-[12px] text-neutral-500 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section
        id="section-about"
        className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-20"
      >
        <div className={`${ds.card} overflow-hidden`}>
          <div className="p-8 sm:p-12 space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                {l.landingAboutTitle}
              </h2>
              <p className="text-base text-neutral-400 leading-relaxed max-w-3xl">
                {l.landingAboutText}
              </p>
              <p className="text-base text-neutral-400 leading-relaxed max-w-3xl mt-3">
                {l.landingAboutMission}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-5 pt-4">
              <div className="relative rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-cyan-500/[0.04] to-transparent p-7 transition-all duration-300 hover:border-cyan-500/20 hover:from-cyan-500/[0.07] group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.04] rounded-full blur-[60px] group-hover:bg-cyan-500/[0.08] transition-all duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/15 shadow-lg shadow-cyan-900/10">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-cyan-400"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {l.landingB2CTitle}
                      </h3>
                      <p className="text-[10px] text-cyan-400/70 font-medium uppercase tracking-wider">
                        {lang === "tr"
                          ? "Kendi hızında ilerle"
                          : "Progress at your pace"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {l.landingB2CText}
                  </p>
                </div>
              </div>
              <div className="relative rounded-2xl border border-blue-500/10 bg-gradient-to-br from-blue-500/[0.04] to-transparent p-7 transition-all duration-300 hover:border-blue-500/20 hover:from-blue-500/[0.07] group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.04] rounded-full blur-[60px] group-hover:bg-blue-500/[0.08] transition-all duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/15 shadow-lg shadow-blue-900/10">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-blue-400"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {l.landingB2BTitle}
                      </h3>
                      <p className="text-[10px] text-blue-400/70 font-medium uppercase tracking-wider">
                        {lang === "tr"
                          ? "Veriye dayalı kararlar"
                          : "Data-driven decisions"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {l.landingB2BText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        ref={diffReveal.ref}
        className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pb-24"
      >
        <h2
          className={`text-2xl sm:text-3xl font-extrabold text-white mb-10 text-center transition-all duration-700 ${diffReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          {lang === "tr" ? "Neden " : "Why "}
          <AimloWordmark size="text-2xl sm:text-3xl" className="inline" />?
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {l.landingDiffItems.map((item, i) => (
            <div
              key={i}
              className={`${ds.card} ${ds.cardInner} border-t-2 border-t-blue-500/20 transition-all duration-700 ${diffReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <h3 className="text-base font-bold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section
        id="section-blog"
        className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 pb-24"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-8 text-center">
          {l.landingBlogTitle}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Agents — 5 agent portraits composite */}
          <a
            href="https://playvalorant.com/en-us/agents/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${ds.card} overflow-hidden group cursor-pointer ${ds.cardHover}`}
          >
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#0d1a2d] to-[#0b1120]">
              <div className="absolute inset-0 flex items-center justify-center gap-[-8px]">
                {[
                  "add6443a-41bd-e414-f6ad-e58d267f4e95",
                  "a3bfb853-43b2-7238-a4f1-ad90e9e46bcc",
                  "569fdd95-4d10-43ab-ca70-79becc718b46",
                  "dade69b4-4f5a-8528-247b-219e5a1facd6",
                  "8e253930-4c05-31dd-1b6c-968525494517",
                ].map((id, i) => (
                  <img
                    key={id}
                    src={`https://media.valorant-api.com/agents/${id}/displayicon.png`}
                    alt=""
                    className="h-20 w-20 object-contain opacity-50 group-hover:opacity-75 transition-all duration-500"
                    style={{
                      marginLeft: i > 0 ? "-12px" : "0",
                      zIndex: 5 - i,
                      filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
                    }}
                    loading="lazy"
                  />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/30 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-2">
                <span className="rounded-md bg-cyan-500/20 border border-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
                  {lang === "tr" ? "Rehber" : "Guide"}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                {lang === "tr" ? "Tüm Ajanlar" : "All Agents"}
              </h3>
              <p className="text-[12px] text-neutral-500 leading-relaxed">
                {lang === "tr"
                  ? "Her ajanın yetenekleri, rolleri ve en iyi stratejileri"
                  : "Abilities, roles, and best strategies for every agent"}
              </p>
            </div>
          </a>
          {/* Weapons — Vandal display icon */}
          <a
            href="https://playvalorant.com/en-us/arsenal/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${ds.card} overflow-hidden group cursor-pointer ${ds.cardHover}`}
          >
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#1a1510] to-[#0b1120]">
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src="https://media.valorant-api.com/weapons/9c82e19d-4575-0200-1a81-3eacf00cf872/displayicon.png"
                  alt="Vandal"
                  className="h-24 w-auto object-contain opacity-45 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                  style={{
                    filter: "drop-shadow(0 4px 16px rgba(245,158,11,0.15))",
                  }}
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/20 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <span className="rounded-md bg-amber-500/20 border border-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                  {lang === "tr" ? "Cephanelik" : "Arsenal"}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">
                {lang === "tr" ? "Tüm Silahlar" : "All Weapons"}
              </h3>
              <p className="text-[12px] text-neutral-500 leading-relaxed">
                {lang === "tr"
                  ? "Silah istatistikleri, hasar değerleri ve spray pattern rehberi"
                  : "Weapon stats, damage values, and spray pattern guide"}
              </p>
            </div>
          </a>
          {/* Patch Notes — map splash background */}
          <a
            href="https://playvalorant.com/en-us/news/game-updates/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${ds.card} overflow-hidden group cursor-pointer ${ds.cardHover}`}
          >
            <div className="relative h-40 overflow-hidden">
              <img
                src="https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png"
                alt="Patch Notes"
                className="h-full w-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/40 to-purple-900/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-2xl bg-purple-500/10 border border-purple-500/15 p-3 backdrop-blur-sm group-hover:bg-purple-500/15 transition-all duration-300">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-purple-400"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-3 left-4">
                <span className="rounded-md bg-purple-500/20 border border-purple-500/20 px-2 py-0.5 text-[9px] font-bold text-purple-400 uppercase tracking-wider">
                  {lang === "tr" ? "Güncelleme" : "Updates"}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                {lang === "tr" ? "Son Patch Notları" : "Latest Patch Notes"}
              </h3>
              <p className="text-[12px] text-neutral-500 leading-relaxed">
                {lang === "tr"
                  ? "Valorant'ın en son değişiklikleri, denge ayarları ve yenilikler"
                  : "Latest Valorant changes, balance updates, and new features"}
              </p>
            </div>
          </a>
        </div>
      </section>
      <section
        id="section-faq"
        className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 pb-24"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-8 text-center">
          {l.landingFaqTitle}
        </h2>
        <div className="space-y-2.5">
          {l.landingFaqs.map((faq, i) => (
            <div key={i} className={`${ds.card} overflow-hidden`}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-sm font-semibold text-white pr-4">
                  {faq.q}
                </span>
                <span
                  className={`shrink-0 text-neutral-500 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className={`${ds.card} ${ds.cardInner} text-center mt-6`}>
          <p className="text-sm text-neutral-400 mb-3">{l.landingHelpText}</p>
          <a
            href="mailto:support@aimlo.gg"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500/[0.06] border border-blue-500/15 px-5 py-2.5 text-sm font-semibold text-blue-400 transition-all hover:bg-blue-500/[0.1]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {l.landingHelpEmail}
          </a>
        </div>
      </section>
      <section
        ref={statsReveal.ref}
        className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pb-24"
      >
        <h2
          className={`text-2xl sm:text-3xl font-extrabold text-white mb-10 text-center transition-all duration-700 ${statsReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          {l.landingStatsTitle}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {l.landingStats.map((stat, i) => (
            <div
              key={i}
              className={`${ds.card} p-6 sm:p-8 text-center transition-all duration-700 ${statsReveal.visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <p className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 pb-24 text-center">
        <div className={`${ds.card} p-8 sm:p-12 overflow-hidden relative`}>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-600/[0.04] to-cyan-500/[0.03]" />
          <div className="relative space-y-6">
            <AimloWordmark size="text-3xl" className="block" />
            <p className="text-base text-neutral-400 max-w-lg mx-auto">
              {l.landingHeroSub}
            </p>
            <button
              onClick={user ? onDashboard : onStartAnalysis}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-900/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {user ? l.goToDashboard : l.landingCTA}
            </button>
          </div>
        </div>
      </section>
      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <AimloLogo size={22} className="opacity-50" />
                <AimloWordmark size="text-base" className="opacity-50" />
              </div>
              <p className="text-[11px] text-neutral-600 max-w-xs text-center md:text-left">
                {lang === "tr"
                  ? "Yapay zeka destekli Valorant koçluk platformu."
                  : "AI-powered Valorant coaching platform."}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="mailto:support@aimlo.gg"
                className="text-[11px] text-neutral-500 hover:text-white transition-colors"
              >
                support@aimlo.gg
              </a>
              <button
                onClick={() =>
                  document
                    .getElementById("section-about")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-[11px] text-neutral-500 hover:text-white transition-colors"
              >
                {l.landingNav.about}
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("section-faq")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-[11px] text-neutral-500 hover:text-white transition-colors"
              >
                {l.landingNav.faq}
              </button>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/[0.04] text-center">
            <p className="text-[10px] text-neutral-700">
              {IC.copy} 2025 AIMLO. All rights reserved.
            </p>
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
      <main className={`${ds.pageBg} flex items-center justify-center px-4`}>
        <AmbientBg />
        <div className="relative z-10 w-full max-w-sm space-y-8 text-center">
          <AimloLogo size={56} className="mx-auto" />
          <AimloWordmark size="text-3xl" className="block" />
          <div className={`${ds.card} p-8 space-y-5`}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/[0.08] border border-blue-500/10">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-blue-400"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {al.authCheckEmail}
            </p>
            <button
              onClick={() => {
                setCheckEmail(false);
                setMode("login");
              }}
              className={ds.btnSecondary}
            >
              {al.authLogin}
            </button>
          </div>
        </div>
      </main>
    );
  return (
    <main
      className={`${ds.pageBg} relative flex items-center justify-center px-4 py-12 overflow-hidden`}
    >
      <AmbientBg />
      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <button
            onClick={onBackToLanding}
            className="mx-auto flex items-center gap-2 text-[11px] text-neutral-500 transition hover:text-white mb-4"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {al.back}
          </button>
          <AimloLogo size={72} className="mx-auto" />
          <div>
            <AimloWordmark size="text-4xl" className="block" />
            <p className="mt-2 text-sm text-neutral-500">{al.tagline}</p>
          </div>
        </div>
        <div className={`${ds.card} p-6 sm:p-8 space-y-6`}>
          <div className="text-center">
            <h2 className="text-lg font-bold text-white">
              {mode === "login" ? al.authLogin : al.authRegister}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label text={al.authFirstName} />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={al.authFirstNamePh}
                      required
                      className={ds.inputBase}
                    />
                  </div>
                  <div>
                    <Label text={al.authLastName} />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={al.authLastNamePh}
                      required
                      className={ds.inputBase}
                    />
                  </div>
                </div>
                <div>
                  <Label text={al.authUsername} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                      )
                    }
                    placeholder={al.authUsernamePh}
                    required
                    className={ds.inputBase}
                  />
                </div>
              </>
            )}
            <div>
              <Label
                text={mode === "login" ? al.authEmailOrUsername : al.authEmail}
              />
              <input
                type={mode === "register" ? "email" : "text"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  mode === "login" ? al.authEmailOrUsernamePh : al.authEmailPh
                }
                required
                className={ds.inputBase}
              />
            </div>
            <div>
              <Label text={al.authPassword} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={al.authPasswordPh}
                required
                minLength={6}
                className={ds.inputBase}
              />
            </div>
            {mode === "register" && (
              <div>
                <Label text={al.authPasswordConfirm} />
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder={al.authPasswordConfirmPh}
                  required
                  minLength={6}
                  className={ds.inputBase}
                />
              </div>
            )}
            {error && (
              <div className="rounded-xl bg-red-500/[0.06] border border-red-500/10 px-4 py-3">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading} className={ds.btnPrimary}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {al.authLoading}
                </span>
              ) : mode === "login" ? (
                al.authLogin
              ) : (
                al.authRegister
              )}
            </button>
          </form>
          <p className="text-center text-xs text-neutral-500">
            {mode === "login" ? al.authNoAccount : al.authHasAccount}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              className="text-blue-400 hover:text-blue-300 transition font-semibold"
            >
              {mode === "login" ? al.authRegister : al.authLogin}
            </button>
          </p>
        </div>
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
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (verified === "true") {
      setVerifiedBanner("success");
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
      // Auto-hide after 6 seconds
      setTimeout(() => setVerifiedBanner(null), 6000);
    } else if (verified === "error") {
      setVerifiedBanner("error");
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(() => setVerifiedBanner(null), 6000);
    }
  }, []);
  // ALL hooks must be above early returns — React rules of hooks
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
  useEffect(() => {
    setSetup((prev) => {
      const comp = [...prev.teamComp];
      if (prev.agent) {
        const idx = comp.indexOf(prev.agent);
        if (idx > 0) comp.splice(idx, 1);
        comp[0] = prev.agent;
        return {
          ...prev,
          teamComp: [prev.agent, ...comp.filter((a) => a && a !== prev.agent)],
        };
      } else {
        if (comp.length > 0 && comp[0]) comp[0] = "";
        return { ...prev, teamComp: comp.filter((a) => a) };
      }
    });
  }, [setup.agent]);
  if (authLoading || !lang)
    return (
      <main className={`${ds.pageBg} flex items-center justify-center`}>
        <AmbientBg />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <AimloLogo size={48} className="animate-pulse" />
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      </main>
    );
  // ── Email verification banner (shows on any screen) ──
  const VerifiedBanner = verifiedBanner ? (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-300 ${
        verifiedBanner === "success"
          ? "bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300"
          : "bg-red-500/20 border-b border-red-500/30 text-red-300"
      }`}
    >
      <span>
        {verifiedBanner === "success"
          ? lang === "tr"
            ? "✓ E-posta başarıyla doğrulandı! Artık giriş yapabilirsiniz."
            : "✓ Email verified successfully! You can now sign in."
          : lang === "tr"
            ? "✕ E-posta doğrulama başarısız oldu. Lütfen tekrar deneyin."
            : "✕ Email verification failed. Please try again."}
      </span>
      <button
        onClick={() => setVerifiedBanner(null)}
        className="ml-2 rounded-md px-2 py-0.5 text-xs opacity-70 hover:opacity-100 transition"
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
  const finishLockRef = useRef(false);
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
  };
  /* DASHBOARD */
  if (screen === "dashboard")
    return (
      <main className={ds.pageBg}>
        <AmbientBg />
        <Navbar {...navProps} />
        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-20 pb-12 space-y-6">
          <button
            onClick={resetForNewMatch}
            className={`w-full group ${ds.card} ${ds.cardHover} overflow-hidden`}
          >
            <div className="p-5 sm:p-6 flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 m-auto h-12 w-12 rounded-2xl bg-blue-500/25 blur-xl group-hover:bg-blue-500/35 transition-all duration-500" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 shadow-lg shadow-blue-900/30 group-hover:scale-105 group-hover:shadow-xl transition-all duration-300 ring-1 ring-white/10">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      opacity="0.2"
                      fill="white"
                      strokeWidth="0"
                    />
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10"
                      strokeWidth="0"
                    />
                    <polygon points="10 8 16 12 10 16 10 8" fill="white" />
                  </svg>
                </div>
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-white">
                  {l.dashNewMatch}
                </h2>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {l.dashNewMatchDesc}
                </p>
              </div>
              <div className="ml-auto text-neutral-600 group-hover:text-blue-400 transition-colors duration-200 text-lg">
                {IC.arrow}
              </div>
            </div>
          </button>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label={l.dashWinRate}
              value={savedReports.length > 0 ? `${winRate}%` : "\u2014"}
              color={
                winRate >= 50
                  ? "text-emerald-400"
                  : winRate > 0
                    ? "text-red-400"
                    : "text-neutral-600"
              }
            />
            <StatCard
              label={l.dashMatches}
              value={String(savedReports.length)}
              sub={
                savedReports.length > 0
                  ? `${savedReports.filter((r) => r.won).length}W ${savedReports.filter((r) => !r.won).length}L`
                  : undefined
              }
            />
            <StatCard
              label={l.dashFreqDeath}
              value={topDeathSpot ? topDeathSpot[0] : "\u2014"}
              color={topDeathSpot ? "text-amber-400" : "text-neutral-600"}
              sub={topDeathSpot ? `${topDeathSpot[1]}x` : l.dashNoStats}
            />
            {/* Top Agent Card */}
            <div className={`${ds.card} p-4 sm:p-5 text-center`}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-1.5">
                {l.dashTopAgent}
              </p>
              {topAgent ? (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="h-8 w-8 rounded-lg overflow-hidden bg-black/20 ring-1 ring-white/[0.06]">
                    <img
                      src={agentImgUrl(topAgent.name)}
                      alt={topAgent.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-sm font-extrabold text-cyan-400">
                    {topAgent.name}
                  </p>
                  <p className="text-[10px] text-neutral-600 font-medium">
                    {topAgent.count}x
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-extrabold tabular-nums text-neutral-600">
                  {"\u2014"}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-500">
                {l.dashRecentTitle}
              </h3>
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
              <div className={`${ds.card} p-8 flex justify-center`}>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              </div>
            ) : savedReports.length === 0 ? (
              <div className={`${ds.card} p-10 text-center`}>
                <AimloLogo size={48} className="mx-auto opacity-10 mb-4" />
                <p className="text-sm font-semibold text-neutral-400">
                  {l.dashNoData}
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  {l.dashNoDataDesc}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedReports.slice(0, 5).map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setViewingReport(entry);
                      setScreen("reportDetail");
                    }}
                    className={`w-full text-left ${ds.card} ${ds.cardHover} p-4 flex items-center gap-4`}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-black/20 ring-1 ring-white/[0.06]">
                      <img
                        src={MAP_IMAGES[entry.map]}
                        alt={entry.map}
                        className="h-full w-full object-cover opacity-75"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {entry.map}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {entry.agent}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-neutral-600">
                        {entry.date}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-white">
                        {entry.score}
                      </p>
                      <p
                        className={`text-[10px] font-bold uppercase ${entry.won ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {entry.won ? l.victory : l.defeat}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  /* HISTORY */
  if (screen === "history")
    return (
      <main className={ds.pageBg}>
        <AmbientBg />
        <Navbar {...navProps} />
        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-20 pb-12 space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setScreen("dashboard")}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-400 transition hover:text-white"
            >
              {"\u2190"} {l.back}
            </button>
            <h2 className="text-lg font-bold text-white">{l.historyTitle}</h2>
            {savedReports.length > 0 && (
              <span className="ml-auto text-xs text-neutral-500">
                {l.dashWinRate}:{" "}
                <span
                  className={
                    winRate >= 50
                      ? "text-emerald-400 font-bold"
                      : "text-red-400 font-bold"
                  }
                >
                  {winRate}%
                </span>{" "}
                {IC.dot} {savedReports.length} {l.dashMatches.toLowerCase()}
              </span>
            )}
          </div>
          {savedReports.length === 0 ? (
            <div className={`${ds.card} p-12 text-center`}>
              <AimloLogo size={48} className="mx-auto opacity-10 mb-4" />
              <p className="text-sm text-neutral-400">{l.historyEmpty}</p>
              <p className="mt-1 text-xs text-neutral-600">
                {l.historyEmptyDesc}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedReports.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    setViewingReport(entry);
                    setScreen("reportDetail");
                  }}
                  className={`w-full text-left ${ds.card} ${ds.cardHover} p-4 sm:p-5 flex items-center gap-4`}
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-black/20 ring-1 ring-white/[0.06]">
                    <img
                      src={MAP_IMAGES[entry.map]}
                      alt={entry.map}
                      className="h-full w-full object-cover opacity-75"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">
                        {entry.map}
                      </span>
                      <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                        {entry.agent}
                      </span>
                      <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] text-neutral-500">
                        {entry.side === "attack" ? l.sideAttack : l.sideDefense}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-600">
                      {entry.date}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-extrabold text-white">
                      {entry.score}
                    </p>
                    <p
                      className={`text-[10px] font-bold uppercase ${entry.won ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {entry.won ? l.victory : l.defeat}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  /* REPORT DETAIL */
  if (screen === "reportDetail" && viewingReport) {
    const vr = viewingReport;
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
          <div className={`${ds.card} overflow-hidden`}>
            <div className="relative p-6">
              <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
                <img
                  src={MAP_IMAGES[vr.map]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="relative flex items-end justify-between">
                <div>
                  <p className={ds.label}>{l.matchResult}</p>
                  <p className="mt-1 text-4xl font-extrabold tracking-tight text-white">
                    {vr.score}
                  </p>
                  <p
                    className={`mt-1 text-xs font-bold uppercase ${vr.won ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {vr.won ? l.victory : l.defeat}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[11px] text-neutral-500">
                    {vr.map} {IC.dot} {vr.agent}
                  </p>
                  <p className="text-[11px] text-neutral-600">{vr.date}</p>
                  <p className="text-lg font-extrabold text-blue-400">
                    {vr.winPct}%
                  </p>
                </div>
              </div>
              <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                  style={{ width: `${vr.winPct}%` }}
                />
              </div>
              <div className="relative mt-3 grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wider">
                <div>
                  <span className="text-neutral-500">{l.enteredRounds}</span>
                  <br />
                  <span className="text-white text-sm">{vr.totalRounds}</span>
                </div>
                <div>
                  <span className="text-neutral-500">{l.roundsWon}</span>
                  <br />
                  <span className="text-emerald-400 text-sm">
                    {vr.roundsWon}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">{l.roundsLost}</span>
                  <br />
                  <span className="text-red-400 text-sm">{vr.roundsLost}</span>
                </div>
                <div>
                  <span className="text-neutral-500">{l.roundsSkipped}</span>
                  <br />
                  <span className="text-neutral-400 text-sm">
                    {vr.roundsSkipped}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {vr.rounds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center">
              {vr.rounds.map((r, i) => (
                <span
                  key={i}
                  className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase border ${r.result === "win" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-red-500/10 text-red-400 border-red-500/10"} ${r.skipped ? "opacity-40" : ""}`}
                >
                  R{r.roundNumber}{" "}
                  {r.result === "win" ? l.wonLabel : l.lostLabel}
                  {r.skipped ? l.skippedLabel : ""}
                </span>
              ))}
            </div>
          )}
          <div className="space-y-4">
            <ReportCard
              icon={IC.diamond}
              color="text-cyan-400"
              label={l.overallSummary}
              text={vr.summary}
            />
            <ReportCard
              icon={IC.cross}
              color="text-red-400"
              label={l.mainRecurringMistake}
              text={vr.mistake}
            />
            <ReportCard
              icon={IC.circle}
              color="text-amber-400"
              label={l.enemyTendencies}
              text={vr.tendencies}
            />
            <ReportCard
              icon={IC.play}
              color="text-emerald-400"
              label={l.suggestedAdjustment}
              text={vr.adjustment}
            />
          </div>
          <div className="space-y-3">
            <button onClick={resetForNewMatch} className={ds.btnPrimary}>
              {l.newMatch}
            </button>
            <button
              onClick={() => setScreen("dashboard")}
              className={ds.btnSecondary}
            >
              {l.returnToMenu}
            </button>
          </div>
        </div>
      </main>
    );
  }
  /* SETUP */
  if (screen === "setup") {
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
  /* ROUND */
  if (screen === "round") {
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
    const submitLockRef = useRef(false);
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
                    label={l.mainMistake}
                    text={currentFeedback.mainMistake}
                  />
                  <FeedbackCard
                    icon={IC.circle}
                    color="text-amber-400"
                    label={l.enemyHabit}
                    text={currentFeedback.enemyHabit}
                  />
                  <FeedbackCard
                    icon={IC.bolt}
                    color="text-cyan-400"
                    label={l.microPlan}
                    text={currentFeedback.microPlan}
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
  /* SCORE INPUT */
  if (screen === "scoreInput")
    return (
      <main
        className={`${ds.pageBg} relative flex items-center justify-center px-4`}
      >
        <MapBg map={setup.map} />
        <div className="relative z-10 w-full max-w-md space-y-8">
          <div className="text-center space-y-1">
            <AimloLogo size={36} className="mx-auto opacity-40 mb-2" />
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
          <AimloLogo size={48} className="animate-pulse" />
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
