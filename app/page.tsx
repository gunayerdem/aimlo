"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

type Lang = "tr" | "en";
type Screen = "lang" | "setup" | "round" | "scoreInput" | "report";
type RoundResult = "win" | "loss";
type SetupStep = "map" | "agent" | "side" | "comp";

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
  Icebox: "https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9a90-8f8f0db9d87e/splash.png",
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
   i18n
   ══════════════════════════════════════════════════════════ */

const t = {
  tr: {
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
    startMatch: "Oyunu Başlat",
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
    stepMap: "Harita",
    stepAgent: "Ajan",
    stepSide: "Taraf",
    stepComp: "Kompozisyon",
    roundResult: "Round Sonucu",
    yourTeam: "Takımın",
    enemyTeam: "Düşman Takımı",
    locked: "Kilitli",
    selectScore: "Skor seçin",
    compTitle: "Takım Kompozisyonları",
    agentPool: "Ajan Havuzu",
    victory: "Zafer",
    defeat: "Yenilgi",
    // AUTH
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
  },
  en: {
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
    stepMap: "Map",
    stepAgent: "Agent",
    stepSide: "Side",
    stepComp: "Comp",
    roundResult: "Round Result",
    yourTeam: "Your Team",
    enemyTeam: "Enemy Team",
    locked: "Locked",
    selectScore: "Select score",
    compTitle: "Team Compositions",
    agentPool: "Agent Pool",
    victory: "Victory",
    defeat: "Defeat",
    // AUTH
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
  },
};

/* ══════════════════════════════════════════════════════════
   ROUND FEEDBACK GENERATOR
   ══════════════════════════════════════════════════════════ */

