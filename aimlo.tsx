"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

type Lang = "tr" | "en";
type Screen = "lang" | "dashboard" | "setup" | "round" | "scoreInput" | "report" | "history" | "reportDetail";
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
   BRAND — public/aimlo-logo.png
   ══════════════════════════════════════════════════════════ */

const AIMLO_LOGO_SRC = "/aimlo-logo.png?v=5d2fb8b5";

function AimloLogo({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={AIMLO_LOGO_SRC}
      alt="Aimlo"
      style={{ height: size, width: "auto", maxWidth: `min(88vw, ${Math.round(size * 3)}px)` }}
      className={`object-contain object-left shrink-0 ${className}`}
      draggable={false}
    />
  );
}

/* ══════════════════════════════════════════════════════════
   AGENTS
   ══════════════════════════════════════════════════════════ */

const AGENT_GROUPS: Record<string, string[]> = {
  Controllers: ["Brimstone", "Viper", "Omen", "Astra", "Harbor", "Clove"],
  Duelists: ["Jett", "Raze", "Reyna", "Phoenix", "Yoru", "Neon", "Iso", "Waylay"],
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
  Ascent: ["A Main", "A Short", "A Site", "A Heaven", "B Main", "B Site", "B Market", "Mid Top", "Mid Bottom", "Mid Cubby", "Tree", "CT Spawn", "Garden"],
  Bind: ["A Short", "A Bath", "A Site", "A Lamps", "A Tower", "B Long", "B Short", "B Site", "B Elbow", "B Garden", "B Hall", "Hookah", "CT Spawn"],
  Haven: ["A Main", "A Short", "A Site", "A Sewer", "B Main", "B Site", "B Back", "C Main", "C Long", "C Site", "C Cubby", "Garage", "Mid Window", "CT Spawn"],
  Split: ["A Main", "A Ramp", "A Rafters", "A Site", "A Heaven", "B Main", "B Heaven", "B Site", "B Back", "Mid Vent", "Mid Mail", "Mid Top", "CT Spawn"],
  Lotus: ["A Main", "A Root", "A Site", "A Rubble", "A Tree", "B Main", "B Upper", "B Site", "B Pillar", "C Main", "C Mound", "C Site", "C Hall", "CT Spawn"],
  Sunset: ["A Main", "A Elbow", "A Site", "A Alley", "B Main", "B Market", "B Site", "B Boba", "Mid Top", "Mid Bottom", "Mid Courtyard", "CT Spawn"],
  Icebox: ["A Main", "A Belt", "A Site", "A Nest", "A Pipes", "B Main", "B Orange", "B Site", "B Green", "B Yellow", "Mid Boiler", "Mid Blue", "CT Spawn"],
  Breeze: ["A Main", "A Hall", "A Site", "A Cave", "A Bridge", "B Main", "B Elbow", "B Site", "B Back", "Mid Pillar", "Mid Nest", "CT Spawn"],
  Fracture: ["A Main", "A Dish", "A Site", "A Drop", "A Rope", "B Main", "B Arcade", "B Site", "B Tree", "B Tower", "Mid Hall", "CT Spawn"],
  Pearl: ["A Main", "A Art", "A Site", "A Dugout", "B Main", "B Long", "B Site", "B Hall", "B Link", "Mid Plaza", "Mid Top", "CT Spawn"],
  Abyss: ["A Main", "A Short", "A Site", "A Ramp", "B Main", "B Site", "B Tower", "B Ramp", "Mid Link", "Mid Bridge", "CT Spawn"],
};

const MAPS = Object.keys(MAP_LOCATIONS);

const MAP_IMAGES: Record<string, string> = {
  Ascent: "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png",
  Bind: "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png",
  Haven: "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png",
  Split: "https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png",
  Lotus: "https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/splash.png",
  Sunset: "https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/splash.png",
  Icebox: "https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/splash.png",
  Breeze: "https://media.valorant-api.com/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/splash.png",
  Fracture: "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png",
  Pearl: "https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/splash.png",
  Abyss: "https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/splash.png",
};

/* ══════════════════════════════════════════════════════════
   SCORE OPTIONS
   ══════════════════════════════════════════════════════════ */

const SCORE_OPTIONS = [
  "13 - 0", "13 - 1", "13 - 2", "13 - 3", "13 - 4", "13 - 5",
  "13 - 6", "13 - 7", "13 - 8", "13 - 9", "13 - 10", "13 - 11",
  "14 - 12", "13 - 12",
  "12 - 14", "12 - 13",
  "11 - 13", "10 - 13", "9 - 13", "8 - 13", "7 - 13", "6 - 13",
  "5 - 13", "4 - 13", "3 - 13", "2 - 13", "1 - 13", "0 - 13",
];

/* ══════════════════════════════════════════════════════════
   AUTH ERROR LOCALIZATION
   ══════════════════════════════════════════════════════════ */