function genRoundFeedback(setup: SetupData, form: RoundForm, result: RoundResult, allRounds: RoundData[], lang: Lang): RoundFeedback {
  const isTr = lang === "tr";
  const loc = form.deathLocation;
  const cnt = form.enemyCount;
  const note = form.yourNote.toLowerCase();
  const sideLabel = isTr ? (setup.side === "attack" ? "saldırı" : "savunma") : (setup.side === "attack" ? "attack" : "defense");
  const prevDeaths = allRounds.filter((r) => !r.skipped && r.deathLocation === loc);
  const repeatCount = prevDeaths.length;

  let mistake: string;
  if (repeatCount >= 2) {
    mistake = isTr
      ? `${loc} konumunda daha önce ${repeatCount} kez öldün. Bu pozisyonu tekrar tekrar kullanman düşmana okuma kolaylığı sağlıyor. Farklı bir açıya geçmeyi düşün.`
      : `You've died at ${loc} ${repeatCount} times before. Repeating this position makes you predictable. Consider switching to a different angle.`;
  } else if (Number(cnt) >= 3) {
    mistake = isTr
      ? `${loc} konumunda ${cnt} düşmana karşı sayısal dezavantajdaydın. Geri çekilip bilgi vermeliydin.`
      : `You faced ${cnt} enemies at ${loc}, putting you at a numerical disadvantage. Fall back and call info.`;
  } else if (note.includes("rotate") || note.includes("rotasyon") || note.includes("döndüm")) {
    mistake = isTr
      ? `Rotasyonun ${loc} bölgesinde seni açık bıraktı. ${sideLabel} tarafında erken rotasyon yapmak düşmana kolay entry verir.`
      : `Your rotation left you exposed at ${loc}. On ${sideLabel} side, rotating early gives the enemy easy entry.`;
  } else if (note.includes("solo") || note.includes("tek")) {
    mistake = isTr
      ? `${loc} bölgesinde solo oynaman riskli oldu. Takım desteği olmadan bu pozisyonda tutunamaman normal.`
      : `Playing solo at ${loc} was risky. It's expected to struggle holding without team support.`;
  } else if (note.includes("util") || note.includes("ability") || note.includes("yetenek")) {
    mistake = isTr
      ? `Utility kullandıktan sonra ${loc} konumunda savunmasız kaldın. Util sonrası kısa bir bekleme ekle.`
      : `After using utility you were left vulnerable at ${loc}. Add a short delay after ability usage.`;
  } else {
    mistake = isTr
      ? `${loc} konumunda pozisyonun ${sideLabel} tarafı için ideal değildi. ${cnt} düşmanla karşılaşırken daha korunaklı bir açı seçmeliydin.`
      : `Your position at ${loc} wasn't ideal for ${sideLabel} side. When facing ${cnt} enemies, choose a more covered angle.`;
  }

  const avgEnemy = allRounds.length > 0
    ? (allRounds.filter((r) => !r.skipped).reduce((s, r) => s + Number(r.enemyCount || 0), 0) / Math.max(allRounds.filter((r) => !r.skipped).length, 1)).toFixed(1)
    : cnt;

  let habit: string;
  if (Number(cnt) >= 4) {
    habit = isTr
      ? `Düşman bu bölgeye ${cnt} kişiyle geldi. Yoğun baskı uygulamaya devam ediyorlar.`
      : `The enemy pushed this area with ${cnt} players. They continue applying heavy pressure.`;
  } else if (Number(cnt) <= 2) {
    habit = isTr
      ? `Düşman sadece ${cnt} kişiyle hareket etti. Bu temkinli bir oyun tarzı veya lurker paterni olabilir.`
      : `The enemy moved with only ${cnt} players. Could be cautious play or a lurker pattern.`;
  } else {
    habit = isTr
      ? `Düşman ortalama ${avgEnemy} kişilik gruplarla ${loc} bölgesine baskı yapıyor. Default setup kullanıyor olabilirler.`
      : `The enemy is pressing ${loc} with groups averaging ${avgEnemy}. They might be running a default setup.`;
  }

  const altLocations = (MAP_LOCATIONS[setup.map] ?? []).filter((x) => x !== loc);
  const suggestedLoc = altLocations[Math.floor(Math.random() * altLocations.length)] || loc;

  let microPlan: string;
  if (result === "loss" && repeatCount >= 2) {
    microPlan = isTr
      ? `Bu round ${suggestedLoc} konumunda oyna. Derin açı tut ve ilk bilgiyi bekle. Utility'ni agresif kullanma.`
      : `Play ${suggestedLoc} this round. Hold a deep angle and wait for first info. Don't use utility aggressively.`;
  } else if (result === "loss" && Number(cnt) >= 3) {
    microPlan = isTr
      ? `Retake oyna. Site'ı direkt tutma, ${suggestedLoc} civarında geri dur ve takımını bekle.`
      : `Play retake. Don't hold site directly, fall back near ${suggestedLoc} and wait for your team.`;
  } else if (result === "loss") {
    microPlan = isTr
      ? `${suggestedLoc} konumuna geç. Utility'ni erken kullan ve geri çekil. Trade pozisyonu kur.`
      : `Switch to ${suggestedLoc}. Use utility early and fall back. Set up a trade position.`;
  } else if (note.includes("solo") || note.includes("tek")) {
    microPlan = isTr
      ? `Bu round crossfire kur. Takım arkadaşınla birlikte pozisyon al ve trade garantile.`
      : `Set up a crossfire this round. Position with a teammate and guarantee a trade.`;
  } else {
    microPlan = isTr
      ? `Aynı stratejiyi koru ama açını hafifçe değiştir. ${suggestedLoc} iyi bir alternatif olabilir.`
      : `Keep the same strategy but slightly shift your angle. ${suggestedLoc} could be a good alternative.`;
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
  const total = rounds.length;
  const winPct = total > 0 ? Math.round((won / total) * 100) : 0;
  const nonSkipped = rounds.filter((r) => !r.skipped);
  const locationCounts: Record<string, number> = {};
  nonSkipped.forEach((r) => { if (r.deathLocation) locationCounts[r.deathLocation] = (locationCounts[r.deathLocation] || 0) + 1; });
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

  const summary = isTr
    ? `${setup.map} haritasında ${setup.agent} ile ${sideLabel} tarafında oynadın. Final skoru: ${scoreStr}. ${total} round loglandı (${skipped} atlanan). En çok ${topDeathLoc} bölgesinde öldün (${topDeathCount} kez). Ortalama düşman sayısı: ${avgEnemy}.`
    : `Played ${setup.map} as ${setup.agent} on ${sideLabel}. Final score: ${scoreStr}. ${total} rounds logged (${skipped} skipped). Most deaths at ${topDeathLoc} (${topDeathCount} times). Avg enemy count: ${avgEnemy}.`;

  let mistake: string;
  if (topDeathCount >= 3) {
    mistake = isTr
      ? `${topDeathLoc} konumunda ${topDeathCount} kez öldün. Bu tekrar eden pozisyon hatası düşmana seni okuma kolaylığı sağlıyor.`
      : `You died at ${topDeathLoc} ${topDeathCount} times. This recurring position makes you predictable.`;
  } else if (hasRotateIssue) {
    mistake = isTr ? `Birden fazla round'da erken rotasyon sorunu yaşadın.` : `You had early rotation issues in multiple rounds.`;
  } else if (hasSoloIssue) {
    mistake = isTr ? `Birçok round'da solo oynadığını belirttin. Takım koordinasyonu eksik.` : `You noted playing solo in several rounds. Team coordination is lacking.`;
  } else if (hasUtilIssue) {
    mistake = isTr ? `Utility zamanlamanla ilgili sorunlar tespit edildi.` : `Issues detected with your utility timing.`;
  } else {
    mistake = isTr
      ? `${topDeathLoc} konumunda tekrar eden ölümler ve genel pozisyonlama sorunları göze çarpıyor.`
      : `Recurring deaths at ${topDeathLoc} and general positioning issues stand out.`;
  }

  const enemyAgents = setup.unknownEnemyComp ? (isTr ? "bilinmiyor" : "unknown") : setup.enemyComp.filter(Boolean).join(", ");
  const tendencies = isTr
    ? `Düşman (${enemyAgents}) ortalama ${avgEnemy} kişilik gruplarla hareket etti. ${matchWon ? "Baskı yapsa da takımın iyi karşılık verdi." : "Sayısal üstünlükle baskı kurdu."}`
    : `Enemy (${enemyAgents}) moved in groups averaging ${avgEnemy}. ${matchWon ? "Despite pressure, your team responded well." : "Applied pressure with numerical advantage."}`;

  const adjustment = isTr
    ? `Bir sonraki maçta ${topDeathLoc !== "N/A" ? `${topDeathLoc} yerine farklı açılardan oyna.` : ""} ${setup.agent} olarak utility'ni daha stratejik zamanla. ${matchWon ? "İyi performans, pozisyon çeşitliliğini artır." : "Retake pozisyonlarına erken geç, gereksiz peek'lerden kaçın."}`
    : `Next match${topDeathLoc !== "N/A" ? `, play different angles instead of ${topDeathLoc}.` : "."} As ${setup.agent}, time utility more strategically. ${matchWon ? "Good performance, increase positional variety." : "Set up retake earlier, avoid unnecessary peeks."}`;

  return { summary, mistake, tendencies, adjustment, won, lost, skipped, total, winPct, scoreStr, matchWon };
}

/* ══════════════════════════════════════════════════════════
   UI PRIMITIVES
   ══════════════════════════════════════════════════════════ */

function Label({ text }: { text: string }) {
  return <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-neutral-500">{text}</label>;
}

function InlineError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-red-400">{msg}</p>;
}

const sel = "w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-30";
const inp = "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 resize-none";
const btnP = "w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-40";
const btnS = "w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-medium text-neutral-400 transition hover:border-white/20 hover:text-white";
const btnAccent = "w-full rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-3 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20";

function Header({ title, subtitle, lang, onLangClick, user, onSignOut, signOutLabel }: { title: string; subtitle: string; lang: Lang; onLangClick: () => void; user?: User | null; onSignOut?: () => void; signOutLabel?: string }) {
  return (
    <div className="text-center relative z-10">
      <div className="flex items-center justify-center gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">{title}</h1>
        <button onClick={onLangClick} className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-neutral-500 transition hover:border-indigo-500/40 hover:text-white">
          {lang === "tr" ? "TR" : "EN"}
        </button>
      </div>
      <p className="mt-1.5 text-sm text-neutral-500">{subtitle}</p>
      {user && onSignOut && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-[11px] text-neutral-600 truncate max-w-[200px]">{user.email}</span>
          <button onClick={onSignOut} className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-neutral-500 transition hover:border-red-500/40 hover:text-red-400">
            {signOutLabel}
          </button>
        </div>
      )}
    </div>
  );
}

function AgentAvatar({
  name,
  img,
  accent,
  initials,
  sizeClass,
  textClass,
}: {
  name: string;
  img: string;
  accent: string;
  initials: string;
  sizeClass: string;
  textClass: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`${sizeClass} overflow-hidden rounded-lg bg-black/30`}>
      {img && !failed ? (
        <img
          src={img}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center font-bold ${accent} ${textClass}`}>
          {initials}
        </div>
      )}
    </div>
  );
}

function ReportCard({ icon, color, label, text }: { icon: string; color: string; label: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 sm:p-6">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <h3 className={`text-[11px] font-bold uppercase tracking-widest ${color}`}>{label}</h3>
      </div>
      <p className="text-sm leading-relaxed text-neutral-300">{text}</p>
    </div>
  );
}

function FeedbackCard({ icon, color, label, text }: { icon: string; color: string; label: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <h4 className={`text-[10px] font-bold uppercase tracking-widest ${color}`}>{label}</h4>
      </div>
      <p className="text-sm leading-relaxed text-neutral-300">{text}</p>
    </div>
  );
}

function MapBg({ map }: { map: string }) {
  const url = MAP_IMAGES[map];
  if (!url) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <img src={url} alt="" className="h-full w-full object-cover opacity-[0.12] blur-sm" />
      <div className="absolute inset-0 bg-neutral-950/60" />
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
    <button
      onClick={onClick}
      disabled={(disabled && !selected) || locked}
      className={`group relative flex flex-col items-center gap-1 rounded-xl border p-2 transition ${
        selected
          ? `${border} bg-gradient-to-b ${colors} ring-1 ring-indigo-400/30`
          : disabled
          ? "cursor-not-allowed border-white/5 bg-white/[0.01] opacity-25"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-black/30">
        {img ? (
          <img src={img} alt={name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center text-[10px] font-bold ${accent}`}>{getAgentInitials(name)}</div>
        )}
      </div>
      <span className="text-[9px] font-medium text-neutral-300 leading-tight text-center truncate w-full">{name}</span>
      {selected && !locked && <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-indigo-500 border border-neutral-950" />}
      {locked && <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 border border-neutral-950" />}
    </button>
  );
}

function CompSlot({ agent, index, onRemove, locked }: { agent: string; index: number; onRemove: () => void; locked?: boolean }) {
  const role = agent ? getAgentRole(agent) : "";
  const accent = agent ? AGENT_ACCENT[role] : "";
  const img = agent ? agentImgUrl(agent) : "";

  return (
    <div
      onClick={() => agent && !locked && onRemove()}
      className={`flex h-16 w-16 flex-col items-center justify-center rounded-xl border transition ${
        agent
          ? locked
            ? "border-amber-500/40 bg-amber-500/5 cursor-default"
            : "border-indigo-500/40 bg-indigo-500/10 cursor-pointer hover:border-red-500/40"
          : "border-dashed border-white/10 bg-white/[0.01]"
      }`}
    >
      {agent ? (
        <>
          <div className="h-7 w-7 overflow-hidden rounded-lg bg-black/30">
            {img ? (
              <img src={img} alt={agent} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className={`flex h-full w-full items-center justify-center text-[9px] font-bold ${accent}`}>{getAgentInitials(agent)}</div>
            )}
          </div>
          <span className="mt-0.5 text-[8px] text-neutral-400 leading-tight truncate w-full text-center">{agent}</span>
        </>
      ) : (
        <span className="text-[11px] text-neutral-600 font-medium">{index + 1}</span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   AUTH SCREEN
   ══════════════════════════════════════════════════════════ */

function AuthScreen({ lang, onAuth }: { lang: Lang | null; onAuth: (user: User) => void }) {
  const [authLang, setAuthLang] = useState<Lang>(lang ?? "tr");
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);

  const al = t[authLang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
        });
        if (err) { setError(err.message); setLoading(false); return; }
        if (data.user && !data.session) {
          setCheckEmail(true);
          setLoading(false);
          return;
        }
        if (data.user && data.session) {
          onAuth(data.user);
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) { setError(err.message); setLoading(false); return; }
        if (data.user) {
          onAuth(data.user);
        }
      }
    } catch {
      setError(al.authError);
    }
    setLoading(false);
  }

  if (checkEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Mentu</h1>
          <div className="mx-auto h-0.5 w-10 rounded-full bg-indigo-500" />
          <div className="rounded-2xl border border-white/[0.06] bg-neutral-950/80 p-6 space-y-4">
            <div className="text-3xl">✉️</div>
            <p className="text-sm text-neutral-300">{al.authCheckEmail}</p>
            <button onClick={() => { setCheckEmail(false); setMode("login"); }} className={btnS}>
              {al.authLogin}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Mentu</h1>
          <div className="mx-auto mt-3 h-0.5 w-10 rounded-full bg-indigo-500" />
          <p className="mt-3 text-sm text-neutral-500">
            {mode === "login" ? al.authLogin : al.authRegister}
          </p>
          <button
            onClick={() => setAuthLang(authLang === "tr" ? "en" : "tr")}
            className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-neutral-500 transition hover:border-indigo-500/40 hover:text-white"
          >
            {authLang === "tr" ? "TR" : "EN"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/[0.06] bg-neutral-950/80 backdrop-blur-sm p-6 sm:p-8 space-y-5">
          <div>
            <Label text={al.authEmail} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={al.authEmailPh}
              required
              className={inp}
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
              className={inp}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">{error}</p>
          )}

          <button type="submit" disabled={loading} className={btnP}>
            {loading ? al.authLoading : mode === "login" ? al.authLogin : al.authRegister}
          </button>

          <p className="text-center text-xs text-neutral-500">
            {mode === "login" ? al.authNoAccount : al.authHasAccount}{" "}
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="text-indigo-400 hover:text-indigo-300 transition font-medium"
            >
              {mode === "login" ? al.authRegister : al.authLogin}
            </button>
          </p>
        </form>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function Home() {
  /* ── AUTH STATE ── */
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setScreen("lang");
  }

  /* ── APP STATE ── */
  const [lang, setLang] = useState<Lang | null>(null);
  const [screen, setScreen] = useState<Screen>("lang");

  const [setup, setSetup] = useState<SetupData>({ map: "", agent: "", side: "", teamComp: [], enemyComp: [], unknownEnemyComp: false });
  const [setupStep, setSetupStep] = useState<SetupStep>("map");
  const [setupErrors, setSetupErrors] = useState<FormErrors>({});
  const [compTarget, setCompTarget] = useState<CompTarget>("team");

  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [roundForm, setRoundForm] = useState<RoundForm>({ deathLocation: "", enemyCount: "", yourNote: "" });
  const [roundErrors, setRoundErrors] = useState<FormErrors>({});
  const [roundMode, setRoundMode] = useState<RoundScreenMode>("input");
  const [currentFeedback, setCurrentFeedback] = useState<RoundFeedback | null>(null);
  const [currentResult, setCurrentResult] = useState<RoundResult | null>(null);

  const [matchScore, setMatchScore] = useState<MatchScore>({ yours: "", enemy: "" });
  const [pendingFinishRound, setPendingFinishRound] = useState<RoundData | null>(null);

  const [report, setReport] = useState<ReturnType<typeof genMatchReport> | null>(null);

  const locations = setup.map ? MAP_LOCATIONS[setup.map] ?? [] : [];
  const roundNum = roundIdx + 1;

  useEffect(() => {
    setSetup((prev) => {
      const comp = [...prev.teamComp];
      if (prev.agent) {
        const existsElsewhere = comp.indexOf(prev.agent);
        if (existsElsewhere > 0) comp.splice(existsElsewhere, 1);
        comp[0] = prev.agent;
        const cleaned = [prev.agent, ...comp.filter((a) => a && a !== prev.agent)];
        return { ...prev, teamComp: cleaned };
      } else {
        if (comp.length > 0 && comp[0]) {
          comp[0] = "";
        }
        return { ...prev, teamComp: comp.filter((a) => a) };
      }
    });
  }, [setup.agent]);

  /* ── AUTH LOADING / AUTH GATE ── */
  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-neutral-500">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <AuthScreen lang={lang} onAuth={(u) => setUser(u)} />;
  }

  /* ── HELPERS (unchanged) ── */
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
      if (idx >= 0) { arr.splice(idx, 1); }
      else if (arr.length < 5) { arr.push(agent); }
      return { ...prev, [type]: arr };
    });
    setSetupErrors((p) => { const n = { ...p }; delete n[type]; return n; });
  }

  function loadRoundAtIndex(idx: number) {
    setRoundIdx(idx);
    setRoundErrors({});
    setRoundMode("input");
    setCurrentFeedback(null);
    setCurrentResult(null);
    if (idx < rounds.length) {
      const r = rounds[idx];
      setRoundForm(r.skipped ? { deathLocation: "", enemyCount: "", yourNote: "" } : { deathLocation: r.deathLocation, enemyCount: r.enemyCount, yourNote: r.yourNote });
    } else {
      setRoundForm({ deathLocation: "", enemyCount: "", yourNote: "" });
    }
  }

  function saveRoundData(rd: RoundData) {
    setRounds((prev) => {
      const copy = [...prev];
      if (roundIdx < copy.length) copy[roundIdx] = rd;
      else copy.push(rd);
      return copy;
    });
  }

  function getRoundsForReport(extra?: RoundData): RoundData[] {
    const copy = [...rounds];
    if (extra) {
      if (roundIdx < copy.length) copy[roundIdx] = extra;
      else copy.push(extra);
    }
    return copy;
  }

  function goToScoreInput(extraRound?: RoundData) {
    if (extraRound) { setPendingFinishRound(extraRound); saveRoundData(extraRound); }
    else { setPendingFinishRound(null); }
    setMatchScore({ yours: "", enemy: "" });
    setScreen("scoreInput");
  }

  function finishWithScore(yours: string, enemy: string) {
    if (!lang) return;
    const sc: MatchScore = { yours, enemy };
    const allRounds = getRoundsForReport(pendingFinishRound ?? undefined);
    if (pendingFinishRound) setRounds(allRounds);
    setReport(genMatchReport(setup, allRounds, lang, sc));
    setScreen("report");
  }

  const SETUP_STEPS: SetupStep[] = ["map", "agent", "side", "comp"];

  function getStepLabel(step: SetupStep): string {
    if (!lang) return "";
    const ll = t[lang];
    const m: Record<SetupStep, string> = { map: ll.stepMap, agent: ll.stepAgent, side: ll.stepSide, comp: ll.stepComp };
    return m[step];
  }

  /* ── LANG SCREEN ── */
  if (screen === "lang" || !lang) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
        <div className="w-full max-w-xs space-y-10 text-center">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white">Mentu</h1>
            <div className="mx-auto mt-3 h-0.5 w-10 rounded-full bg-indigo-500" />
            <p className="mt-4 text-sm text-neutral-500">Dil seçin / Choose language</p>
            {user && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-[11px] text-neutral-600 truncate max-w-[200px]">{user.email}</span>
                <button onClick={handleSignOut} className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-neutral-500 transition hover:border-red-500/40 hover:text-red-400">
                  Sign Out
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {(["tr", "en"] as Lang[]).map((lg) => (
              <button key={lg} onClick={() => { setLang(lg); setScreen("setup"); setSetupStep("map"); }} className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] py-4 text-sm font-semibold text-white transition hover:border-indigo-500/50 hover:bg-indigo-500/10">
                {lg === "tr" ? "Türkçe" : "English"}
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const l = t[lang];

  /* ── SETUP SCREEN ── */
  if (screen === "setup") {
    const stepIdx = SETUP_STEPS.indexOf(setupStep);

    function nextStep() {
      const e: FormErrors = {};
      if (setupStep === "map" && !setup.map) e.map = l.required;
      if (setupStep === "agent" && !setup.agent) e.agent = l.required;
      if (setupStep === "side" && !setup.side) e.side = l.required;
      if (setupStep === "comp") {
        if (setup.teamComp.filter(Boolean).length < 5) e.teamComp = l.selectAll;
        if (!setup.unknownEnemyComp && setup.enemyComp.filter(Boolean).length < 5) e.enemyComp = l.selectAll;
      }
      setSetupErrors(e);
      if (Object.keys(e).length > 0) return;
      if (stepIdx < SETUP_STEPS.length - 1) { setSetupStep(SETUP_STEPS[stepIdx + 1]); setSetupErrors({}); }
      else {
        setRounds([]); setRoundIdx(0); setRoundForm({ deathLocation: "", enemyCount: "", yourNote: "" });
        setRoundErrors({}); setRoundMode("input"); setCurrentFeedback(null); setCurrentResult(null);
        setScreen("round");
      }
    }

    function prevStep() {
      if (stepIdx > 0) { setSetupStep(SETUP_STEPS[stepIdx - 1]); setSetupErrors({}); }
      else setScreen("lang");
    }

    const isLast = setupStep === "comp";

    return (
      <main className="relative flex min-h-screen items-start justify-center bg-neutral-950 px-4 py-10 sm:py-16">
        {setup.map && <MapBg map={setup.map} />}
        <div className="relative z-10 w-full max-w-2xl space-y-6">
          <Header title={l.setupTitle} lang={lang} onLangClick={() => setScreen("lang")} subtitle={l.subtitle} user={user} onSignOut={handleSignOut} signOutLabel={l.authSignOut} />

          <div className="flex items-center justify-center gap-1">
            {SETUP_STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <button onClick={() => { if (i <= stepIdx) { setSetupStep(s); setSetupErrors({}); } }}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                    i === stepIdx ? "bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/50" :
                    i < stepIdx ? "bg-white/5 text-neutral-400 hover:text-white cursor-pointer" :
                    "bg-white/[0.02] text-neutral-600"
                  }`}>
                  {getStepLabel(s)}
                </button>
                {i < SETUP_STEPS.length - 1 && <span className="text-neutral-700 text-xs">›</span>}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-neutral-950/80 backdrop-blur-sm p-6 sm:p-8 space-y-5">

            {setupStep === "map" && (
              <div>
                <Label text={l.map} />
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {MAPS.map((m) => (
                    <button key={m} onClick={() => updateSetup("map", m)}
                      className={`relative overflow-hidden rounded-xl border py-4 text-sm font-medium transition ${
                        setup.map === m
                          ? "border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/50"
                          : "border-white/10 bg-white/[0.02] text-neutral-400 hover:border-white/20 hover:text-white"
                      }`}>
                      {m}
                    </button>
                  ))}
                </div>
                <InlineError msg={setupErrors.map} />
              </div>
            )}

            {setupStep === "agent" && (
              <div>
                <Label text={l.agent} />
                {setup.agent && (
                  <div className="mb-3 flex items-center gap-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 px-3 py-2">
                    <div className="h-8 w-8 overflow-hidden rounded-lg bg-black/30">
                      <img src={agentImgUrl(setup.agent)} alt={setup.agent} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <span className="text-sm font-semibold text-white">{setup.agent}</span>
                    <span className="text-[10px] text-indigo-400 ml-auto">{l.selected}</span>
                  </div>
                )}
                <div className="space-y-4">
                  {Object.entries(AGENT_GROUPS).map(([group, agents]) => (
                    <div key={group}>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-600">{AGENT_GROUP_LABELS[group][lang]}</p>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                        {agents.map((a) => (
                          <AgentMiniCard key={a} name={a} selected={setup.agent === a} disabled={false}
                            onClick={() => updateSetup("agent", setup.agent === a ? "" : a)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <InlineError msg={setupErrors.agent} />
              </div>
            )}

            {setupStep === "side" && (
              <div>
                <Label text={l.side} />
                <div className="flex gap-3">
                  {([["attack", l.sideAttack], ["defense", l.sideDefense]] as const).map(([val, label]) => (
                    <button key={val} onClick={() => updateSetup("side", val)}
                      className={`flex-1 rounded-xl border py-4 text-sm font-semibold transition ${
                        setup.side === val
                          ? "border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/50"
                          : "border-white/10 bg-white/[0.02] text-neutral-400 hover:border-white/20 hover:text-white"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
                <InlineError msg={setupErrors.side} />
              </div>
            )}

            {setupStep === "comp" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">{l.compTitle}</h2>
                  <label className="flex cursor-pointer items-center gap-2 text-[11px] text-neutral-500">
                    <input type="checkbox" checked={setup.unknownEnemyComp}
                      onChange={(e) => updateSetup("unknownEnemyComp", e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 accent-indigo-500" />
                    {l.unknownEnemy}
                  </label>
                </div>

                <div className="flex gap-4 justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">{l.yourTeam}</p>
                      <span className="text-[9px] text-neutral-600">{l.slotsRemaining(5 - setup.teamComp.length)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <CompSlot key={i} agent={setup.teamComp[i] || ""} index={i}
                          locked={i === 0 && setup.teamComp[0] === setup.agent && !!setup.agent}
                          onRemove={() => {
                            if (i === 0 && setup.teamComp[0] === setup.agent) return;
                            const c = [...setup.teamComp]; c.splice(i, 1); updateSetup("teamComp", c);
                          }} />
                      ))}
                    </div>
                    <InlineError msg={setupErrors.teamComp} />
                  </div>

                  {!setup.unknownEnemyComp && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">{l.enemyTeam}</p>
                        <span className="text-[9px] text-neutral-600">{l.slotsRemaining(5 - setup.enemyComp.length)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <CompSlot key={i} agent={setup.enemyComp[i] || ""} index={i}
                            onRemove={() => { const c = [...setup.enemyComp]; c.splice(i, 1); updateSetup("enemyComp", c); }} />
                        ))}
                      </div>
                      <InlineError msg={setupErrors.enemyComp} />
                    </div>
                  )}
                </div>

                {!setup.unknownEnemyComp && (
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => setCompTarget("team")}
                      className={`rounded-lg px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                        compTarget === "team" ? "bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/40" : "bg-white/5 text-neutral-500 hover:text-white"
                      }`}>
                      + {l.yourTeam}
                    </button>
                    <button onClick={() => setCompTarget("enemy")}
                      className={`rounded-lg px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                        compTarget === "enemy" ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/40" : "bg-white/5 text-neutral-500 hover:text-white"
                      }`}>
                      + {l.enemyTeam}
                    </button>
                  </div>
                )}

                <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-600">{l.agentPool}</p>
                  <div className="space-y-3">
                    {Object.entries(AGENT_GROUPS).map(([group, agents]) => {
                      const target = setup.unknownEnemyComp ? "team" : compTarget;
                      const currentArr = target === "team" ? setup.teamComp : setup.enemyComp;
                      return (
                        <div key={group}>
                          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-neutral-700">{AGENT_GROUP_LABELS[group][lang]}</p>
                          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8">
                            {agents.map((a) => {
                              const isInCurrent = currentArr.includes(a);
                              const isLocked = target === "team" && a === setup.agent && setup.teamComp[0] === a;
                              return (
                                <AgentMiniCard key={a} name={a}
                                  selected={isInCurrent}
                                  disabled={isInCurrent && !isLocked}
                                  locked={isLocked}
                                  onClick={() => {
                                    if (isLocked) return;
                                    handleCompSelect(target === "team" ? "teamComp" : "enemyComp", a);
                                  }} />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button onClick={nextStep} className={btnP}>{isLast ? l.startMatch : l.next}</button>
              <button onClick={prevStep} className={btnS}>{l.back}</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ── ROUND SCREEN ── */
  if (screen === "round") {
    function validateRound(): FormErrors {
      const e: FormErrors = {};
      if (!roundForm.deathLocation) e.deathLocation = l.required;
      if (!roundForm.enemyCount) e.enemyCount = l.required;
      if (!roundForm.yourNote.trim()) e.yourNote = l.required;
      else if (roundForm.yourNote.trim().length < 10) e.yourNote = l.noteTooShort;
      return e;
    }

    function handleSubmitRound(result: RoundResult) {
      const e = validateRound();
      setRoundErrors(e);
      if (Object.keys(e).length > 0) return;
      if (!lang) return;
      const prevRounds = rounds.slice(0, roundIdx);
      const feedback = genRoundFeedback(setup, roundForm, result, prevRounds, lang);
      const rd: RoundData = { roundNumber: roundNum, deathLocation: roundForm.deathLocation, enemyCount: roundForm.enemyCount, yourNote: roundForm.yourNote, result, skipped: false, feedback };
      saveRoundData(rd);
      setCurrentFeedback(feedback);
      setCurrentResult(result);
      setRoundMode("feedback");
    }

    function handleSkipConfirm(result: RoundResult) {
      const rd: RoundData = { roundNumber: roundNum, deathLocation: "", enemyCount: "", yourNote: "", result, skipped: true, feedback: null };
      saveRoundData(rd);
      loadRoundAtIndex(roundIdx + 1);
    }

    function handleNextRound() { loadRoundAtIndex(roundIdx + 1); }

    function handleBack() {
      if (roundIdx > 0) loadRoundAtIndex(roundIdx - 1);
      else { setScreen("setup"); setSetupStep("comp"); }
    }

    function handleFinishFromFeedback() { goToScoreInput(); }

    function handleFinishFromInput() {
      const e = validateRound();
      if (Object.keys(e).length === 0 && lang) {
        const prevRounds = rounds.slice(0, roundIdx);
        const feedback = genRoundFeedback(setup, roundForm, "loss", prevRounds, lang);
        const rd: RoundData = { roundNumber: roundNum, deathLocation: roundForm.deathLocation, enemyCount: roundForm.enemyCount, yourNote: roundForm.yourNote, result: "loss", skipped: false, feedback };
        goToScoreInput(rd);
      } else {
        goToScoreInput();
      }
    }

    return (
      <main className="relative flex min-h-screen items-start justify-center bg-neutral-950 px-4 py-10 sm:py-16">
        <MapBg map={setup.map} />
        <div className="relative z-10 w-full max-w-lg space-y-6">
          <Header title={l.roundTitle(roundNum)} lang={lang} onLangClick={() => setScreen("lang")} subtitle={`${setup.map} · ${setup.agent} · ${setup.side === "attack" ? l.sideAttack : l.sideDefense}`} user={user} onSignOut={handleSignOut} signOutLabel={l.authSignOut} />

          {(rounds.length > 0 || roundIdx > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {rounds.map((r, i) => (
                <button key={i} onClick={() => loadRoundAtIndex(i)}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition hover:opacity-80 ${i === roundIdx ? "ring-1 ring-indigo-500" : ""} ${r.result === "win" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"} ${r.skipped ? "opacity-50" : ""}`}>
                  R{r.roundNumber} {r.result === "win" ? l.wonLabel : l.lostLabel}{r.skipped ? ` ${l.skippedLabel}` : ""}
                </button>
              ))}
              {roundIdx >= rounds.length && (
                <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 ring-1 ring-indigo-500">R{roundNum}</span>
              )}
            </div>
          )}

          {roundMode === "input" && (
            <div className="space-y-5 rounded-2xl border border-white/[0.06] bg-neutral-950/80 backdrop-blur-sm p-6 sm:p-8">
              <div>
                <Label text={l.deathLocation} />
                <select value={roundForm.deathLocation} onChange={(e) => updateRound("deathLocation", e.target.value)} className={sel}>
                  <option value="" disabled className="bg-neutral-900">{l.deathLocationPh}</option>
                  {locations.map((loc) => <option key={loc} value={loc} className="bg-neutral-900">{loc}</option>)}
                </select>
                <InlineError msg={roundErrors.deathLocation} />
              </div>
              <div>
                <Label text={l.enemyCount} />
                <select value={roundForm.enemyCount} onChange={(e) => updateRound("enemyCount", e.target.value)} className={sel}>
                  <option value="" disabled className="bg-neutral-900">{l.enemyCountPh}</option>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={String(n)} className="bg-neutral-900">{n}</option>)}
                </select>
                <InlineError msg={roundErrors.enemyCount} />
              </div>
              <div>
                <Label text={l.yourNote} />
                <textarea value={roundForm.yourNote} onChange={(e) => updateRound("yourNote", e.target.value)} placeholder={l.yourNotePh} rows={3} className={inp} />
                <InlineError msg={roundErrors.yourNote} />
              </div>
              <div>
                <Label text={l.roundResult} />
                <div className="flex gap-3">
                  <button onClick={() => handleSubmitRound("win")} className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20">{l.roundResultWin}</button>
                  <button onClick={() => handleSubmitRound("loss")} className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20">{l.roundResultLoss}</button>
                </div>
              </div>
              <div className="space-y-3 pt-1">
                <button onClick={() => setRoundMode("skipConfirm")} className={btnS}>{l.skipRound}</button>
                <div className="flex gap-3">
                  <button onClick={handleBack} className={btnS}>{l.back}</button>
                  <button onClick={handleFinishFromInput} className={btnAccent}>{l.finishMatch}</button>
                </div>
              </div>
            </div>
          )}

          {roundMode === "skipConfirm" && (
            <div className="space-y-5 rounded-2xl border border-amber-500/20 bg-neutral-950/80 backdrop-blur-sm p-6 sm:p-8 text-center">
              <p className="text-sm font-semibold text-white">{l.skipConfirmTitle}</p>
              <div className="flex gap-3">
                <button onClick={() => handleSkipConfirm("win")} className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20">{l.yes}</button>
                <button onClick={() => handleSkipConfirm("loss")} className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20">{l.no}</button>
              </div>
              <button onClick={() => setRoundMode("input")} className={btnS}>{l.back}</button>
            </div>
          )}

          {roundMode === "feedback" && currentFeedback && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.06] bg-neutral-950/80 backdrop-blur-sm p-6 sm:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">{l.feedbackTitle}</h2>
                  <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase ${currentResult === "win" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    {currentResult === "win" ? l.roundResultWin : l.roundResultLoss}
                  </span>
                </div>
                <div className="space-y-3">
                  <FeedbackCard icon="✕" color="text-red-400" label={l.mainMistake} text={currentFeedback.mainMistake} />
                  <FeedbackCard icon="◎" color="text-amber-400" label={l.enemyHabit} text={currentFeedback.enemyHabit} />
                  <FeedbackCard icon="⚡" color="text-indigo-400" label={l.microPlan} text={currentFeedback.microPlan} />
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={handleNextRound} className={btnP}>{l.nextRound}</button>
                <div className="flex gap-3">
                  <button onClick={handleBack} className={btnS}>{l.back}</button>
                  <button onClick={handleFinishFromFeedback} className={btnAccent}>{l.finishMatch}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  /* ── SCORE INPUT SCREEN ── */
  if (screen === "scoreInput") {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-neutral-950 px-4">
        <MapBg map={setup.map} />
        <div className="relative z-10 w-full max-w-md space-y-8">
          <Header title="Mentu" lang={lang} onLangClick={() => setScreen("lang")} subtitle={l.scoreTitle} user={user} onSignOut={handleSignOut} signOutLabel={l.authSignOut} />
          <div className="rounded-2xl border border-white/[0.06] bg-neutral-950/80 backdrop-blur-sm p-6 sm:p-8 space-y-5">
            <Label text={l.selectScore} />
            <div className="grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto pr-1">
              {SCORE_OPTIONS.map((s) => {
                const [y, e] = s.split(" - ");
                const isWin = Number(y) > Number(e);
                const selected = matchScore.yours === y && matchScore.enemy === e;
                return (
                  <button key={s} onClick={() => setMatchScore({ yours: y, enemy: e })}
                    className={`rounded-xl border py-3 text-sm font-bold transition ${
                      selected
                        ? "border-indigo-500 bg-indigo-500/15 text-white ring-1 ring-indigo-500/50"
                        : isWin
                        ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"
                        : "border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10"
                    }`}>
                    {s}
                  </button>
                );
              })}
            </div>
            <div className="space-y-3 pt-2">
              <button onClick={() => { if (matchScore.yours && matchScore.enemy) finishWithScore(matchScore.yours, matchScore.enemy); }}
                disabled={!matchScore.yours || !matchScore.enemy}
                className={btnP}>{l.confirmScore}</button>
              <button onClick={() => setScreen("round")} className={btnS}>{l.back}</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ── REPORT SCREEN ── */
  if (screen === "report" && report) {
    return (
      <main className="relative flex min-h-screen items-start justify-center bg-neutral-950 px-4 py-10 sm:py-16">
        <MapBg map={setup.map} />
        <div className="relative z-10 w-full max-w-lg space-y-8">
          <Header title={l.reportTitle} lang={lang} onLangClick={() => setScreen("lang")} subtitle={`${setup.map} · ${setup.agent}`} user={user} onSignOut={handleSignOut} signOutLabel={l.authSignOut} />

          <div className="rounded-2xl border border-white/[0.06] bg-neutral-950/80 backdrop-blur-sm p-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">{l.matchResult}</p>
                <p className="mt-1 text-3xl font-extrabold text-white">{report.scoreStr}</p>
                <p className={`mt-1 text-xs font-bold uppercase ${report.matchWon ? "text-emerald-400" : "text-red-400"}`}>
                  {report.matchWon ? l.victory : l.defeat}
                </p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-[11px] text-neutral-500">{l.roundsPlayed}: {report.total}</p>
                {report.skipped > 0 && <p className="text-[11px] text-neutral-500">{l.roundsSkipped}: {report.skipped}</p>}
                <p className="text-sm font-bold text-indigo-400">{report.winPct}%</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all" style={{ width: `${report.winPct}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-wider">
              <span className="text-emerald-400">{l.roundsWon}: {report.won}</span>
              <span className="text-red-400">{l.roundsLost}: {report.lost}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {rounds.map((r, i) => (
              <span key={i} className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${r.result === "win" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"} ${r.skipped ? "opacity-50" : ""}`}>
                R{r.roundNumber} {r.result === "win" ? l.wonLabel : l.lostLabel}{r.skipped ? ` ${l.skippedLabel}` : ""}
              </span>
            ))}
          </div>

          <div className="space-y-4">
            <ReportCard icon="◈" color="text-indigo-400" label={l.overallSummary} text={report.summary} />
            <ReportCard icon="✕" color="text-red-400" label={l.mainRecurringMistake} text={report.mistake} />
            <ReportCard icon="◎" color="text-amber-400" label={l.enemyTendencies} text={report.tendencies} />
            <ReportCard icon="▸" color="text-emerald-400" label={l.suggestedAdjustment} text={report.adjustment} />
          </div>

          <div className="space-y-3">
            <button onClick={() => {
              setSetup({ map: "", agent: "", side: "", teamComp: [], enemyComp: [], unknownEnemyComp: false });
              setRounds([]); setRoundIdx(0); setReport(null); setRoundMode("input"); setCurrentFeedback(null); setCurrentResult(null); setSetupStep("map"); setScreen("setup");
            }} className={btnP}>{l.newMatch}</button>
            <button onClick={() => { loadRoundAtIndex(rounds.length); setScreen("round"); }} className={btnS}>{l.back}</button>
          </div>
        </div>
      </main>
    );
  }

  return null;
}