function localizeAuthError(msg: string, lang: Lang): string {
  if (lang !== "tr") return msg;
  const map: Record<string, string> = {
    "Invalid login credentials": "Geçersiz e-posta veya şifre",
    "Email not confirmed": "E-posta adresi henüz doğrulanmadı",
    "User already registered": "Bu e-posta zaten kayıtlı",
    "Password should be at least 6 characters": "Şifre en az 6 karakter olmalı",
    "Unable to validate email address: invalid format": "Geçersiz e-posta formatı",
    "Signup requires a valid password": "Geçerli bir şifre girin",
    "Email rate limit exceeded": "Çok fazla deneme. Lütfen bekleyin.",
    "For security purposes, you can only request this after 60 seconds": "Güvenlik nedeniyle 60 saniye beklemelisiniz",
    "Too many requests": "Çok fazla istek. Lütfen bekleyin.",
    "Network error": "Bağlantı hatası. İnterneti kontrol edin.",
  };
  for (const [key, val] of Object.entries(map)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return msg;
}

/* ══════════════════════════════════════════════════════════
   i18n
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
    yourNotePh: "ör. rotate oldum, solo anchor oynuyordum, trade bekliyordum…",
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
    noteTooShort: "En az 10 karakter girin",
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
    authPasswordPh: "••••••••",
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
    yourNotePh: "e.g. rotated too early, solo anchoring, expected trade…",
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
    noteTooShort: "Enter at least 10 characters",
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
    authPasswordPh: "••••••••",
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
  },
};

/* ══════════════════════════════════════════════════════════
   ROUND FEEDBACK GENERATOR
   ══════════════════════════════════════════════════════════ */

function genRoundFeedback(setup: SetupData, form: RoundForm, result: RoundResult, allRounds: RoundData[], lang: Lang, survived: boolean): RoundFeedback {
  const isTr = lang === "tr";
  const loc = form.deathLocation;
  const cnt = form.enemyCount;
  const note = form.yourNote.toLowerCase();
  const sideLabel = isTr ? (setup.side === "attack" ? "saldırı" : "savunma") : (setup.side === "attack" ? "attack" : "defense");
  const prevDeaths = allRounds.filter((r) => !r.skipped && !r.survived && r.deathLocation === loc);
  const repeatCount = prevDeaths.length;

  let mistake: string;
  if (survived) {
    mistake = result === "win"
      ? (isTr ? `Hayatta kaldın ve round kazanıldı. İyi iş! Pozisyonunu korumaya devam et.` : `You survived and won. Good job! Keep holding your position.`)
      : (isTr ? `Hayatta kaldın ama round kaybedildi. Takım koordinasyonunu gözden geçir.` : `You survived but the round was lost. Review team coordination.`);
  } else if (repeatCount >= 2) {
    mistake = isTr
      ? `${loc} konumunda daha önce ${repeatCount} kez öldün. Farklı bir açıya geçmeyi düşün.`
      : `You've died at ${loc} ${repeatCount} times before. Consider switching to a different angle.`;
  } else if (Number(cnt) >= 3) {
    mistake = isTr
      ? `${loc} konumunda ${cnt} düşmana karşı sayısal dezavantajdaydın. Geri çekilip bilgi vermeliydin.`
      : `You faced ${cnt} enemies at ${loc}. Fall back and call info.`;
  } else if (note.includes("rotate") || note.includes("rotasyon") || note.includes("döndüm")) {
    mistake = isTr
      ? `Rotasyonun ${loc} bölgesinde seni açık bıraktı. ${sideLabel} tarafında erken rotasyon düşmana kolay entry verir.`
      : `Your rotation left you exposed at ${loc}. On ${sideLabel}, rotating early gives easy entry.`;
  } else if (note.includes("solo") || note.includes("tek")) {
    mistake = isTr
      ? `${loc} bölgesinde solo oynaman riskli oldu. Takım desteği olmadan tutunamaman normal.`
      : `Playing solo at ${loc} was risky. It's expected to struggle without team support.`;
  } else if (note.includes("util") || note.includes("ability") || note.includes("yetenek")) {
    mistake = isTr
      ? `Utility sonrası ${loc} konumunda savunmasız kaldın. Util sonrası kısa bekleme ekle.`
      : `After using utility you were vulnerable at ${loc}. Add a short delay after ability usage.`;
  } else {
    mistake = isTr
      ? `${loc} konumunda pozisyonun ${sideLabel} tarafı için ideal değildi. Daha korunaklı bir açı seçmeliydin.`
      : `Your position at ${loc} wasn't ideal for ${sideLabel}. Choose a more covered angle.`;
  }

  const avgEnemy = allRounds.length > 0
    ? (allRounds.filter((r) => !r.skipped).reduce((s, r) => s + Number(r.enemyCount || 0), 0) / Math.max(allRounds.filter((r) => !r.skipped).length, 1)).toFixed(1)
    : cnt || "0";

  let habit: string;
  if (survived && !cnt) {
    habit = isTr ? `Düşman hareket kalıplarını izlemeye devam et.` : `Keep observing enemy movement patterns.`;
  } else if (Number(cnt) >= 4) {
    habit = isTr ? `Düşman bu bölgeye ${cnt} kişiyle geldi. Yoğun baskı devam ediyor.` : `The enemy pushed with ${cnt} players. Heavy pressure continues.`;
  } else if (Number(cnt) <= 2) {
    habit = isTr ? `Düşman ${cnt} kişiyle hareket etti. Temkinli oyun veya lurker paterni.` : `Enemy moved with ${cnt} players. Cautious play or lurker pattern.`;
  } else {
    habit = isTr ? `Düşman ortalama ${avgEnemy} kişilik gruplarla baskı yapıyor.` : `Enemy pressing with groups averaging ${avgEnemy}.`;
  }

  const altLocations = (MAP_LOCATIONS[setup.map] ?? []).filter((x) => x !== loc);
  const suggestedLoc = altLocations[Math.floor(Math.random() * altLocations.length)] || loc || "a different position";

  let microPlan: string;
  if (survived && result === "win") {
    microPlan = isTr ? `İyi gidiyorsun. Aynı stratejiyi koru, hafif açı değişikliği düşün.` : `You're doing well. Keep strategy, consider slight angle changes.`;
  } else if (survived && result === "loss") {
    microPlan = isTr ? `Bireysel olarak iyiydin ama takım kaybetti. Daha erken bilgi ver ve trade pozisyonu kur.` : `You played well but team lost. Share info earlier and set up trades.`;
  } else if (result === "loss" && repeatCount >= 2) {
    microPlan = isTr ? `${suggestedLoc} konumunda oyna. Derin açı tut ve ilk bilgiyi bekle.` : `Play ${suggestedLoc}. Hold a deep angle and wait for first info.`;
  } else if (result === "loss" && Number(cnt) >= 3) {
    microPlan = isTr ? `Retake oyna. ${suggestedLoc} civarında geri dur ve takımını bekle.` : `Play retake. Fall back near ${suggestedLoc} and wait for team.`;
  } else if (result === "loss") {
    microPlan = isTr ? `${suggestedLoc} konumuna geç. Utility'ni erken kullan ve geri çekil.` : `Switch to ${suggestedLoc}. Use utility early and fall back.`;
  } else {
    microPlan = isTr ? `Aynı stratejiyi koru ama açını hafifçe değiştir. ${suggestedLoc} iyi alternatif.` : `Keep strategy but shift angle. ${suggestedLoc} could be good.`;
  }

  return { mainMistake: mistake, enemyHabit: habit, microPlan };
}

/* ══════════════════════════════════════════════════════════
   MATCH REPORT GENERATOR
   ══════════════════════════════════════════════════════════ */

function genMatchReport(setup: SetupData, rounds: RoundData[], lang: Lang, score: MatchScore) {
  const isTr = lang === "tr";
  const won = rounds.filter((r) => r.result === "win").length;
  const lost = rounds.filter((r) => r.result === "loss").length;
  const skipped = rounds.filter((r) => r.skipped).length;
  const survivedCount = rounds.filter((r) => r.survived && !r.skipped).length;
  const total = rounds.length;
  const winPct = total > 0 ? Math.round((won / total) * 100) : 0;
  const nonSkipped = rounds.filter((r) => !r.skipped);
  const locationCounts: Record<string, number> = {};
  nonSkipped.filter(r => !r.survived).forEach((r) => { if (r.deathLocation) locationCounts[r.deathLocation] = (locationCounts[r.deathLocation] || 0) + 1; });
  const topLoc = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0];
  const topDeathLoc = topLoc ? topLoc[0] : "N/A";
  const topDeathCount = topLoc ? topLoc[1] : 0;
  const avgEnemy = nonSkipped.length > 0 ? (nonSkipped.reduce((s, r) => s + Number(r.enemyCount || 0), 0) / nonSkipped.length).toFixed(1) : "0";
  const sideLabel = isTr ? (setup.side === "attack" ? "Saldırı" : "Savunma") : (setup.side === "attack" ? "Attack" : "Defense");
  const scoreStr = `${score.yours} - ${score.enemy}`;
  const matchWon = Number(score.yours) > Number(score.enemy);
  const allNotes = nonSkipped.map((r) => r.yourNote.toLowerCase()).join(" ");
  const hasRotateIssue = /rotat|rotasyon|döndüm/.test(allNotes);
  const hasSoloIssue = /solo|tek/.test(allNotes);
  const hasUtilIssue = /util|ability|yetenek/.test(allNotes);

  const survivedText = survivedCount > 0 ? (isTr ? ` ${survivedCount} round'da hayatta kaldın.` : ` Survived ${survivedCount} rounds.`) : "";

  const summary = isTr
    ? `${setup.map} haritasında ${setup.agent} ile ${sideLabel} tarafında oynadın. Skor: ${scoreStr}. ${total} round (${skipped} atlanan).${survivedText} En çok ölüm: ${topDeathLoc} (${topDeathCount}x). Ort. düşman: ${avgEnemy}.`
    : `Played ${setup.map} as ${setup.agent} on ${sideLabel}. Score: ${scoreStr}. ${total} rounds (${skipped} skipped).${survivedText} Most deaths: ${topDeathLoc} (${topDeathCount}x). Avg enemy: ${avgEnemy}.`;

  let mistake: string;
  if (topDeathCount >= 3) {
    mistake = isTr ? `${topDeathLoc} konumunda ${topDeathCount} kez öldün. Bu tekrar düşmana okuma kolaylığı sağlıyor.` : `You died at ${topDeathLoc} ${topDeathCount} times. This makes you predictable.`;
  } else if (hasRotateIssue) {
    mistake = isTr ? `Birden fazla round'da erken rotasyon sorunu yaşadın.` : `Early rotation issues in multiple rounds.`;
  } else if (hasSoloIssue) {
    mistake = isTr ? `Solo oynadığını belirttin. Takım koordinasyonu eksik.` : `Playing solo noted. Team coordination lacking.`;
  } else if (hasUtilIssue) {
    mistake = isTr ? `Utility zamanlamanla ilgili sorunlar tespit edildi.` : `Issues with utility timing detected.`;
  } else {
    mistake = isTr ? `Genel pozisyonlama sorunları göze çarpıyor.` : `General positioning issues stand out.`;
  }

  const enemyAgents = setup.unknownEnemyComp ? (isTr ? "bilinmiyor" : "unknown") : setup.enemyComp.filter(Boolean).join(", ");
  const tendencies = isTr
    ? `Düşman (${enemyAgents}) ort. ${avgEnemy} kişilik gruplarla hareket etti. ${matchWon ? "Baskı yapsa da takımın karşılık verdi." : "Sayısal üstünlükle baskı kurdu."}`
    : `Enemy (${enemyAgents}) moved in groups avg ${avgEnemy}. ${matchWon ? "Despite pressure, team responded." : "Applied pressure with numbers."}`;

  const adjustment = isTr
    ? `${topDeathLoc !== "N/A" ? `${topDeathLoc} yerine farklı açılardan oyna. ` : ""}${setup.agent} olarak utility'ni stratejik zamanla. ${matchWon ? "İyi performans, pozisyon çeşitliliğini artır." : "Retake pozisyonlarına erken geç."}`
    : `${topDeathLoc !== "N/A" ? `Play different angles instead of ${topDeathLoc}. ` : ""}As ${setup.agent}, time utility strategically. ${matchWon ? "Good performance, increase positional variety." : "Set up retake earlier."}`;

  return { summary, mistake, tendencies, adjustment, won, lost, skipped, survivedCount, total, winPct, scoreStr, matchWon };
}

/* ══════════════════════════════════════════════════════════
   LOCALSTORAGE AUTO-SAVE
   ══════════════════════════════════════════════════════════ */

const LS_KEYS = {
  draft: "aimlo_draft",
  lang: "aimlo_lang",
};

type DraftState = {
  setup: SetupData;
  setupStep: SetupStep;
  rounds: RoundData[];
  roundIdx: number;
  screen: Screen;
};

function saveDraft(d: DraftState) {
  try { localStorage.setItem(LS_KEYS.draft, JSON.stringify(d)); } catch {}
}

function loadDraft(): DraftState | null {
  try {
    const s = localStorage.getItem(LS_KEYS.draft);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function clearDraft() {
  try { localStorage.removeItem(LS_KEYS.draft); } catch {}
}

function saveLang(l: Lang) {
  try { localStorage.setItem(LS_KEYS.lang, l); } catch {}
}

function loadLang(): Lang | null {
  try { return localStorage.getItem(LS_KEYS.lang) as Lang | null; } catch { return null; }
}

/* ══════════════════════════════════════════════════════════
   DESIGN SYSTEM — PREMIUM DARK UI
   ══════════════════════════════════════════════════════════ */

const ds = {
  card: "rounded-xl border border-[#1e2a3a] bg-[#0d1117] shadow-lg shadow-black/40",
  cardInner: "p-5 sm:p-6",
  cardHover: "transition-all duration-200 hover:border-[#2d4a6f]/60 hover:bg-[#111922] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/50",
  inputBase: "w-full rounded-lg border border-[#1e2a3a] bg-[#0a0f16] px-4 py-3 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 placeholder-neutral-600",
  selectBase: "w-full cursor-pointer appearance-none rounded-lg border border-[#1e2a3a] bg-[#0a0f16] px-4 py-3 text-sm text-white outline-none transition-all focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-30",
  btnPrimary: "w-full rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-cyan-900/30 transition-all duration-200 hover:from-cyan-500 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-800/40 active:scale-[0.98] disabled:opacity-40",
  btnSecondary: "w-full rounded-lg border border-[#1e2a3a] bg-[#0d1117] py-3 text-sm font-medium text-neutral-400 transition-all duration-200 hover:border-[#2d4a6f]/60 hover:text-white hover:bg-[#111922]",
  btnAccent: "w-full rounded-lg border border-cyan-500/30 bg-cyan-500/10 py-3 text-sm font-semibold text-cyan-300 transition-all hover:bg-cyan-500/15 hover:border-cyan-500/50",
  label: "mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500",
  pageBg: "min-h-screen bg-[#010409]",
};

function Label({ text }: { text: string }) {
  return <label className={ds.label}>{text}</label>;
}

function InlineError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-red-400">{msg}</p>;
}

/* ══════════════════════════════════════════════════════════
   AMBIENT BACKGROUND — adds depth & atmosphere
   ══════════════════════════════════════════════════════════ */

function AmbientBg() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-cyan-900/[0.06] blur-[180px]" />
      <div className="absolute -bottom-48 -left-48 h-[400px] w-[400px] rounded-full bg-blue-900/[0.05] blur-[150px]" />
      <div className="absolute top-1/3 -right-36 h-[350px] w-[350px] rounded-full bg-teal-900/[0.04] blur-[140px]" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAP BACKGROUND — HIGH VISIBILITY
   ══════════════════════════════════════════════════════════ */

function MapBg({ map }: { map: string }) {
  const url = MAP_IMAGES[map];
  if (!url) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <img src={url} alt="" className="h-full w-full object-cover opacity-55 scale-105" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#010409]/10 via-[#010409]/30 to-[#010409]/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#010409]/50 to-transparent" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TOP NAVBAR
   ══════════════════════════════════════════════════════════ */

function Navbar({ user, lang, onSignOut, onLogoClick, onLangToggle, signOutLabel }: {
  user: User; lang: Lang; onSignOut: () => void; onLogoClick: () => void; onLangToggle: () => void; signOutLabel: string;
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1e2a3a] bg-[#010409]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <button onClick={onLogoClick} className="flex items-center gap-2.5 transition hover:opacity-80">
          <AimloLogo size={26} />
          <span className="text-base font-extrabold tracking-wider text-white">AIMLO</span>
          <span className="hidden sm:inline rounded bg-cyan-500/15 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400 uppercase tracking-wider">Beta</span>
        </button>
        <div className="flex items-center gap-2.5">
          <button onClick={onLangToggle} className="rounded-md border border-[#1e2a3a] bg-[#0d1117] px-2.5 py-1 text-[10px] font-bold text-neutral-400 transition hover:border-cyan-500/40 hover:text-white">
            {lang === "tr" ? "TR" : "EN"}
          </button>
          <span className="hidden sm:block text-[11px] text-neutral-600 truncate max-w-[160px]">{user.email}</span>
          <button onClick={onSignOut} className="rounded-md border border-[#1e2a3a] bg-[#0d1117] px-3 py-1.5 text-[10px] font-semibold text-neutral-500 transition hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5">
            {signOutLabel}
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
   ══════════════════════════════════════════════════════════ */

function ReportCard({ icon, color, label, text }: { icon: string; color: string; label: string; text: string }) {
  return (
    <div className={`${ds.card} ${ds.cardInner} border-l-2 ${color === "text-red-400" ? "border-l-red-500/60" : color === "text-amber-400" ? "border-l-amber-500/60" : color === "text-emerald-400" ? "border-l-emerald-500/60" : "border-l-cyan-500/60"}`}>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="text-base opacity-70">{icon}</span>
        <h3 className={`text-[11px] font-bold uppercase tracking-[0.15em] ${color}`}>{label}</h3>
      </div>
      <p className="text-sm leading-relaxed text-neutral-300">{text}</p>
    </div>
  );
}

function FeedbackCard({ icon, color, label, text }: { icon: string; color: string; label: string; text: string }) {
  return (
    <div className="rounded-lg border border-[#1e2a3a] bg-[#0a0f16] p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <h4 className={`text-[10px] font-bold uppercase tracking-[0.15em] ${color}`}>{label}</h4>
      </div>
      <p className="text-[13px] leading-relaxed text-neutral-300">{text}</p>
    </div>
  );
}

function AgentMiniCard({ name, selected, disabled, onClick, locked }: { name: string; selected: boolean; disabled: boolean; onClick: () => void; locked?: boolean }) {
  const role = getAgentRole(name);
  const colors = AGENT_COLORS[role];
  const border = AGENT_BORDER[role];
  const accent = AGENT_ACCENT[role];
  const img = agentImgUrl(name);

  return (
    <button onClick={onClick} disabled={(disabled && !selected) || locked}
      className={`group relative flex flex-col items-center gap-1 rounded-xl border p-2 transition-all duration-200 ${
        selected ? `${border} bg-gradient-to-b ${colors} ring-1 ring-cyan-400/30 shadow-lg shadow-cyan-500/10`
        : disabled ? "cursor-not-allowed border-white/5 bg-white/[0.01] opacity-25"
        : "border-[#1e2a3a] bg-[#0a0f16] hover:border-white/[0.15] hover:bg-white/[0.06]"
      }`}>
      <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-black/30">
        {img ? <img src={img} alt={name} className="h-full w-full object-cover" loading="lazy" />
        : <div className={`flex h-full w-full items-center justify-center text-[10px] font-bold ${accent}`}>{getAgentInitials(name)}</div>}
      </div>
      <span className="text-[9px] font-medium text-neutral-300 leading-tight text-center truncate w-full">{name}</span>
      {selected && !locked && <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-cyan-500 border border-[#010409]" />}
      {locked && <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 border border-[#010409]" />}
    </button>
  );
}

function CompSlot({ agent, index, onRemove, locked }: { agent: string; index: number; onRemove: () => void; locked?: boolean }) {
  const role = agent ? getAgentRole(agent) : "";
  const accent = agent ? AGENT_ACCENT[role] : "";
  const img = agent ? agentImgUrl(agent) : "";
  return (
    <div onClick={() => agent && !locked && onRemove()}
      className={`flex h-16 w-16 flex-col items-center justify-center rounded-xl border transition-all ${
        agent ? locked ? "border-amber-500/40 bg-amber-500/5 cursor-default" : "border-cyan-500/40 bg-cyan-500/10 cursor-pointer hover:border-red-500/40"
        : "border-dashed border-white/[0.08] bg-white/[0.02]"
      }`}>
      {agent ? (<>
        <div className="h-7 w-7 overflow-hidden rounded-lg bg-black/30">
          {img ? <img src={img} alt={agent} className="h-full w-full object-cover" loading="lazy" />
          : <div className={`flex h-full w-full items-center justify-center text-[9px] font-bold ${accent}`}>{getAgentInitials(agent)}</div>}
        </div>
        <span className="mt-0.5 text-[8px] text-neutral-400 truncate w-full text-center">{agent}</span>
      </>) : <span className="text-[11px] text-neutral-600 font-medium">{index + 1}</span>}
    </div>
  );
}

function StatCard({ label, value, color = "text-white", sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div className={`${ds.card} p-4 sm:p-5 text-center`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-1.5">{label}</p>
      <p className={`text-2xl font-extrabold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="mt-1 text-[10px] text-neutral-600 font-medium">{sub}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   AUTH SCREEN (receives lang as a prop — always has a language)
   ══════════════════════════════════════════════════════════ */

function AuthScreen({ lang, onAuth }: { lang: Lang; onAuth: (user: User) => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);
  const al = t[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      if (mode === "register") {
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) { setError(localizeAuthError(err.message, lang)); setLoading(false); return; }
        if (data.user && !data.session) { setCheckEmail(true); setLoading(false); return; }
        if (data.user && data.session) onAuth(data.user);
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) { setError(localizeAuthError(err.message, lang)); setLoading(false); return; }
        if (data.user) onAuth(data.user);
      }
    } catch { setError(al.authError); }
    setLoading(false);
  }

  if (checkEmail) {
    return (
      <main className={`${ds.pageBg} flex items-center justify-center px-4`}>
        <AmbientBg />
        <div className="relative z-10 w-full max-w-sm space-y-8 text-center">
          <AimloLogo size={56} className="mx-auto" />
          <h1 className="text-3xl font-bold tracking-tight text-white">AIMLO</h1>
          <div className={`${ds.card} p-8 space-y-5`}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20"><span className="text-2xl">✉</span></div>
            <p className="text-sm text-neutral-300 leading-relaxed">{al.authCheckEmail}</p>
            <button onClick={() => { setCheckEmail(false); setMode("login"); }} className={ds.btnSecondary}>{al.authLogin}</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${ds.pageBg} relative flex items-center justify-center px-4 overflow-hidden`}>
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-cyan-900/[0.07] blur-[180px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full bg-blue-900/[0.05] blur-[140px]" />

      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <AimloLogo size={80} className="mx-auto" />
            <div className="pointer-events-none absolute inset-0 -m-8 rounded-full bg-cyan-500/[0.08] blur-3xl" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-wider text-white">AIMLO</h1>
            <p className="mt-2 text-sm text-neutral-500">{al.tagline}</p>
          </div>
        </div>

        <div className={`${ds.card} p-6 sm:p-8 space-y-6`}>
          <div className="text-center"><h2 className="text-lg font-bold text-white">{mode === "login" ? al.authLogin : al.authRegister}</h2></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><Label text={al.authEmail} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={al.authEmailPh} required className={ds.inputBase} /></div>
            <div><Label text={al.authPassword} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={al.authPasswordPh} required minLength={6} className={ds.inputBase} /></div>
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3"><p className="text-xs text-red-400">{error}</p></div>}
            <button type="submit" disabled={loading} className={ds.btnPrimary}>
              {loading ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{al.authLoading}</span>
              : mode === "login" ? al.authLogin : al.authRegister}
            </button>
          </form>
          <p className="text-center text-xs text-neutral-500">
            {mode === "login" ? al.authNoAccount : al.authHasAccount}{" "}
            <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="text-cyan-400 hover:text-cyan-300 transition font-semibold">{mode === "login" ? al.authRegister : al.authLogin}</button>
          </p>
        </div>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════ */

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); setAuthLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() { await supabase.auth.signOut(); setUser(null); setScreen("dashboard"); clearDraft(); }

  const [lang, setLang] = useState<Lang | null>(null);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [setup, setSetup] = useState<SetupData>({ map: "", agent: "", side: "", teamComp: [], enemyComp: [], unknownEnemyComp: false });
  const [setupStep, setSetupStep] = useState<SetupStep>("mapAgent");
  const [setupErrors, setSetupErrors] = useState<FormErrors>({});
  const [compTarget, setCompTarget] = useState<CompTarget>("team");
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [roundForm, setRoundForm] = useState<RoundForm>({ deathLocation: "", enemyCount: "", yourNote: "" });
  const [roundErrors, setRoundErrors] = useState<FormErrors>({});
  const [roundMode, setRoundMode] = useState<RoundScreenMode>("input");
  const [currentFeedback, setCurrentFeedback] = useState<RoundFeedback | null>(null);
  const [currentResult, setCurrentResult] = useState<RoundResult | null>(null);
  const [survived, setSurvived] = useState(false);
  const [matchScore, setMatchScore] = useState<MatchScore>({ yours: "", enemy: "" });
  const [pendingFinishRound, setPendingFinishRound] = useState<RoundData | null>(null);
  const [report, setReport] = useState<ReturnType<typeof genMatchReport> | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [viewingReport, setViewingReport] = useState<SavedReport | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const locations = setup.map ? MAP_LOCATIONS[setup.map] ?? [] : [];
  const roundNum = roundIdx + 1;

  // Restore lang from localStorage on mount
  useEffect(() => {
    const saved = loadLang();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLang(saved);
    }
  }, []);

  // Auto-save draft when in setup/round screens
  useEffect(() => {
    if (screen === "setup" || screen === "round") {
      saveDraft({ setup, setupStep, rounds, roundIdx, screen });
    }
  }, [setup, setupStep, rounds, roundIdx, screen]);

  // Restore draft on mount
  const draftRestored = useRef(false);
  useEffect(() => {
    if (!draftRestored.current && user && lang) {
      draftRestored.current = true;
      const draft = loadDraft();
      if (draft && (draft.screen === "setup" || draft.screen === "round")) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSetup(draft.setup);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSetupStep(draft.setupStep);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRounds(draft.rounds);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRoundIdx(draft.roundIdx);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setScreen(draft.screen);
      }
    }
  }, [user, lang]);

  // Load history from Supabase + localStorage fallback
  const loadHistory = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);

    function rowToReport(row: Record<string, unknown>): SavedReport {
      const json = (row.raw_result_json as Record<string, unknown>) || {};
      return {
        id: (row.id as string) || crypto.randomUUID(),
        map: (json.map as string) || (row.riot_id as string) || "",
        agent: (json.agent as string) || (row.region as string) || "",
        side: (json.side as string) || "",
        score: (json.score as string) || "",
        won: (json.won as boolean) ?? false,
        date: new Date(row.created_at as string).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { day: "numeric", month: "short", year: "numeric" }),
        summary: (row.summary as string) || (json.summary as string) || "",
        mistake: (row.weakness as string) || (json.mistake as string) || "",
        tendencies: (row.strength as string) || (json.tendencies as string) || "",
        adjustment: (row.focus as string) || (json.adjustment as string) || "",
        winPct: (json.winPct as number) || 0,
        roundsWon: (json.roundsWon as number) || 0,
        roundsLost: (json.roundsLost as number) || 0,
        roundsSkipped: (json.roundsSkipped as number) || 0,
        survivedCount: (json.survivedCount as number) || 0,
        totalRounds: (json.totalRounds as number) || 0,
        rounds: (json.rounds as RoundData[]) || [],
        setup: (json.setup as SetupData) || { map: "", agent: "", side: "", teamComp: [], enemyComp: [], unknownEnemyComp: false },
      };
    }

    let allReports: SavedReport[] = [];

    // 1. Try Supabase
    try {
      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) {
        console.error("[Aimlo] History load error:", error.message, error.details);
      } else if (data && data.length > 0) {
        allReports = data.map((row: Record<string, unknown>) => rowToReport(row));
      }
    } catch (err) {
      console.error("[Aimlo] History load exception:", err);
    }

    // 2. Also load localStorage fallback reports
    try {
      const localRaw = JSON.parse(localStorage.getItem(`aimlo_local_reports_${user.id}`) || "[]");
      if (localRaw.length > 0) {
        const localReports: SavedReport[] = localRaw.map((row: Record<string, unknown>) => rowToReport(row));
        // Merge: add local reports that aren't already in DB results (by id)
        const existingIds = new Set(allReports.map((r) => r.id));
        for (const lr of localReports) {
          if (!existingIds.has(lr.id)) allReports.push(lr);
        }
        // Sort by date descending
        allReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    } catch (e) {
      // localStorage might not be available
    }

    setSavedReports(allReports);
    setHistoryLoading(false);
  }, [user, lang]);

  useEffect(() => {
    if (user && lang) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadHistory();
    }
  }, [user, lang, loadHistory]);

  /*
    IMPORTANT — Supabase RLS Setup Required!
    Run this SQL in Supabase SQL Editor to allow users to insert/read their own analyses:

    ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can insert own analyses"
      ON analyses FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can read own analyses"
      ON analyses FOR SELECT
      USING (auth.uid() = user_id);
  */

  // Save report — tries Supabase first, falls back to localStorage if RLS/network fails
  async function saveReportToDb(rep: ReturnType<typeof genMatchReport>, setupData: SetupData, roundsData: RoundData[], sc: MatchScore) {
    if (!user) return;

    const reportPayload = {
      user_id: user.id,
      riot_id: setupData.map,
      region: setupData.agent,
      summary: rep.summary,
      weakness: rep.mistake,
      strength: rep.tendencies,
      focus: rep.adjustment,
      raw_result_json: {
        map: setupData.map,
        agent: setupData.agent,
        side: setupData.side,
        score: rep.scoreStr,
        won: rep.matchWon,
        winPct: rep.winPct,
        roundsWon: rep.won,
        roundsLost: rep.lost,
        roundsSkipped: rep.skipped,
        survivedCount: rep.survivedCount,
        totalRounds: rep.total,
        rounds: roundsData,
        setup: setupData,
      },
    };

    let dbSaved = false;
    try {
      const { error } = await supabase.from("analyses").insert(reportPayload);
      if (error) {
        console.error("[Aimlo] Save report error:", error.message, error.details);
        console.warn("[Aimlo] Falling back to localStorage. To fix, run the RLS policies in Supabase SQL Editor — see comment in source code.");
      } else {
        dbSaved = true;
      }
    } catch (err) {
      console.error("[Aimlo] Save report exception:", err);
    }

    // If DB save failed, store locally so history still works
    if (!dbSaved) {
      try {
        const existing = JSON.parse(localStorage.getItem(`aimlo_local_reports_${user.id}`) || "[]");
        existing.unshift({ ...reportPayload, id: crypto.randomUUID(), created_at: new Date().toISOString() });
        localStorage.setItem(`aimlo_local_reports_${user.id}`, JSON.stringify(existing.slice(0, 100)));
      } catch (e) {
        console.error("[Aimlo] localStorage fallback failed:", e);
      }
    }
    loadHistory();
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSetup((prev) => {
      const comp = [...prev.teamComp];
      if (prev.agent) {
        const existsElsewhere = comp.indexOf(prev.agent);
        if (existsElsewhere > 0) comp.splice(existsElsewhere, 1);
        comp[0] = prev.agent;
        const cleaned = [prev.agent, ...comp.filter((a) => a && a !== prev.agent)];
        return { ...prev, teamComp: cleaned };
      } else {
        if (comp.length > 0 && comp[0]) comp[0] = "";
        return { ...prev, teamComp: comp.filter((a) => a) };
      }
    });
  }, [setup.agent]);

  // Auth loading
  if (authLoading) {
    return (
      <main className={`${ds.pageBg} flex items-center justify-center`}>
        <AmbientBg />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <AimloLogo size={48} className="animate-pulse" />
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      </main>
    );
  }

  /* ════════════════════════════════════════════
     LANGUAGE SELECTION — BEFORE LOGIN
     ════════════════════════════════════════════ */

  if (!lang) {
    return (
      <main className={`${ds.pageBg} relative flex items-center justify-center px-4 overflow-hidden`}>
        <AmbientBg />
        <div className="relative z-10 w-full max-w-xs space-y-10 text-center">
          <div className="space-y-4">
            <div className="relative inline-block">
              <AimloLogo size={80} className="mx-auto" />
              <div className="pointer-events-none absolute inset-0 -m-8 rounded-full bg-cyan-500/[0.08] blur-3xl" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-wider text-white">AIMLO</h1>
            <div className="mx-auto h-0.5 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
            <p className="text-sm text-neutral-500">Dil seçin / Choose language</p>
          </div>
          <div className="flex gap-3">
            {(["tr", "en"] as Lang[]).map((lg) => (
              <button key={lg} onClick={() => { setLang(lg); saveLang(lg); }}
                className={`flex-1 rounded-lg border border-[#1e2a3a] bg-[#0d1117] py-4 text-sm font-semibold text-white transition-all duration-200 hover:border-cyan-500/40 hover:bg-[#111922] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-900/20`}>
                {lg === "tr" ? "Türkçe" : "English"}
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  /* ════════════════════════════════════════════
     AUTH — after language, before app
     ════════════════════════════════════════════ */

  if (!user) return <AuthScreen lang={lang} onAuth={(u) => setUser(u)} />;

  /* ── HELPERS ── */
  const l = t[lang];

  function updateSetup<K extends keyof SetupData>(key: K, val: SetupData[K]) {
    setSetup((p) => ({ ...p, [key]: val }));
    setSetupErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  }

  function updateRound<K extends keyof RoundForm>(key: K, val: string) {
    setRoundForm((p) => ({ ...p, [key]: val }));
    setRoundErrors((p) => { const n = { ...p }; delete n[key]; return n; });
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
    setSetupErrors((p) => { const n = { ...p }; delete n[type]; return n; });
  }

  function loadRoundAtIndex(idx: number) {
    setRoundIdx(idx); setRoundErrors({}); setRoundMode("input"); setCurrentFeedback(null); setCurrentResult(null); setSurvived(false);
    if (idx < rounds.length) {
      const r = rounds[idx]; setSurvived(r.survived);
      setRoundForm(r.skipped ? { deathLocation: "", enemyCount: "", yourNote: "" } : { deathLocation: r.deathLocation, enemyCount: r.enemyCount, yourNote: r.yourNote });
    } else setRoundForm({ deathLocation: "", enemyCount: "", yourNote: "" });
  }

  function saveRoundData(rd: RoundData) {
    setRounds((prev) => { const copy = [...prev]; if (roundIdx < copy.length) copy[roundIdx] = rd; else copy.push(rd); return copy; });
  }

  function getRoundsForReport(extra?: RoundData): RoundData[] {
    const copy = [...rounds]; if (extra) { if (roundIdx < copy.length) copy[roundIdx] = extra; else copy.push(extra); } return copy;
  }

  function goToScoreInput(extraRound?: RoundData) {
    if (extraRound) { setPendingFinishRound(extraRound); saveRoundData(extraRound); } else setPendingFinishRound(null);
    setMatchScore({ yours: "", enemy: "" }); setScreen("scoreInput");
  }

  function finishWithScore(yours: string, enemy: string) {
    const sc: MatchScore = { yours, enemy };
    const allRounds = getRoundsForReport(pendingFinishRound ?? undefined);
    if (pendingFinishRound) setRounds(allRounds);
    const rep = genMatchReport(setup, allRounds, lang ?? "tr", sc);
    setReport(rep);
    saveReportToDb(rep, setup, allRounds, sc);
    clearDraft();
    setScreen("report");
  }

  function handleLangToggle() { if (lang === "tr") { setLang("en"); saveLang("en"); } else { setLang("tr"); saveLang("tr"); } }

  function resetForNewMatch() {
    setSetup({ map: "", agent: "", side: "", teamComp: [], enemyComp: [], unknownEnemyComp: false });
    setRounds([]); setRoundIdx(0); setReport(null); setRoundMode("input"); setCurrentFeedback(null); setCurrentResult(null); setSurvived(false); setSetupStep("mapAgent"); clearDraft(); setScreen("setup");
  }

  const SETUP_STEPS: SetupStep[] = ["mapAgent", "sideComp", "confirm"];

  function getStepLabel(step: SetupStep): string {
    return ({ mapAgent: l.stepMapAgent, sideComp: l.stepSideComp, confirm: l.stepConfirm })[step];
  }

  // Win rate calc
  const winRate = savedReports.length > 0 ? Math.round(savedReports.filter(r => r.won).length / savedReports.length * 100) : 0;

  // Most common death spot across all saved reports
  const allDeathSpots: Record<string, number> = {};
  savedReports.forEach(r => {
    r.rounds.filter(rd => !rd.skipped && !rd.survived && rd.deathLocation).forEach(rd => {
      allDeathSpots[rd.deathLocation] = (allDeathSpots[rd.deathLocation] || 0) + 1;
    });
  });
  const topDeathSpot = Object.entries(allDeathSpots).sort((a, b) => b[1] - a[1])[0];

  /* ════════════════════════════════════════════
     DASHBOARD
     ════════════════════════════════════════════ */

  if (screen === "dashboard") {
    return (
      <main className={ds.pageBg}>
        <AmbientBg />
        <Navbar user={user} lang={lang} onSignOut={handleSignOut} onLogoClick={() => setScreen("dashboard")} onLangToggle={handleLangToggle} signOutLabel={l.authSignOut} />
        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-20 pb-12 space-y-6">

          {/* Big CTA */}
          <button onClick={resetForNewMatch} className={`w-full group ${ds.card} ${ds.cardHover} overflow-hidden`}>
            <div className="p-5 sm:p-6 flex items-center gap-4">
              <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 shadow-md shadow-cyan-900/30 text-xl font-bold text-white group-hover:scale-105 transition-transform">+</div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-white">{l.dashNewMatch}</h2>
                <p className="text-sm text-neutral-500 mt-0.5">{l.dashNewMatchDesc}</p>
              </div>
              <div className="ml-auto text-neutral-600 group-hover:text-cyan-400 transition-colors text-lg">→</div>
            </div>
          </button>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label={l.dashWinRate}
              value={savedReports.length > 0 ? `${winRate}%` : "—"}
              color={winRate >= 50 ? "text-emerald-400" : winRate > 0 ? "text-red-400" : "text-neutral-600"}
            />
            <StatCard
              label={l.dashMatches}
              value={String(savedReports.length)}
              sub={savedReports.length > 0 ? `${savedReports.filter(r => r.won).length}W ${savedReports.filter(r => !r.won).length}L` : undefined}
            />
            <StatCard
              label={l.dashFreqDeath}
              value={topDeathSpot ? topDeathSpot[0] : "—"}
              color={topDeathSpot ? "text-amber-400" : "text-neutral-600"}
              sub={topDeathSpot ? `${topDeathSpot[1]}x` : l.dashNoStats}
            />
          </div>

          {/* Recent */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-500">{l.dashRecentTitle}</h3>
              {savedReports.length > 0 && (
                <button onClick={() => setScreen("history")} className="text-[11px] font-semibold text-cyan-400 transition hover:text-cyan-300">{l.dashHistory} →</button>
              )}
            </div>

            {historyLoading ? (
              <div className={`${ds.card} p-8 flex justify-center`}>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
              </div>
            ) : savedReports.length === 0 ? (
              <div className={`${ds.card} p-10 text-center relative overflow-hidden`}>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-transparent" />
                <AimloLogo size={48} className="relative mx-auto opacity-20 mb-4" />
                <p className="relative text-sm font-semibold text-neutral-400">{l.dashNoData}</p>
                <p className="relative mt-1 text-xs text-neutral-600">{l.dashNoDataDesc}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {savedReports.slice(0, 5).map((entry) => (
                  <button key={entry.id} onClick={() => { setViewingReport(entry); setScreen("reportDetail"); }}
                    className={`w-full text-left ${ds.card} ${ds.cardHover} p-4 flex items-center gap-4`}>
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-black/30 ring-1 ring-white/[0.06]">
                      <img src={MAP_IMAGES[entry.map]} alt={entry.map} className="h-full w-full object-cover opacity-80" loading="lazy" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{entry.map}</span>
                        <span className="text-xs text-neutral-500">{entry.agent}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-neutral-600">{entry.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-white">{entry.score}</p>
                      <p className={`text-[10px] font-bold uppercase ${entry.won ? "text-emerald-400" : "text-red-400"}`}>{entry.won ? l.victory : l.defeat}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  /* ════════════════════════════════════════════
     HISTORY
     ════════════════════════════════════════════ */

  if (screen === "history") {
    return (
      <main className={ds.pageBg}>
        <AmbientBg />
        <Navbar user={user} lang={lang} onSignOut={handleSignOut} onLogoClick={() => setScreen("dashboard")} onLangToggle={handleLangToggle} signOutLabel={l.authSignOut} />
        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-20 pb-12 space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen("dashboard")} className="rounded-lg border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 text-xs text-neutral-400 transition hover:text-white hover:border-white/[0.15]">← {l.back}</button>
            <h2 className="text-lg font-bold text-white">{l.historyTitle}</h2>
            {savedReports.length > 0 && <span className="ml-auto text-xs text-neutral-500">{l.dashWinRate}: <span className={winRate >= 50 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{winRate}%</span> · {savedReports.length} {l.dashMatches.toLowerCase()}</span>}
          </div>
          {savedReports.length === 0 ? (
            <div className={`${ds.card} p-12 text-center relative overflow-hidden`}>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-transparent" />
              <AimloLogo size={48} className="relative mx-auto opacity-20 mb-4" />
              <p className="relative text-sm text-neutral-400">{l.historyEmpty}</p>
              <p className="relative mt-1 text-xs text-neutral-600">{l.historyEmptyDesc}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {savedReports.map((entry) => (
                <button key={entry.id} onClick={() => { setViewingReport(entry); setScreen("reportDetail"); }}
                  className={`w-full text-left ${ds.card} ${ds.cardHover} p-4 sm:p-5 flex items-center gap-4`}>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-black/30 ring-1 ring-white/[0.06]">
                    <img src={MAP_IMAGES[entry.map]} alt={entry.map} className="h-full w-full object-cover opacity-80" loading="lazy" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{entry.map}</span>
                      <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-neutral-400">{entry.agent}</span>
                      <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-neutral-500">{entry.side === "attack" ? l.sideAttack : l.sideDefense}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-600">{entry.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-extrabold text-white">{entry.score}</p>
                    <p className={`text-[10px] font-bold uppercase ${entry.won ? "text-emerald-400" : "text-red-400"}`}>{entry.won ? l.victory : l.defeat}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  /* ════════════════════════════════════════════
     REPORT DETAIL (from history)
     ════════════════════════════════════════════ */

  if (screen === "reportDetail" && viewingReport) {
    const vr = viewingReport;
    return (
      <main className={`${ds.pageBg} relative`}>
        <MapBg map={vr.map} />
        <Navbar user={user} lang={lang} onSignOut={handleSignOut} onLogoClick={() => setScreen("dashboard")} onLangToggle={handleLangToggle} signOutLabel={l.authSignOut} />
        <div className="relative z-10 mx-auto max-w-lg px-4 pt-20 pb-12 space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen("history")} className="rounded-lg border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 text-xs text-neutral-400 transition hover:text-white hover:border-white/[0.15]">← {l.back}</button>
            <h2 className="text-lg font-bold text-white">{l.reportTitle}</h2>
          </div>

          {/* Score Hero */}
          <div className={`${ds.card} overflow-hidden`}>
            <div className="relative p-6">
              <div className="pointer-events-none absolute inset-0 opacity-[0.15]"><img src={MAP_IMAGES[vr.map]} alt="" className="h-full w-full object-cover" /></div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="relative flex items-end justify-between">
                <div>
                  <p className={ds.label}>{l.matchResult}</p>
                  <p className="mt-1 text-4xl font-extrabold tracking-tight text-white">{vr.score}</p>
                  <p className={`mt-1 text-xs font-bold uppercase ${vr.won ? "text-emerald-400" : "text-red-400"}`}>{vr.won ? l.victory : l.defeat}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[11px] text-neutral-500">{vr.map} · {vr.agent}</p>
                  <p className="text-[11px] text-neutral-600">{vr.date}</p>
                  <p className="text-lg font-extrabold text-cyan-400">{vr.winPct}%</p>
                </div>
              </div>
              <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all" style={{ width: `${vr.winPct}%` }} />
              </div>
              <div className="relative mt-3 grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wider">
                <div><span className="text-neutral-500">{l.enteredRounds}</span><br/><span className="text-white text-sm">{vr.totalRounds}</span></div>
                <div><span className="text-neutral-500">{l.roundsWon}</span><br/><span className="text-emerald-400 text-sm">{vr.roundsWon}</span></div>
                <div><span className="text-neutral-500">{l.roundsLost}</span><br/><span className="text-red-400 text-sm">{vr.roundsLost}</span></div>
                <div><span className="text-neutral-500">{l.roundsSkipped}</span><br/><span className="text-neutral-400 text-sm">{vr.roundsSkipped}</span></div>
              </div>
            </div>
          </div>

          {vr.rounds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center">
              {vr.rounds.map((r, i) => (
                <span key={i} className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase border ${r.result === "win" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"} ${r.skipped ? "opacity-40" : ""} ${r.survived ? "border-emerald-400/40 ring-1 ring-emerald-400/20" : ""}`}>
                  R{r.roundNumber} {r.result === "win" ? l.wonLabel : l.lostLabel}{r.skipped ? ` ${l.skippedLabel}` : ""}{r.survived ? " ♡" : ""}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <ReportCard icon="◈" color="text-cyan-400" label={l.overallSummary} text={vr.summary} />
            <ReportCard icon="✕" color="text-red-400" label={l.mainRecurringMistake} text={vr.mistake} />
            <ReportCard icon="◎" color="text-amber-400" label={l.enemyTendencies} text={vr.tendencies} />
            <ReportCard icon="▸" color="text-emerald-400" label={l.suggestedAdjustment} text={vr.adjustment} />
          </div>

          <div className="space-y-3">
            <button onClick={resetForNewMatch} className={ds.btnPrimary}>{l.newMatch}</button>
            <button onClick={() => setScreen("dashboard")} className={ds.btnSecondary}>{l.returnToMenu}</button>
          </div>
        </div>
      </main>
    );
  }

  /* ════════════════════════════════════════════
     SETUP — 3 SCREENS
     ════════════════════════════════════════════ */

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
        if (!setup.unknownEnemyComp && setup.enemyComp.filter(Boolean).length < 5) e.enemyComp = l.selectAll;
      }
      setSetupErrors(e);
      if (Object.keys(e).length > 0) return;
      if (stepIdx < SETUP_STEPS.length - 1) { setSetupStep(SETUP_STEPS[stepIdx + 1]); setSetupErrors({}); }
      else {
        setRounds([]); setRoundIdx(0); setRoundForm({ deathLocation: "", enemyCount: "", yourNote: "" }); setRoundErrors({}); setRoundMode("input"); setCurrentFeedback(null); setCurrentResult(null); setSurvived(false); setScreen("round");
      }
    }

    function prevStep() {
      if (stepIdx > 0) { setSetupStep(SETUP_STEPS[stepIdx - 1]); setSetupErrors({}); } else setScreen("dashboard");
    }

    return (
      <main className={`${ds.pageBg} relative`}>
        {setup.map ? <MapBg map={setup.map} /> : <AmbientBg />}
        <Navbar user={user} lang={lang} onSignOut={handleSignOut} onLogoClick={() => setScreen("dashboard")} onLangToggle={handleLangToggle} signOutLabel={l.authSignOut} />
        <div className="relative z-10 mx-auto max-w-2xl px-4 pt-20 pb-12 space-y-6">
          <div className="text-center space-y-1"><h2 className="text-2xl font-bold text-white">{l.setupTitle}</h2></div>

          {/* Steps */}
          <div className="flex items-center justify-center gap-1">
            {SETUP_STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <button onClick={() => { if (i <= stepIdx) { setSetupStep(s); setSetupErrors({}); } }}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                    i === stepIdx ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50" : i < stepIdx ? "bg-white/[0.06] text-neutral-400 cursor-pointer hover:text-white" : "bg-white/[0.02] text-neutral-700"
                  }`}>{getStepLabel(s)}</button>
                {i < SETUP_STEPS.length - 1 && <span className="text-neutral-700 text-xs">›</span>}
              </div>
            ))}
          </div>

          <div className={`${ds.card} ${ds.cardInner} space-y-6`}>
            {setupStep === "mapAgent" && (<>
              <div>
                <Label text={l.map} />
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                  {MAPS.map((m) => (
                    <button key={m} onClick={() => updateSetup("map", m)}
                      className={`relative overflow-hidden rounded-xl border py-4 text-sm font-medium transition-all ${
                        setup.map === m ? "border-cyan-500 bg-cyan-500/15 text-white ring-1 ring-cyan-500/50 shadow-lg shadow-cyan-500/10" : "border-[#1e2a3a] bg-[#0d1117] text-neutral-400 hover:border-[#2d4a6f]/60 hover:text-white"
                      }`}>
                      {setup.map === m && <div className="pointer-events-none absolute inset-0 opacity-30"><img src={MAP_IMAGES[m]} alt="" className="h-full w-full object-cover" /></div>}
                      <span className="relative">{m}</span>
                    </button>
                  ))}
                </div>
                <InlineError msg={setupErrors.map} />
              </div>

              <div className="border-t border-white/[0.06] pt-6">
                <Label text={l.agent} />
                {setup.agent && (
                  <div className="mb-4 flex items-center gap-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-3">
                    <div className="h-10 w-10 overflow-hidden rounded-xl bg-black/30 ring-1 ring-cyan-500/30"><img src={agentImgUrl(setup.agent)} alt={setup.agent} className="h-full w-full object-cover" loading="lazy" /></div>
                    <div><span className="text-sm font-bold text-white">{setup.agent}</span><p className="text-[10px] text-cyan-400">{l.selected}</p></div>
                  </div>
                )}
                <div className="space-y-5">
                  {Object.entries(AGENT_GROUPS).map(([group, agents]) => (
                    <div key={group}>
                      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-600">{AGENT_GROUP_LABELS[group][lang]}</p>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                        {agents.map((a) => <AgentMiniCard key={a} name={a} selected={setup.agent === a} disabled={false} onClick={() => updateSetup("agent", setup.agent === a ? "" : a)} />)}
                      </div>
                    </div>
                  ))}
                </div>
                <InlineError msg={setupErrors.agent} />
              </div>
            </>)}

            {setupStep === "sideComp" && (<>
              <div>
                <Label text={l.side} />
                <div className="flex gap-4">
                  {([["attack", l.sideAttack, "border-orange-500/40 bg-orange-500/10"], ["defense", l.sideDefense, "border-sky-500/40 bg-sky-500/10"]] as const).map(([val, label, activeStyle]) => (
                    <button key={val} onClick={() => updateSetup("side", val)}
                      className={`flex-1 rounded-xl border py-5 text-sm font-bold transition-all ${setup.side === val ? `${activeStyle} text-white ring-1 ring-cyan-500/50 shadow-lg` : "border-[#1e2a3a] bg-[#0d1117] text-neutral-400 hover:border-[#2d4a6f]/60 hover:text-white"}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <InlineError msg={setupErrors.side} />
              </div>

              <div className="border-t border-white/[0.06] pt-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">{l.compTitle}</h2>
                  <label className="flex cursor-pointer items-center gap-2 text-[11px] text-neutral-500">
                    <input type="checkbox" checked={setup.unknownEnemyComp} onChange={(e) => updateSetup("unknownEnemyComp", e.target.checked)} className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 accent-cyan-500" />
                    {l.unknownEnemy}
                  </label>
                </div>

                <div className="flex gap-4 justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-400">{l.yourTeam}</p>
                      <span className="text-[9px] text-neutral-600">{l.slotsRemaining(5 - setup.teamComp.length)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[0,1,2,3,4].map((i) => <CompSlot key={i} agent={setup.teamComp[i]||""} index={i} locked={i===0 && setup.teamComp[0]===setup.agent && !!setup.agent} onRemove={() => { if(i===0 && setup.teamComp[0]===setup.agent) return; const c=[...setup.teamComp]; c.splice(i,1); updateSetup("teamComp",c); }} />)}
                    </div>
                    <InlineError msg={setupErrors.teamComp} />
                  </div>
                  {!setup.unknownEnemyComp && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-400">{l.enemyTeam}</p>
                        <span className="text-[9px] text-neutral-600">{l.slotsRemaining(5 - setup.enemyComp.length)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[0,1,2,3,4].map((i) => <CompSlot key={i} agent={setup.enemyComp[i]||""} index={i} onRemove={() => { const c=[...setup.enemyComp]; c.splice(i,1); updateSetup("enemyComp",c); }} />)}
                      </div>
                      <InlineError msg={setupErrors.enemyComp} />
                    </div>
                  )}
                </div>

                {!setup.unknownEnemyComp && (
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => setCompTarget("team")} className={`rounded-lg px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${compTarget === "team" ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40" : "bg-white/[0.06] text-neutral-500 hover:text-white"}`}>+ {l.yourTeam}</button>
                    <button onClick={() => setCompTarget("enemy")} className={`rounded-lg px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${compTarget === "enemy" ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/40" : "bg-white/[0.06] text-neutral-500 hover:text-white"}`}>+ {l.enemyTeam}</button>
                  </div>
                )}

                <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-600">{l.agentPool}</p>
                  <div className="space-y-4">
                    {Object.entries(AGENT_GROUPS).map(([group, agents]) => {
                      const target = setup.unknownEnemyComp ? "team" : compTarget;
                      const currentArr = target === "team" ? setup.teamComp : setup.enemyComp;
                      return (
                        <div key={group}>
                          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-neutral-700">{AGENT_GROUP_LABELS[group][lang]}</p>
                          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8">
                            {agents.map((a) => {
                              const isInCurrent = currentArr.includes(a);
                              const isLocked = target === "team" && a === setup.agent && setup.teamComp[0] === a;
                              return <AgentMiniCard key={a} name={a} selected={isInCurrent} disabled={isInCurrent && !isLocked} locked={isLocked} onClick={() => { if(isLocked) return; handleCompSelect(target === "team" ? "teamComp" : "enemyComp", a); }} />;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>)}

            {setupStep === "confirm" && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-white">{l.confirmTitle}</h3>
                  <p className="text-sm text-neutral-500">{l.confirmDesc}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`${ds.card} p-4 text-center`}>
                    <p className={ds.label}>{l.map}</p>
                    <div className="relative h-20 w-full overflow-hidden rounded-xl bg-black/20 mb-2 ring-1 ring-white/[0.06]">
                      <img src={MAP_IMAGES[setup.map]} alt={setup.map} className="h-full w-full object-cover opacity-70" />
                    </div>
                    <p className="text-sm font-bold text-white">{setup.map}</p>
                  </div>
                  <div className={`${ds.card} p-4 text-center`}>
                    <p className={ds.label}>{l.agent}</p>
                    <div className="mx-auto h-14 w-14 overflow-hidden rounded-xl bg-black/20 mb-2 ring-1 ring-white/[0.06]">
                      <img src={agentImgUrl(setup.agent)} alt={setup.agent} className="h-full w-full object-cover" />
                    </div>
                    <p className="text-sm font-bold text-white">{setup.agent}</p>
                  </div>
                </div>

                <div className={`${ds.card} p-4 flex items-center justify-between`}>
                  <span className={ds.label + " mb-0"}>{l.side}</span>
                  <span className="text-sm font-bold text-white">{setup.side === "attack" ? l.sideAttack : l.sideDefense}</span>
                </div>

                <div className={`${ds.card} p-4`}>
                  <p className={ds.label}>{l.yourTeam}</p>
                  <div className="flex gap-2 mt-2">{setup.teamComp.map((a,i) => a && <div key={i} className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-2 py-1"><div className="h-5 w-5 rounded overflow-hidden"><img src={agentImgUrl(a)} alt={a} className="h-full w-full object-cover" /></div><span className="text-[11px] text-neutral-300">{a}</span></div>)}</div>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button onClick={nextStep} className={ds.btnPrimary}>{setupStep === "confirm" ? l.startMatch : l.next}</button>
              <button onClick={prevStep} className={ds.btnSecondary}>{l.back}</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ════════════════════════════════════════════
     ROUND SCREEN
     ════════════════════════════════════════════ */

  if (screen === "round") {
    function validateRound(): FormErrors {
      const e: FormErrors = {};
      if (!survived) { if (!roundForm.deathLocation) e.deathLocation = l.required; if (!roundForm.enemyCount) e.enemyCount = l.required; }
      if (!roundForm.yourNote.trim()) e.yourNote = l.required;
      else if (roundForm.yourNote.trim().length < 10) e.yourNote = l.noteTooShort;
      return e;
    }

    function handleSubmitRound(result: RoundResult) {
      const e = validateRound(); setRoundErrors(e); if (Object.keys(e).length > 0) return;
      const prevRounds = rounds.slice(0, roundIdx);
      const feedback = genRoundFeedback(setup, roundForm, result, prevRounds, lang ?? "tr", survived);
      const rd: RoundData = { roundNumber: roundNum, deathLocation: survived ? "" : roundForm.deathLocation, enemyCount: survived ? "" : roundForm.enemyCount, yourNote: roundForm.yourNote, result, skipped: false, survived, feedback };
      saveRoundData(rd); setCurrentFeedback(feedback); setCurrentResult(result); setRoundMode("feedback");
    }

    function handleSkipConfirm(result: RoundResult) {
      const rd: RoundData = { roundNumber: roundNum, deathLocation: "", enemyCount: "", yourNote: "", result, skipped: true, survived: false, feedback: null };
      saveRoundData(rd); loadRoundAtIndex(roundIdx + 1);
    }

    function handleNextRound() { loadRoundAtIndex(roundIdx + 1); }
    function handleBack() { if (roundIdx > 0) loadRoundAtIndex(roundIdx - 1); else { setScreen("setup"); setSetupStep("confirm"); } }
    function handleFinishFromFeedback() { goToScoreInput(); }

    function handleFinishFromInput() {
      const e = validateRound();
      if (Object.keys(e).length === 0) {
        const prevRounds = rounds.slice(0, roundIdx);
        const feedback = genRoundFeedback(setup, roundForm, "loss", prevRounds, lang ?? "tr", survived);
        const rd: RoundData = { roundNumber: roundNum, deathLocation: survived ? "" : roundForm.deathLocation, enemyCount: survived ? "" : roundForm.enemyCount, yourNote: roundForm.yourNote, result: "loss", skipped: false, survived, feedback };
        goToScoreInput(rd);
      } else goToScoreInput();
    }

    return (
      <main className={`${ds.pageBg} relative`}>
        <MapBg map={setup.map} />
        <Navbar user={user} lang={lang} onSignOut={handleSignOut} onLogoClick={() => setScreen("dashboard")} onLangToggle={handleLangToggle} signOutLabel={l.authSignOut} />
        <div className="relative z-10 mx-auto max-w-lg px-4 pt-20 pb-12 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-white">{l.roundTitle(roundNum)}</h2>
            <p className="text-sm text-neutral-500">{setup.map} · {setup.agent} · {setup.side === "attack" ? l.sideAttack : l.sideDefense}</p>
          </div>

          {(rounds.length > 0 || roundIdx > 0) && (
            <div className="flex flex-wrap gap-1.5 justify-center">
              {rounds.map((r, i) => (
                <button key={i} onClick={() => loadRoundAtIndex(i)}
                  className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition border ${i === roundIdx ? "ring-2 ring-cyan-500 ring-offset-1 ring-offset-[#010409]" : ""} ${r.result === "win" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"} ${r.skipped ? "opacity-40" : ""}`}>
                  R{r.roundNumber} {r.result === "win" ? l.wonLabel : l.lostLabel}{r.skipped ? ` ${l.skippedLabel}` : ""}{r.survived ? " ♡" : ""}
                </button>
              ))}
              {roundIdx >= rounds.length && <span className="rounded-lg bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400 ring-2 ring-cyan-500 ring-offset-1 ring-offset-[#010409]">R{roundNum}</span>}
            </div>
          )}

          {roundMode === "input" && (
            <div className={`${ds.card} ${ds.cardInner} space-y-5`}>
              <button onClick={() => { setSurvived(!survived); if(!survived) setRoundForm(f => ({ ...f, deathLocation: "", enemyCount: "" })); }}
                className={`w-full rounded-lg border-2 py-4 text-base font-extrabold uppercase tracking-wider transition-all duration-200 ${survived ? "border-emerald-400 bg-emerald-500/15 text-emerald-400 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30" : "border-[#1e2a3a] bg-[#0d1117] text-neutral-500 hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/5"}`}>
                {survived ? "✓ " : "♡ "}{l.survived}
              </button>

              {!survived && (<>
                <div><Label text={l.deathLocation} />
                  <select value={roundForm.deathLocation} onChange={(e) => updateRound("deathLocation", e.target.value)} className={ds.selectBase}>
                    <option value="" disabled className="bg-[#010409]">{l.deathLocationPh}</option>
                    {locations.map((loc) => <option key={loc} value={loc} className="bg-[#010409]">{loc}</option>)}
                  </select><InlineError msg={roundErrors.deathLocation} /></div>
                <div><Label text={l.enemyCount} />
                  <select value={roundForm.enemyCount} onChange={(e) => updateRound("enemyCount", e.target.value)} className={ds.selectBase}>
                    <option value="" disabled className="bg-[#010409]">{l.enemyCountPh}</option>
                    {[1,2,3,4,5].map((n) => <option key={n} value={String(n)} className="bg-[#010409]">{n}</option>)}
                  </select><InlineError msg={roundErrors.enemyCount} /></div>
              </>)}

              <div><Label text={l.yourNote} />
                <textarea value={roundForm.yourNote} onChange={(e) => updateRound("yourNote", e.target.value)}
                  placeholder={survived ? (lang === "tr" ? "ör. lurk oynadım, info verdim…" : "e.g. lurked, gave info…") : l.yourNotePh}
                  rows={3} className={ds.inputBase + " resize-none"} /><InlineError msg={roundErrors.yourNote} /></div>

              <div><Label text={l.roundResult} />
                <div className="flex gap-3">
                  <button onClick={() => handleSubmitRound("win")} className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3.5 text-sm font-bold text-emerald-400 transition-all hover:bg-emerald-500/20 active:scale-[0.98]">{l.roundResultWin}</button>
                  <button onClick={() => handleSubmitRound("loss")} className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 py-3.5 text-sm font-bold text-red-400 transition-all hover:bg-red-500/20 active:scale-[0.98]">{l.roundResultLoss}</button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button onClick={() => setRoundMode("skipConfirm")} className={ds.btnSecondary}>{l.skipRound}</button>
                <div className="flex gap-3">
                  <button onClick={handleBack} className={ds.btnSecondary}>{l.back}</button>
                  <button onClick={handleFinishFromInput} className={ds.btnAccent}>{l.finishMatch}</button>
                </div>
              </div>
            </div>
          )}

          {roundMode === "skipConfirm" && (
            <div className={`${ds.card} p-6 sm:p-8 space-y-5 text-center`}>
              <p className="text-sm font-bold text-white">{l.skipConfirmTitle}</p>
              <div className="flex gap-3">
                <button onClick={() => handleSkipConfirm("win")} className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3.5 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/20">{l.yes}</button>
                <button onClick={() => handleSkipConfirm("loss")} className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 py-3.5 text-sm font-bold text-red-400 transition hover:bg-red-500/20">{l.no}</button>
              </div>
              <button onClick={() => setRoundMode("input")} className={ds.btnSecondary}>{l.back}</button>
            </div>
          )}

          {roundMode === "feedback" && currentFeedback && (
            <div className="space-y-5">
              <div className={`${ds.card} ${ds.cardInner}`}>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-400">{l.feedbackTitle}</h2>
                  <div className="flex items-center gap-2">
                    {survived && <span className="rounded-md bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 shadow-sm shadow-emerald-500/10">{l.survivedShort}</span>}
                    <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase border ${currentResult === "win" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>{currentResult === "win" ? l.roundResultWin : l.roundResultLoss}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <FeedbackCard icon="✕" color="text-red-400" label={l.mainMistake} text={currentFeedback.mainMistake} />
                  <FeedbackCard icon="◎" color="text-amber-400" label={l.enemyHabit} text={currentFeedback.enemyHabit} />
                  <FeedbackCard icon="⚡" color="text-cyan-400" label={l.microPlan} text={currentFeedback.microPlan} />
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={handleNextRound} className={ds.btnPrimary}>{l.nextRound}</button>
                <div className="flex gap-3"><button onClick={handleBack} className={ds.btnSecondary}>{l.back}</button><button onClick={handleFinishFromFeedback} className={ds.btnAccent}>{l.finishMatch}</button></div>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  /* ════════════════════════════════════════════
     SCORE INPUT
     ════════════════════════════════════════════ */

  if (screen === "scoreInput") {
    return (
      <main className={`${ds.pageBg} relative flex items-center justify-center px-4`}>
        <MapBg map={setup.map} />
        <div className="relative z-10 w-full max-w-md space-y-8">
          <div className="text-center space-y-1"><AimloLogo size={36} className="mx-auto opacity-60 mb-2" /><h2 className="text-xl font-bold text-white">{l.scoreTitle}</h2></div>
          <div className={`${ds.card} ${ds.cardInner} space-y-5`}>
            <Label text={l.selectScore} />
            <div className="grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto pr-1">
              {SCORE_OPTIONS.map((s) => {
                const [y, e] = s.split(" - "); const isWin = Number(y) > Number(e);
                const selected = matchScore.yours === y && matchScore.enemy === e;
                return (
                  <button key={s} onClick={() => setMatchScore({ yours: y, enemy: e })}
                    className={`rounded-xl border py-3 text-sm font-bold transition-all ${selected ? "border-cyan-500 bg-cyan-500/15 text-white ring-1 ring-cyan-500/50 shadow-lg" : isWin ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10" : "border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10"}`}>
                    {s}
                  </button>
                );
              })}
            </div>
            <div className="space-y-3 pt-2">
              <button onClick={() => { if (matchScore.yours && matchScore.enemy) finishWithScore(matchScore.yours, matchScore.enemy); }} disabled={!matchScore.yours || !matchScore.enemy} className={ds.btnPrimary}>{l.confirmScore}</button>
              <button onClick={() => setScreen("round")} className={ds.btnSecondary}>{l.back}</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ════════════════════════════════════════════
     REPORT (just completed) — with round counts & return to menu
     ════════════════════════════════════════════ */

  if (screen === "report" && report) {
    return (
      <main className={`${ds.pageBg} relative`}>
        <MapBg map={setup.map} />
        <Navbar user={user} lang={lang} onSignOut={handleSignOut} onLogoClick={() => setScreen("dashboard")} onLangToggle={handleLangToggle} signOutLabel={l.authSignOut} />
        <div className="relative z-10 mx-auto max-w-lg px-4 pt-20 pb-12 space-y-6">
          <div className="text-center space-y-1"><h2 className="text-2xl font-bold text-white">{l.reportTitle}</h2><p className="text-sm text-neutral-500">{setup.map} · {setup.agent}</p></div>

          <div className={`${ds.card} overflow-hidden`}>
            <div className="relative p-6">
              <div className="pointer-events-none absolute inset-0 opacity-[0.15]"><img src={MAP_IMAGES[setup.map]} alt="" className="h-full w-full object-cover" /></div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="relative flex items-end justify-between">
                <div>
                  <p className={ds.label}>{l.matchResult}</p>
                  <p className="mt-1 text-4xl font-extrabold tracking-tight text-white">{report.scoreStr}</p>
                  <p className={`mt-1.5 text-xs font-bold uppercase ${report.matchWon ? "text-emerald-400" : "text-red-400"}`}>{report.matchWon ? l.victory : l.defeat}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-lg font-extrabold text-cyan-400">{report.winPct}%</p>
                </div>
              </div>
              <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500" style={{ width: `${report.winPct}%` }} /></div>
              {/* Round count breakdown — always visible */}
              <div className="relative mt-3 grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wider">
                <div><span className="text-neutral-500">{l.enteredRounds}</span><br/><span className="text-white text-sm">{report.total}</span></div>
                <div><span className="text-neutral-500">{l.roundsWon}</span><br/><span className="text-emerald-400 text-sm">{report.won}</span></div>
                <div><span className="text-neutral-500">{l.roundsLost}</span><br/><span className="text-red-400 text-sm">{report.lost}</span></div>
                <div><span className="text-neutral-500">{l.roundsSkipped}</span><br/><span className="text-neutral-400 text-sm">{report.skipped}</span></div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center">
            {rounds.map((r, i) => (
              <span key={i} className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase border ${r.result === "win" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"} ${r.skipped ? "opacity-40" : ""}`}>
                R{r.roundNumber} {r.result === "win" ? l.wonLabel : l.lostLabel}{r.skipped ? ` ${l.skippedLabel}` : ""}{r.survived ? " ♡" : ""}
              </span>
            ))}
          </div>

          <div className="space-y-4">
            <ReportCard icon="◈" color="text-cyan-400" label={l.overallSummary} text={report.summary} />
            <ReportCard icon="✕" color="text-red-400" label={l.mainRecurringMistake} text={report.mistake} />
            <ReportCard icon="◎" color="text-amber-400" label={l.enemyTendencies} text={report.tendencies} />
            <ReportCard icon="▸" color="text-emerald-400" label={l.suggestedAdjustment} text={report.adjustment} />
          </div>

          <div className="space-y-3">
            <button onClick={resetForNewMatch} className={ds.btnPrimary}>{l.newMatch}</button>
            <button onClick={() => { setScreen("dashboard"); loadHistory(); }} className={ds.btnSecondary}>{l.returnToMenu}</button>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
