(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://bzwnchzetebwrdedkjkq.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "sb_publishable_0wk7llQ2VHtSDN1qNeJWXQ_FTXgxmRD");
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/storage.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* ══════════════════════════════════════════════════════════
   AIMLO — LocalStorage Helpers
   ══════════════════════════════════════════════════════════ */ __turbopack_context__.s([
    "clearDraft",
    ()=>clearDraft,
    "loadDraft",
    ()=>loadDraft,
    "loadLang",
    ()=>loadLang,
    "saveDraft",
    ()=>saveDraft,
    "saveLang",
    ()=>saveLang
]);
const LS_KEYS = {
    draft: "aimlo_draft",
    lang: "aimlo_lang"
};
function saveDraft(d) {
    try {
        localStorage.setItem(LS_KEYS.draft, JSON.stringify(d));
    } catch  {}
}
function loadDraft() {
    try {
        const s = localStorage.getItem(LS_KEYS.draft);
        return s ? JSON.parse(s) : null;
    } catch  {
        return null;
    }
}
function clearDraft() {
    try {
        localStorage.removeItem(LS_KEYS.draft);
    } catch  {}
}
function saveLang(l) {
    try {
        localStorage.setItem(LS_KEYS.lang, l);
    } catch  {}
}
function loadLang() {
    try {
        const val = localStorage.getItem(LS_KEYS.lang);
        if (val === "tr" || val === "en") return val;
        return null;
    } catch  {
        return null;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/constants/design.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* ══════════════════════════════════════════════════════════
   AIMLO — Design System Constants
   ══════════════════════════════════════════════════════════ */ __turbopack_context__.s([
    "ds",
    ()=>ds
]);
const ds = {
    card: "rounded-2xl border border-white/[0.07] bg-[#0b1120]/80 shadow-lg shadow-black/25 backdrop-blur-sm",
    cardInner: "p-5 sm:p-6",
    cardHover: "transition-all duration-300 hover:border-white/[0.12] hover:bg-[#0e1528]/90 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-950/20",
    inputBase: "w-full rounded-xl border border-white/[0.08] bg-[#070c16] px-4 py-3 text-sm text-white outline-none transition-all duration-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 placeholder-neutral-600",
    selectBase: "w-full cursor-pointer appearance-none rounded-xl border border-white/[0.08] bg-[#070c16] px-4 py-3 text-sm text-white outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-30",
    btnPrimary: "w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-800/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-40",
    btnSecondary: "w-full rounded-xl border border-white/[0.08] bg-white/[0.02] py-3 text-sm font-medium text-neutral-400 transition-all duration-200 hover:border-white/[0.14] hover:text-white hover:bg-white/[0.05]",
    btnAccent: "w-full rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] py-3 text-sm font-semibold text-cyan-300 transition-all duration-200 hover:bg-cyan-500/[0.1] hover:border-cyan-500/35",
    label: "mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500",
    pageBg: "min-h-screen bg-[#050810]"
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/constants/game-data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* ══════════════════════════════════════════════════════════
   AIMLO — Game Constants (Agents, Maps, Scores)
   ══════════════════════════════════════════════════════════ */ __turbopack_context__.s([
    "AGENT_ACCENT",
    ()=>AGENT_ACCENT,
    "AGENT_BORDER",
    ()=>AGENT_BORDER,
    "AGENT_COLORS",
    ()=>AGENT_COLORS,
    "AGENT_GROUPS",
    ()=>AGENT_GROUPS,
    "AGENT_GROUP_LABELS",
    ()=>AGENT_GROUP_LABELS,
    "IC",
    ()=>IC,
    "MAPS",
    ()=>MAPS,
    "MAP_IMAGES",
    ()=>MAP_IMAGES,
    "MAP_LOCATIONS",
    ()=>MAP_LOCATIONS,
    "SCORE_OPTIONS",
    ()=>SCORE_OPTIONS,
    "agentImgUrl",
    ()=>agentImgUrl,
    "getAgentInitials",
    ()=>getAgentInitials,
    "getAgentRole",
    ()=>getAgentRole
]);
const AGENT_GROUPS = {
    Controllers: [
        "Brimstone",
        "Viper",
        "Omen",
        "Astra",
        "Harbor",
        "Clove"
    ],
    Duelists: [
        "Jett",
        "Raze",
        "Reyna",
        "Phoenix",
        "Yoru",
        "Neon",
        "Iso",
        "Waylay",
        "Veto"
    ],
    Initiators: [
        "Sova",
        "Breach",
        "Skye",
        "KAY/O",
        "Fade",
        "Gekko",
        "Tejo",
        "Miks"
    ],
    Sentinels: [
        "Sage",
        "Cypher",
        "Killjoy",
        "Chamber",
        "Deadlock",
        "Vyse"
    ]
};
const AGENT_GROUP_LABELS = {
    Controllers: {
        tr: "Kontrolcüler",
        en: "Controllers"
    },
    Duelists: {
        tr: "Düellistler",
        en: "Duelists"
    },
    Initiators: {
        tr: "Öncüler",
        en: "Initiators"
    },
    Sentinels: {
        tr: "Gözcüler",
        en: "Sentinels"
    }
};
const AGENT_COLORS = {
    Controllers: "from-emerald-500/30 to-emerald-900/20",
    Duelists: "from-red-500/30 to-red-900/20",
    Initiators: "from-sky-500/30 to-sky-900/20",
    Sentinels: "from-amber-500/30 to-amber-900/20"
};
const AGENT_BORDER = {
    Controllers: "border-emerald-500/50",
    Duelists: "border-red-500/50",
    Initiators: "border-sky-500/50",
    Sentinels: "border-amber-500/50"
};
const AGENT_ACCENT = {
    Controllers: "text-emerald-400",
    Duelists: "text-red-400",
    Initiators: "text-sky-400",
    Sentinels: "text-amber-400"
};
function getAgentRole(agent) {
    for (const [role, agents] of Object.entries(AGENT_GROUPS)){
        if (agents.includes(agent)) return role;
    }
    return "Controllers";
}
function getAgentInitials(name) {
    if (name === "KAY/O") return "K/O";
    return name.slice(0, 2).toUpperCase();
}
const AGENT_SLUGS = {
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
    Waylay: "df1cb487-4902-002e-5c17-d28e83e78588",
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
    Miks: "7c8a4701-4de6-9355-b254-e09bc2a34b72",
    Veto: "92eeef5d-43b5-1d4a-8d03-b3927a09034b"
};
function agentImgUrl(name) {
    const id = AGENT_SLUGS[name];
    if (!id) return "";
    return `https://media.valorant-api.com/agents/${id}/displayicon.png`;
}
const MAP_LOCATIONS = {
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
        "Garden"
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
        "CT Spawn"
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
        "CT Spawn"
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
        "CT Spawn"
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
        "CT Spawn"
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
        "CT Spawn"
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
        "CT Spawn"
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
        "CT Spawn"
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
        "CT Spawn"
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
        "CT Spawn"
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
        "CT Spawn"
    ]
};
const MAPS = Object.keys(MAP_LOCATIONS);
_c = MAPS;
const MAP_IMAGES = {
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
    Abyss: "https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/splash.png"
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
    "0 - 13"
];
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
    mid: "\u203A"
};
var _c;
__turbopack_context__.k.register(_c, "MAPS");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/useScrollReveal.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useScrollReveal",
    ()=>useScrollReveal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function useScrollReveal(threshold = 0.15) {
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useScrollReveal.useEffect": ()=>{
            const el = ref.current;
            if (!el) return;
            const obs = new IntersectionObserver({
                "useScrollReveal.useEffect": ([entry])=>{
                    if (entry.isIntersecting) {
                        setVisible(true);
                        obs.unobserve(el);
                    }
                }
            }["useScrollReveal.useEffect"], {
                threshold
            });
            obs.observe(el);
            return ({
                "useScrollReveal.useEffect": ()=>obs.disconnect()
            })["useScrollReveal.useEffect"];
        }
    }["useScrollReveal.useEffect"], [
        threshold
    ]);
    return {
        ref,
        visible
    };
}
_s(useScrollReveal, "F7BtIAxVh3vOWU1Jr24RYsj9CHc=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/constants/i18n.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "t",
    ()=>t
]);
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
        roundTitle: (n)=>`Round ${n}`,
        deathLocation: "Ölüm Konumu",
        deathLocationPh: "Konum seçin",
        enemyCount: "Düşman Sayısı",
        enemyCountPh: "Düşman sayısı seçin",
        yourNote: "Senin Notun",
        yourNotePh: "ör. rotate oldum, solo anchor oynuyordum, trade bekliyordum\u2026",
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
        slotsRemaining: (n)=>`${n} slot kaldı`,
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
        authForgotPassword: "Şifremi Unuttum",
        authResetSent: "Şifre sıfırlama linki e-postana gönderildi.",
        authResetEmail: "E-posta adresinizi girin",
        authResetSubmit: "Sıfırlama Linki Gönder",
        authResetBack: "Giriş'e Dön",
        authResendEmail: "Doğrulama Mailini Tekrar Gönder",
        authResendSuccess: "Doğrulama maili tekrar gönderildi!",
        authResendWait: "Lütfen biraz bekleyin",
        authInvalidEmail: "Geçerli bir e-posta adresi girin",
        authUsernameTooShort: "Kullanıcı adı en az 3 karakter olmalı",
        authPasswordTooShort: "Şifre en az 6 karakter olmalı",
        authUsernameTaken: "Bu kullanıcı adı zaten alınmış",
        authProfileWarning: "Hesap oluşturuldu ancak profil kaydedilemedi. Kullanıcı adı ile giriş çalışmayabilir.",
        authVerifiedSuccess: "E-posta doğrulandı! Şimdi giriş yapabilirsiniz.",
        authVerifiedError: "Doğrulama başarısız oldu. Lütfen tekrar deneyin.",
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
        landingHeroSub: "Her round sonrası kişiselleştirilmiş analiz ve geri bildirim al. Oyununu bir üst seviyeye taşı.",
        landingCTA: "AI Analiz Başlat",
        landingAboutTitle: "Hakkımızda",
        landingAboutText: "AIMLO, Valorant oyuncuları için yapay zeka destekli koçluk platformudur. Her maç sonrası detaylı analiz, round bazlı geri bildirim ve kişiselleştirilmiş gelişim önerileri sunar.",
        landingAboutMission: "Amacımız her seviyeden oyuncunun potansiyelini en üst düzeye çıkarmasına yardımcı olmaktır. Geleneksel istatistik araçları sadece rakamları gösterir; AIMLO neden kaybettiğinizi, hangi hatalarınızı tekrarladığınızı ve bir sonraki round'da ne yapmanız gerektiğini söyler.",
        landingB2BTitle: "Takımlar & Organizasyonlar",
        landingB2BText: "Espor organizasyonları ve takımlar için özel analiz panelleri, toplu oyuncu takibi ve koçluk araçları sunuyoruz. Takım performansını veriye dayalı kararlarla optimize edin.",
        landingB2CTitle: "Bireysel Oyuncular",
        landingB2CText: "Kendi temponuzda ilerleyin. Her maçınızı analiz edin, hatalarınızı tespit edin ve AI destekli önerilerle rank atlayın. Ücretsiz başlayın, gelişiminizi takip edin.",
        landingFaqTitle: "Sıkça Sorulan Sorular",
        landingBlogTitle: "Blog",
        landingBlogText: "Yakında! Valorant stratejileri, meta analizleri ve oyun geliştirme ipuçları burada paylaşılacak.",
        landingHelpText: "Sorularınız mı var? Bize e-posta gönderin, en kısa sürede dönüş yapalım.",
        landingHelpEmail: "İletişim: support@aimlo.gg",
        landingNav: {
            about: "Hakkımızda",
            blog: "Blog",
            faq: "SSS"
        },
        landingFaqs: [
            {
                q: "AIMLO ücretsiz mi?",
                a: "Evet, AIMLO'nun temel analiz ve koçluk özellikleri tamamen ücretsizdir. Maç kurulumu, round bazlı geri bildirim ve maç sonu raporu gibi tüm çekirdek özellikler ücretsiz planda yer alır. Gelişmiş AI destekli derinlemesine analiz, geçmiş maç karşılaştırması ve kişiselleştirilmiş gelişim haritası gibi premium özellikler ise yakında sunulacaktır."
            },
            {
                q: "Nasıl çalışıyor?",
                a: "AIMLO, maç sırasında her round sonrası girdiğin kısa notları yapay zeka motoruyla analiz eder. Ölüm konumun, karşılaştığın düşman sayısı ve kendi notların üzerinden anlık koçluk geri bildirimi üretir. Maç sonunda ise tüm round verilerini birleştirerek tekrarlayan hatalarını, düşman eğilimlerini ve stratejik öneriler içeren kapsamlı bir rapor oluşturur."
            },
            {
                q: "Hangi rank seviyelerine uygun?",
                a: "AIMLO, Iron'dan Radiant'a kadar her seviyedeki Valorant oyuncusu için tasarlanmıştır. Analiz motoru, oyuncunun seviyesine göre öneriler üretir. Düşük ranklarda temel pozisyonlama ve rotasyon hataları vurgulanırken, yüksek ranklarda utility zamanlaması, trade pozisyonları ve takım koordinasyonu gibi daha ileri konulara odaklanılır."
            },
            {
                q: "Verilerim güvende mi?",
                a: "Kesinlikle. Tüm kullanıcı verileri Supabase altyapısı üzerinde şifrelenmiş olarak saklanır ve Row Level Security (RLS) politikalarıyla korunur. Hiçbir kullanıcı başka bir kullanıcının verilerine erişemez. Maç analizlerin, round notların ve raporların yalnızca senin hesabın tarafından görüntülenebilir."
            },
            {
                q: "Yardıma ihtiyacım var, nasıl ulaşabilirim?",
                a: "Herhangi bir sorun, öneri veya geri bildirim için support@aimlo.gg adresine e-posta gönderebilirsin. Ekibimiz genellikle 24 saat içinde dönüş yapar. Ayrıca uygulama içi geri bildirim formunu da kullanabilirsin. Topluluk desteği ve güncellemeler için sosyal medya kanallarımızı da takip edebilirsin."
            }
        ],
        landingFeatures: [
            {
                icon: "zap",
                title: "Anlık Geri Bildirim",
                desc: "Her round sonrası AI destekli analiz"
            },
            {
                icon: "chart",
                title: "Detaylı Raporlar",
                desc: "Maç sonu kapsamlı performans raporu"
            },
            {
                icon: "target",
                title: "Hata Tespiti",
                desc: "Tekrarlayan hataları otomatik tespit"
            },
            {
                icon: "trend",
                title: "Gelişim Takibi",
                desc: "Zaman içindeki ilerlemenizi görün"
            }
        ],
        landingHowTitle: "Nasıl Çalışıyor?",
        landingHowSteps: [
            {
                step: "1",
                title: "Maç Kur",
                desc: "Harita, ajan ve takımını seç"
            },
            {
                step: "2",
                title: "Round Notları",
                desc: "Her round sonrası ölüm yeri ve notlarını gir"
            },
            {
                step: "3",
                title: "AI Analiz",
                desc: "Anlık geri bildirim ve öneriler al"
            },
            {
                step: "4",
                title: "Maç Raporu",
                desc: "Detaylı maç sonu analiz raporu gör"
            }
        ],
        landingDiffTitle: "Neden AIMLO?",
        landingDiffItems: [
            {
                title: "Sadece Rakam Değil, Çözüm",
                desc: "Diğer araçlar kill/death gösterir. AIMLO neden kaybettiğinizi açıklar."
            },
            {
                title: "Round Bazlı Koçluk",
                desc: "Her round sonrası stratejik öneriler alarak oyununuzu anında iyileştirin."
            },
            {
                title: "Kişisel Gelişim Haritası",
                desc: "Zaman içinde hatalarınızın nasıl azaldığını ve hangi alanlarda geliştiğinizi görün."
            }
        ],
        landingStatsTitle: "Platform İstatistikleri",
        landingStats: [
            {
                value: "10K+",
                label: "Analiz Edilen Round"
            },
            {
                value: "2.5K+",
                label: "Maç Raporu"
            },
            {
                value: "500+",
                label: "Aktif Oyuncu"
            },
            {
                value: "94%",
                label: "Memnuniyet"
            }
        ],
        goToDashboard: "Panele Git",
        homePage: "Ana Sayfa",
        dashTopAgent: "En Çok Kullanılan Ajan"
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
        roundTitle: (n)=>`Round ${n}`,
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
        slotsRemaining: (n)=>`${n} slots remaining`,
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
        authForgotPassword: "Forgot Password",
        authResetSent: "Password reset link has been sent to your email.",
        authResetEmail: "Enter your email address",
        authResetSubmit: "Send Reset Link",
        authResetBack: "Back to Sign In",
        authResendEmail: "Resend Verification Email",
        authResendSuccess: "Verification email has been resent!",
        authResendWait: "Please wait a moment",
        authInvalidEmail: "Please enter a valid email address",
        authUsernameTooShort: "Username must be at least 3 characters",
        authPasswordTooShort: "Password must be at least 6 characters",
        authUsernameTaken: "This username is already taken",
        authProfileWarning: "Account created but profile could not be saved. Username login may not work.",
        authVerifiedSuccess: "Email verified! You can now sign in.",
        authVerifiedError: "Verification failed. Please try again.",
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
        landingHeroSub: "Get personalized post-round analysis and feedback. Elevate your game to the next level.",
        landingCTA: "Start AI Analysis",
        landingAboutTitle: "About Us",
        landingAboutText: "AIMLO is an AI-powered coaching platform for Valorant players. We provide detailed post-match analysis, round-by-round feedback, and personalized improvement suggestions.",
        landingAboutMission: "Our mission is to help players of all levels reach their full potential. Traditional stat tools only show numbers; AIMLO tells you why you lost, which mistakes you repeat, and what to do next round.",
        landingB2BTitle: "Teams & Organizations",
        landingB2BText: "We offer custom analytics dashboards, bulk player tracking, and coaching tools for esports organizations and teams. Optimize your team's performance with data-driven decisions.",
        landingB2CTitle: "Individual Players",
        landingB2CText: "Progress at your own pace. Analyze every match, identify your mistakes, and climb ranks with AI-powered suggestions. Start for free and track your improvement.",
        landingFaqTitle: "Frequently Asked Questions",
        landingBlogTitle: "Blog",
        landingBlogText: "Coming soon! Valorant strategies, meta analyses, and gameplay tips will be shared here.",
        landingHelpText: "Have questions? Send us an email and we'll get back to you as soon as possible.",
        landingHelpEmail: "Contact: support@aimlo.gg",
        landingNav: {
            about: "About",
            blog: "Blog",
            faq: "FAQ"
        },
        landingFaqs: [
            {
                q: "Is AIMLO free?",
                a: "Yes, AIMLO's core coaching features are completely free. This includes match setup, round-by-round feedback, and end-of-match reports. Premium features like advanced AI-powered deep analysis, historical match comparison, and personalized improvement roadmaps will be available in upcoming plans."
            },
            {
                q: "How does it work?",
                a: "AIMLO analyzes the short notes you enter after each round using its AI engine. Based on your death location, enemy count, and personal notes, it generates instant coaching feedback. At the end of the match, all round data is combined to produce a comprehensive report covering recurring mistakes, enemy tendencies, and strategic recommendations."
            },
            {
                q: "What rank levels is it for?",
                a: "AIMLO is designed for every Valorant player from Iron to Radiant. The analysis engine adapts its suggestions to your level. Lower-ranked players receive guidance on positioning and rotation fundamentals, while higher-ranked players get insights on utility timing, trade setups, and team coordination."
            },
            {
                q: "Is my data safe?",
                a: "Absolutely. All user data is stored encrypted on Supabase infrastructure and protected by Row Level Security (RLS) policies. No user can access another user's data. Your match analyses, round notes, and reports are only viewable by your own account."
            },
            {
                q: "I need help, how can I reach you?",
                a: "For any issues, suggestions, or feedback, you can email us at support@aimlo.gg. Our team typically responds within 24 hours. You can also use the in-app feedback form for quick reports. Follow our social media channels for community support and updates."
            }
        ],
        landingFeatures: [
            {
                icon: "zap",
                title: "Instant Feedback",
                desc: "AI-powered analysis after each round"
            },
            {
                icon: "chart",
                title: "Detailed Reports",
                desc: "Comprehensive post-match performance report"
            },
            {
                icon: "target",
                title: "Mistake Detection",
                desc: "Automatically detect recurring mistakes"
            },
            {
                icon: "trend",
                title: "Progress Tracking",
                desc: "See your improvement over time"
            }
        ],
        landingHowTitle: "How It Works",
        landingHowSteps: [
            {
                step: "1",
                title: "Set Up Match",
                desc: "Pick your map, agent, and team"
            },
            {
                step: "2",
                title: "Round Notes",
                desc: "Enter death location and notes each round"
            },
            {
                step: "3",
                title: "AI Analysis",
                desc: "Get instant feedback and suggestions"
            },
            {
                step: "4",
                title: "Match Report",
                desc: "View detailed end-of-match analysis"
            }
        ],
        landingDiffTitle: "Why AIMLO?",
        landingDiffItems: [
            {
                title: "Solutions, Not Just Numbers",
                desc: "Other tools show K/D. AIMLO explains why you lost."
            },
            {
                title: "Round-by-Round Coaching",
                desc: "Improve instantly with strategic tips after each round."
            },
            {
                title: "Personal Growth Map",
                desc: "See how your mistakes decrease and where you improve over time."
            }
        ],
        landingStatsTitle: "Platform Stats",
        landingStats: [
            {
                value: "10K+",
                label: "Rounds Analyzed"
            },
            {
                value: "2.5K+",
                label: "Match Reports"
            },
            {
                value: "500+",
                label: "Active Players"
            },
            {
                value: "94%",
                label: "Satisfaction"
            }
        ],
        goToDashboard: "Go to Dashboard",
        homePage: "Home",
        dashTopAgent: "Most Used Agent"
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/generators.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "genMatchReport",
    ()=>genMatchReport,
    "genRoundFeedback",
    ()=>genRoundFeedback
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/game-data.ts [app-client] (ecmascript)");
;
function genRoundFeedback(setup, form, result, allRounds, lang, survived) {
    const isTr = lang === "tr";
    const loc = form.deathLocation;
    const cnt = form.enemyCount;
    const note = (form.yourNote || "").toLowerCase();
    const sideLabel = isTr ? setup.side === "attack" ? "saldırı" : "savunma" : setup.side === "attack" ? "attack" : "defense";
    const prevDeaths = allRounds.filter((r)=>!r.skipped && !r.survived && r.deathLocation === loc);
    const repeatCount = prevDeaths.length;
    let mistake;
    if (survived) {
        mistake = result === "win" ? isTr ? "Hayatta kaldın ve round kazanıldı. İyi iş! Pozisyonunu korumaya devam et." : "You survived and won. Good job! Keep holding your position." : isTr ? "Hayatta kaldın ama round kaybedildi. Takım koordinasyonunu gözden geçir." : "You survived but the round was lost. Review team coordination.";
    } else if (repeatCount >= 2) {
        mistake = isTr ? `${loc} konumunda daha önce ${repeatCount} kez öldün. Farklı bir açıya geçmeyi düşün.` : `You've died at ${loc} ${repeatCount} times before. Consider switching to a different angle.`;
    } else if (Number(cnt) >= 3) {
        mistake = isTr ? `${loc} konumunda ${cnt} düşmana karşı sayısal dezavantajdaydın. Geri çekilip bilgi vermeliydin.` : `You faced ${cnt} enemies at ${loc}. Fall back and call info.`;
    } else if (note.includes("rotate") || note.includes("rotasyon") || note.includes("döndüm")) {
        mistake = isTr ? `Rotasyonun ${loc} bölgesinde seni açık bıraktı. ${sideLabel} tarafında erken rotasyon düşmana kolay entry verir.` : `Your rotation left you exposed at ${loc}. On ${sideLabel}, rotating early gives easy entry.`;
    } else if (note.includes("solo") || note.includes("tek")) {
        mistake = isTr ? `${loc} bölgesinde solo oynaman riskli oldu. Takım desteği olmadan tutunamaman normal.` : `Playing solo at ${loc} was risky. It's expected to struggle without team support.`;
    } else if (note.includes("util") || note.includes("ability") || note.includes("yetenek")) {
        mistake = isTr ? `Utility sonrası ${loc} konumunda savunmasız kaldın. Util sonrası kısa bekleme ekle.` : `After using utility you were vulnerable at ${loc}. Add a short delay after ability usage.`;
    } else {
        mistake = isTr ? `${loc} konumunda pozisyonun ${sideLabel} tarafı için ideal değildi. Daha korunaklı bir açı seçmeliydin.` : `Your position at ${loc} wasn't ideal for ${sideLabel}. Choose a more covered angle.`;
    }
    const avgEnemy = allRounds.length > 0 ? (allRounds.filter((r)=>!r.skipped).reduce((s, r)=>s + Number(r.enemyCount || 0), 0) / Math.max(allRounds.filter((r)=>!r.skipped).length, 1)).toFixed(1) : cnt || "0";
    let habit;
    if (survived && !cnt) {
        habit = isTr ? "Düşman hareket kalıplarını izlemeye devam et." : "Keep observing enemy movement patterns.";
    } else if (Number(cnt) >= 4) {
        habit = isTr ? `Düşman bu bölgeye ${cnt} kişiyle geldi. Yoğun baskı devam ediyor.` : `The enemy pushed with ${cnt} players. Heavy pressure continues.`;
    } else if (Number(cnt) <= 2) {
        habit = isTr ? `Düşman ${cnt} kişiyle hareket etti. Temkinli oyun veya lurker paterni.` : `Enemy moved with ${cnt} players. Cautious play or lurker pattern.`;
    } else {
        habit = isTr ? `Düşman ortalama ${avgEnemy} kişilik gruplarla baskı yapıyor.` : `Enemy pressing with groups averaging ${avgEnemy}.`;
    }
    const altLocations = (__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAP_LOCATIONS"][setup.map] ?? []).filter((x)=>x !== loc);
    // Deterministic location suggestion based on round number
    const locIndex = altLocations.length > 0 ? (setup.map.length + allRounds.length) % altLocations.length : 0;
    const suggestedLoc = altLocations[locIndex] || loc || "a different position";
    let microPlan;
    if (survived && result === "win") {
        microPlan = isTr ? "İyi gidiyorsun. Aynı stratejiyi koru, hafif açı değişikliği düşün." : "You're doing well. Keep strategy, consider slight angle changes.";
    } else if (survived && result === "loss") {
        microPlan = isTr ? "Bireysel olarak iyiydin ama takım kaybetti. Daha erken bilgi ver ve trade pozisyonu kur." : "You played well but team lost. Share info earlier and set up trades.";
    } else if (result === "loss" && repeatCount >= 2) {
        microPlan = isTr ? `${suggestedLoc} konumunda oyna. Derin açı tut ve ilk bilgiyi bekle.` : `Play ${suggestedLoc}. Hold a deep angle and wait for first info.`;
    } else if (result === "loss" && Number(cnt) >= 3) {
        microPlan = isTr ? `Retake oyna. ${suggestedLoc} civarında geri dur ve takımını bekle.` : `Play retake. Fall back near ${suggestedLoc} and wait for team.`;
    } else if (result === "loss") {
        microPlan = isTr ? `${suggestedLoc} konumuna geç. Utility'ni erken kullan ve geri çekil.` : `Switch to ${suggestedLoc}. Use utility early and fall back.`;
    } else {
        microPlan = isTr ? `Aynı stratejiyi koru ama açını hafifçe değiştir. ${suggestedLoc} iyi alternatif.` : `Keep strategy but shift angle. ${suggestedLoc} could be good.`;
    }
    return {
        mainMistake: mistake,
        enemyHabit: habit,
        microPlan
    };
}
function genMatchReport(setup, rounds, lang, score) {
    const isTr = lang === "tr";
    const won = rounds.filter((r)=>r.result === "win").length;
    const lost = rounds.filter((r)=>r.result === "loss").length;
    const skipped = rounds.filter((r)=>r.skipped).length;
    const survivedCount = rounds.filter((r)=>r.survived && !r.skipped).length;
    const total = rounds.length;
    const winPct = total > 0 ? Math.round(won / total * 100) : 0;
    const nonSkipped = rounds.filter((r)=>!r.skipped);
    const locationCounts = {};
    nonSkipped.filter((r)=>!r.survived).forEach((r)=>{
        if (r.deathLocation) locationCounts[r.deathLocation] = (locationCounts[r.deathLocation] || 0) + 1;
    });
    const topLoc = Object.entries(locationCounts).sort((a, b)=>b[1] - a[1])[0];
    const topDeathLoc = topLoc ? topLoc[0] : "N/A";
    const topDeathCount = topLoc ? topLoc[1] : 0;
    const avgEnemy = nonSkipped.length > 0 ? (nonSkipped.reduce((s, r)=>s + Number(r.enemyCount || 0), 0) / nonSkipped.length).toFixed(1) : "0";
    const sideLabel = isTr ? setup.side === "attack" ? "Saldırı" : "Savunma" : setup.side === "attack" ? "Attack" : "Defense";
    const scoreStr = `${score.yours} - ${score.enemy}`;
    const matchWon = Number(score.yours) > Number(score.enemy);
    const allNotes = nonSkipped.map((r)=>(r.yourNote || "").toLowerCase()).join(" ");
    const hasRotateIssue = /rotat|rotasyon|döndüm/.test(allNotes);
    const hasSoloIssue = /solo|tek/.test(allNotes);
    const hasUtilIssue = /util|ability|yetenek/.test(allNotes);
    const survivedText = survivedCount > 0 ? isTr ? ` ${survivedCount} round'da hayatta kaldın.` : ` Survived ${survivedCount} rounds.` : "";
    const summary = isTr ? `${setup.map} haritasında ${setup.agent} ile ${sideLabel} tarafında oynadın. Skor: ${scoreStr}. ${total} round (${skipped} atlanan).${survivedText} En çok ölüm: ${topDeathLoc} (${topDeathCount}x). Ort. düşman: ${avgEnemy}.` : `Played ${setup.map} as ${setup.agent} on ${sideLabel}. Score: ${scoreStr}. ${total} rounds (${skipped} skipped).${survivedText} Most deaths: ${topDeathLoc} (${topDeathCount}x). Avg enemy: ${avgEnemy}.`;
    let mistake;
    if (topDeathCount >= 3) {
        mistake = isTr ? `${topDeathLoc} konumunda ${topDeathCount} kez öldün. Bu tekrar düşmana okuma kolaylığı sağlıyor.` : `You died at ${topDeathLoc} ${topDeathCount} times. This makes you predictable.`;
    } else if (hasRotateIssue) {
        mistake = isTr ? "Birden fazla round'da erken rotasyon sorunu yaşadın." : "Early rotation issues in multiple rounds.";
    } else if (hasSoloIssue) {
        mistake = isTr ? "Solo oynadığını belirttin. Takım koordinasyonu eksik." : "Playing solo noted. Team coordination lacking.";
    } else if (hasUtilIssue) {
        mistake = isTr ? "Utility zamanlamanla ilgili sorunlar tespit edildi." : "Issues with utility timing detected.";
    } else {
        mistake = isTr ? "Genel pozisyonlama sorunları göze çarpıyor." : "General positioning issues stand out.";
    }
    const enemyAgents = setup.unknownEnemyComp ? isTr ? "bilinmiyor" : "unknown" : setup.enemyComp.filter(Boolean).join(", ");
    const tendencies = isTr ? `Düşman (${enemyAgents}) ort. ${avgEnemy} kişilik gruplarla hareket etti. ${matchWon ? "Baskı yapsa da takımın karşılık verdi." : "Sayısal üstünlükle baskı kurdu."}` : `Enemy (${enemyAgents}) moved in groups avg ${avgEnemy}. ${matchWon ? "Despite pressure, team responded." : "Applied pressure with numbers."}`;
    const adjustment = isTr ? `${topDeathLoc !== "N/A" ? `${topDeathLoc} yerine farklı açılardan oyna. ` : ""}${setup.agent} olarak utility'ni stratejik zamanla. ${matchWon ? "İyi performans, pozisyon çeşitliliğini artır." : "Retake pozisyonlarına erken geç."}` : `${topDeathLoc !== "N/A" ? `Play different angles instead of ${topDeathLoc}. ` : ""}As ${setup.agent}, time utility strategically. ${matchWon ? "Good performance, increase positional variety." : "Set up retake earlier."}`;
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
        matchWon
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/auth-helpers.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkUsernameAvailable",
    ()=>checkUsernameAvailable,
    "getAuthHeaders",
    ()=>getAuthHeaders,
    "isValidFeedback",
    ()=>isValidFeedback,
    "isValidReport",
    ()=>isValidReport,
    "localizeAuthError",
    ()=>localizeAuthError,
    "upsertProfile",
    ()=>upsertProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
;
async function getAuthHeaders() {
    const headers = {
        "Content-Type": "application/json"
    };
    // First try getSession for the token (fast, from memory)
    const { data: { session } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
    if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
    } else {
        // Fallback: getUser forces a fresh token fetch
        try {
            const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
            if (user) {
                const { data: { session: freshSession } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
                if (freshSession?.access_token) {
                    headers["Authorization"] = `Bearer ${freshSession.access_token}`;
                }
            }
        } catch  {
        // No valid session
        }
    }
    return headers;
}
function isValidFeedback(obj) {
    if (!obj || typeof obj !== "object") return false;
    const o = obj;
    return typeof o.mainMistake === "string" && typeof o.enemyHabit === "string" && typeof o.microPlan === "string";
}
function isValidReport(obj) {
    if (!obj || typeof obj !== "object") return false;
    const o = obj;
    return typeof o.summary === "string" && typeof o.scoreStr === "string" && typeof o.winPct === "number";
}
async function upsertProfile(userId, data) {
    const payload = {
        user_id: userId,
        username: data.username.toLowerCase().trim(),
        email: data.email.toLowerCase().trim(),
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim()
    };
    for(let attempt = 0; attempt < 2; attempt++){
        try {
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("profiles").upsert(payload, {
                onConflict: "user_id"
            });
            if (!error) return {
                ok: true
            };
            console.error(`[Aimlo] Profile upsert attempt ${attempt + 1}:`, error.message, error.details);
            if (attempt === 1) return {
                ok: false,
                error: error.message
            };
        } catch (err) {
            console.error(`[Aimlo] Profile upsert exception attempt ${attempt + 1}:`, err);
            if (attempt === 1) return {
                ok: false,
                error: err instanceof Error ? err.message : "Unknown error"
            };
        }
    }
    return {
        ok: false,
        error: "Profile creation failed"
    };
}
async function checkUsernameAvailable(username) {
    try {
        // Use secure RPC function instead of direct table query
        const { data: foundEmail, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].rpc("lookup_email_by_username", {
            lookup_username: username.toLowerCase().trim()
        });
        if (error) {
            console.error("[Aimlo] Username check error:", error.message);
            return true; // allow attempt, DB constraint will catch duplicates
        }
        return !foundEmail; // null means username is available
    } catch  {
        return true;
    }
}
function localizeAuthError(msg, lang) {
    if (lang !== "tr") return msg;
    const m = {
        "Invalid login credentials": "Geçersiz e-posta veya şifre",
        "Email not confirmed": "E-posta adresi henüz doğrulanmadı",
        "User already registered": "Bu e-posta zaten kayıtlı",
        "Password should be at least 6 characters": "Şifre en az 6 karakter olmalı",
        "Unable to validate email address: invalid format": "Geçersiz e-posta formatı",
        "Signup requires a valid password": "Geçerli bir şifre girin",
        "Email rate limit exceeded": "Çok fazla deneme yapıldı. Lütfen 1-2 dakika bekleyip tekrar deneyin.",
        "For security purposes, you can only request this after 60 seconds": "Güvenlik nedeniyle 60 saniye beklemeniz gerekiyor. Lütfen biraz sonra tekrar deneyin.",
        "over_email_send_rate_limit": "E-posta gönderim limiti aşıldı. Lütfen birkaç dakika bekleyin.",
        "Too many requests": "Çok fazla istek gönderildi. Lütfen 1-2 dakika bekleyip tekrar deneyin.",
        "Network error": "Bağlantı hatası. İnterneti kontrol edin.",
        "Username not found": "Kullanıcı adı bulunamadı"
    };
    for (const [key, val] of Object.entries(m)){
        if (msg.toLowerCase().includes(key.toLowerCase())) return val;
    }
    return msg;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/design.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/game-data.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useScrollReveal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useScrollReveal.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/i18n.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$generators$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/generators.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth-helpers.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
/* ══════════════════════════════════════════════════════════
   BRAND
   ══════════════════════════════════════════════════════════ */ const AIMLO_LOGO_SRC = "/aimlo-logo.png?v=5d2fb8b5";
function AimloLogo({ size = 48, className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
        src: AIMLO_LOGO_SRC,
        alt: "Aimlo",
        style: {
            height: size,
            width: "auto",
            maxWidth: `min(88vw, ${Math.round(size * 3)}px)`
        },
        className: `object-contain object-left shrink-0 ${className}`,
        draggable: false
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
_c = AimloLogo;
function AimloWordmark({ size = "text-4xl", className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `font-extrabold text-white ${size} ${className}`,
        style: {
            letterSpacing: "-0.02em",
            lineHeight: 1
        },
        children: [
            "AIM",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "bg-clip-text text-transparent",
                style: {
                    backgroundImage: "linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)"
                },
                children: "LO"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
_c1 = AimloWordmark;
/* game-data, design, storage, hook — imported from separate files */ function Label({ text }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].label,
        children: text
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 84,
        columnNumber: 10
    }, this);
}
_c2 = Label;
function InlineError({ msg }) {
    if (!msg) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "mt-1.5 text-xs text-red-400",
        children: msg
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 88,
        columnNumber: 10
    }, this);
}
_c3 = InlineError;
function AmbientBg() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "pointer-events-none fixed inset-0 z-0 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-blue-950/[0.08] blur-[100px]"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute -bottom-32 -left-32 h-[300px] w-[300px] rounded-full bg-cyan-950/[0.06] blur-[80px]"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 92,
        columnNumber: 5
    }, this);
}
_c4 = AmbientBg;
function MapBg({ map }) {
    const url = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAP_IMAGES"][map];
    if (!url) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "pointer-events-none fixed inset-0 z-0 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: url,
                alt: "",
                className: "h-full w-full object-cover opacity-[0.55]"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 103,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-gradient-to-b from-[#050810]/30 via-[#050810]/60 to-[#050810]/95"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 102,
        columnNumber: 5
    }, this);
}
_c5 = MapBg;
function FeatureIcon({ icon }) {
    const svgs = {
        zap: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "26",
            height: "26",
            viewBox: "0 0 24 24",
            fill: "none",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2",
                fill: "rgba(34,211,238,0.15)",
                stroke: "currentColor",
                strokeWidth: "1.5"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 123,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 115,
            columnNumber: 7
        }, this),
        chart: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "26",
            height: "26",
            viewBox: "0 0 24 24",
            fill: "none",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: "15",
                    y: "10",
                    width: "6",
                    height: "10",
                    rx: "1",
                    fill: "rgba(34,211,238,0.15)",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 140,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: "9",
                    y: "4",
                    width: "6",
                    height: "16",
                    rx: "1",
                    fill: "rgba(59,130,246,0.12)",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 150,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: "3",
                    y: "14",
                    width: "6",
                    height: "6",
                    rx: "1",
                    fill: "rgba(34,211,238,0.1)",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 160,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 132,
            columnNumber: 7
        }, this),
        target: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "26",
            height: "26",
            viewBox: "0 0 24 24",
            fill: "none",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: "12",
                    cy: "12",
                    r: "10",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                    opacity: "0.4"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 181,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: "12",
                    cy: "12",
                    r: "6",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                    opacity: "0.6"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 189,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: "12",
                    cy: "12",
                    r: "2.5",
                    fill: "currentColor",
                    opacity: "0.8"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 197,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 173,
            columnNumber: 7
        }, this),
        trend: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "26",
            height: "26",
            viewBox: "0 0 24 24",
            fill: "none",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M1 18 L8.5 10.5 L13.5 15.5 L23 6",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 209,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M1 18 L8.5 10.5 L13.5 15.5 L23 6 L23 18 Z",
                    fill: "rgba(34,211,238,0.08)"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 214,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                    points: "17 6 23 6 23 12",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 218,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 201,
            columnNumber: 7
        }, this)
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "text-cyan-400",
        children: svgs[icon] || null
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 226,
        columnNumber: 10
    }, this);
}
_c6 = FeatureIcon;
/* ══════════════════════════════════════════════════════════
   NAVBAR — with HOME button
   ══════════════════════════════════════════════════════════ */ function Navbar({ user, lang, onSignOut, onLogoClick, onLangToggle, signOutLabel, onHome, homeLabel }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#050810]/80 backdrop-blur-xl",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto flex h-14 max-w-5xl items-center justify-between px-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onLogoClick,
                    className: "flex items-center gap-2 transition-opacity duration-200 hover:opacity-80",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloLogo, {
                            size: 24
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 257,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloWordmark, {
                            size: "text-base"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 258,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "hidden sm:inline rounded-md bg-blue-500/10 border border-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-400 uppercase tracking-wider",
                            children: "Beta"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 259,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 253,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1.5 sm:gap-2",
                    children: [
                        onHome && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onHome,
                            className: "rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-semibold text-neutral-400 transition-all duration-200 hover:border-white/[0.12] hover:text-white hover:bg-white/[0.06]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "hidden sm:inline",
                                    children: homeLabel
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 269,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    width: "14",
                                    height: "14",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    className: "sm:hidden",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 279,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                            points: "9 22 9 12 15 12 15 22"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 280,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 270,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 265,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onLangToggle,
                            className: "rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-[10px] font-bold text-neutral-400 transition-all duration-200 hover:border-white/[0.12] hover:text-white",
                            children: lang === "tr" ? "TR" : "EN"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 284,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "hidden sm:flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    width: "12",
                                    height: "12",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    className: "text-cyan-400 shrink-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 292,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                            cx: "12",
                                            cy: "7",
                                            r: "4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 293,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 291,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[11px] font-semibold text-neutral-300 truncate max-w-[120px]",
                                    children: user.user_metadata?.username || user.user_metadata?.first_name || user.email?.split("@")[0] || "User"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 295,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 290,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onSignOut,
                            className: "rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[10px] font-semibold text-neutral-500 transition-all duration-200 hover:border-red-500/20 hover:text-red-400 hover:bg-red-500/[0.04]",
                            children: signOutLabel
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 299,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 263,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 252,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 251,
        columnNumber: 5
    }, this);
}
_c7 = Navbar;
/* ══════════════════════════════════════════════════════════
   SHARED UI
   ══════════════════════════════════════════════════════════ */ function ReportCard({ icon, color, label, text }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].cardInner} border-l-2 ${color === "text-red-400" ? "border-l-red-500/40" : color === "text-amber-400" ? "border-l-amber-500/40" : color === "text-emerald-400" ? "border-l-emerald-500/40" : "border-l-blue-500/40"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-3 flex items-center gap-2.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-base opacity-60",
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 329,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: `text-[11px] font-bold uppercase tracking-[0.15em] ${color}`,
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 330,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 328,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm leading-relaxed text-neutral-300",
                children: text
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 336,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 325,
        columnNumber: 5
    }, this);
}
_c8 = ReportCard;
function FeedbackCard({ icon, color, label, text }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl border border-white/[0.06] bg-[#070c16] p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-2 flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm opacity-70",
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 354,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        className: `text-[10px] font-bold uppercase tracking-[0.15em] ${color}`,
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 355,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 353,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[13px] leading-relaxed text-neutral-300",
                children: text
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 361,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 352,
        columnNumber: 5
    }, this);
}
_c9 = FeedbackCard;
function AgentMiniCard({ name, selected, disabled, onClick, locked }) {
    const role = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAgentRole"])(name);
    const colors = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AGENT_COLORS"][role];
    const border = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AGENT_BORDER"][role];
    const accent = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AGENT_ACCENT"][role];
    const img = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["agentImgUrl"])(name);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        disabled: disabled && !selected || locked,
        className: `group relative flex flex-col items-center gap-1 rounded-xl border p-2 transition-all duration-200 ${selected ? `${border} bg-gradient-to-b ${colors} ring-1 ring-cyan-400/20 shadow-lg shadow-cyan-500/5` : disabled ? "cursor-not-allowed border-white/[0.03] bg-white/[0.01] opacity-20" : "border-white/[0.06] bg-[#070c16] hover:border-white/[0.1] hover:bg-white/[0.03]"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative h-8 w-8 overflow-hidden rounded-lg bg-black/20",
                children: img ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: img,
                    alt: name,
                    className: "h-full w-full object-cover",
                    loading: "lazy"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 391,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `flex h-full w-full items-center justify-center text-[10px] font-bold ${accent}`,
                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAgentInitials"])(name)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 398,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 389,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[9px] font-medium text-neutral-300 leading-tight text-center truncate w-full",
                children: name
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 405,
                columnNumber: 7
            }, this),
            selected && !locked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-cyan-500 border-2 border-[#050810]"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 409,
                columnNumber: 9
            }, this),
            locked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 border-2 border-[#050810]"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 412,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 384,
        columnNumber: 5
    }, this);
}
_c10 = AgentMiniCard;
function CompSlot({ agent, index, onRemove, locked }) {
    const role = agent ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAgentRole"])(agent) : "";
    const accent = agent ? __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AGENT_ACCENT"][role] : "";
    const img = agent ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["agentImgUrl"])(agent) : "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onClick: ()=>agent && !locked && onRemove(),
        className: `flex h-16 w-16 flex-col items-center justify-center rounded-xl border transition-all duration-200 ${agent ? locked ? "border-amber-500/25 bg-amber-500/[0.04] cursor-default" : "border-cyan-500/25 bg-cyan-500/[0.06] cursor-pointer hover:border-red-500/25" : "border-dashed border-white/[0.06] bg-white/[0.01]"}`,
        children: agent ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-7 w-7 overflow-hidden rounded-lg bg-black/20",
                    children: img ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: img,
                        alt: agent,
                        className: "h-full w-full object-cover",
                        loading: "lazy"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 440,
                        columnNumber: 15
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex h-full w-full items-center justify-center text-[9px] font-bold ${accent}`,
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAgentInitials"])(agent)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 447,
                        columnNumber: 15
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 438,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "mt-0.5 text-[8px] text-neutral-400 truncate w-full text-center",
                    children: agent
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 454,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-[11px] text-neutral-600 font-medium",
            children: index + 1
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 459,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 432,
        columnNumber: 5
    }, this);
}
_c11 = CompSlot;
function StatCard({ label, value, color = "text-white", sub }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} p-4 sm:p-5 text-center`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-1.5",
                children: label
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 479,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: `text-2xl font-extrabold tabular-nums ${color}`,
                children: value
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 482,
                columnNumber: 7
            }, this),
            sub && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-1 text-[10px] text-neutral-600 font-medium",
                children: sub
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 484,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 478,
        columnNumber: 5
    }, this);
}
_c12 = StatCard;
/* ══════════════════════════════════════════════════════════
   LANDING PAGE
   ══════════════════════════════════════════════════════════ */ function LandingPage({ lang, user, onStartAnalysis, onLogin, onRegister, onLangToggle, onDashboard, onSignOut }) {
    _s();
    const l = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["t"][lang];
    const [openFaq, setOpenFaq] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [mobileMenu, setMobileMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const statsReveal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useScrollReveal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScrollReveal"])(0.2);
    const howReveal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useScrollReveal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScrollReveal"])(0.15);
    const diffReveal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useScrollReveal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScrollReveal"])(0.15);
    function scrollTo(id) {
        setMobileMenu(false);
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth"
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].pageBg} relative overflow-x-hidden`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AmbientBg, {}, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 523,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#050810]/80 backdrop-blur-xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloLogo, {
                                        size: 26
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 527,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloWordmark, {
                                        size: "text-lg"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 528,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hidden sm:inline rounded-md bg-blue-500/10 border border-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-400 uppercase tracking-wider",
                                        children: "Beta"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 529,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 526,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "hidden md:flex items-center gap-6",
                                children: Object.entries(l.landingNav).map(([key, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>scrollTo(`section-${key}`),
                                        className: "text-[13px] font-medium text-neutral-400 transition-colors duration-200 hover:text-white",
                                        children: label
                                    }, key, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 535,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 533,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onLangToggle,
                                        className: "rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold text-neutral-400 transition-all hover:border-white/[0.12] hover:text-white",
                                        children: lang === "tr" ? "TR" : "EN"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 545,
                                        columnNumber: 13
                                    }, this),
                                    user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: onDashboard,
                                                className: "hidden sm:block rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-[12px] font-bold text-white shadow-md shadow-blue-900/20 transition-all duration-300 hover:shadow-lg hover:brightness-110",
                                                children: l.goToDashboard
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 553,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "hidden sm:flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        width: "12",
                                                        height: "12",
                                                        viewBox: "0 0 24 24",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "2",
                                                        className: "text-cyan-400 shrink-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 561,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                                cx: "12",
                                                                cy: "7",
                                                                r: "4"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 562,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 560,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[11px] font-semibold text-neutral-300 truncate max-w-[100px]",
                                                        children: user.user_metadata?.username || user.user_metadata?.first_name || user.email?.split("@")[0] || "User"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 564,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 559,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: onSignOut,
                                                className: "hidden sm:block rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] font-medium text-neutral-500 transition-all hover:text-red-400 hover:border-red-500/20",
                                                children: l.authSignOut
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 568,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: onLogin,
                                                className: "hidden sm:block rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[12px] font-semibold text-neutral-300 transition-all hover:border-white/[0.14] hover:text-white",
                                                children: l.authLogin
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 577,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: onRegister,
                                                className: "hidden sm:block rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-[12px] font-bold text-white shadow-md shadow-blue-900/20 transition-all duration-300 hover:shadow-lg hover:brightness-110",
                                                children: l.authRegister
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 583,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setMobileMenu(!mobileMenu),
                                        className: "md:hidden rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-neutral-400 hover:text-white transition",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            width: "20",
                                            height: "20",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M3 12h18M3 6h18M3 18h18"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 603,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 595,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 591,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 544,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 525,
                        columnNumber: 9
                    }, this),
                    mobileMenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "md:hidden border-t border-white/[0.06] bg-[#050810]/95 backdrop-blur-xl px-4 py-4 space-y-3",
                        children: [
                            Object.entries(l.landingNav).map(([key, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>scrollTo(`section-${key}`),
                                    className: "block w-full text-left text-sm text-neutral-400 py-2 transition hover:text-white",
                                    children: label
                                }, key, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 611,
                                    columnNumber: 15
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2 pt-2",
                                children: user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setMobileMenu(false);
                                                onDashboard();
                                            },
                                            className: "flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-2.5 text-sm font-bold text-white",
                                            children: l.goToDashboard
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 622,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setMobileMenu(false);
                                                onSignOut();
                                            },
                                            className: "flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-medium text-neutral-400",
                                            children: l.authSignOut
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 631,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setMobileMenu(false);
                                                onLogin();
                                            },
                                            className: "flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-semibold text-neutral-300",
                                            children: l.authLogin
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 643,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setMobileMenu(false);
                                                onRegister();
                                            },
                                            className: "flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-2.5 text-sm font-bold text-white",
                                            children: l.authRegister
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 652,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 619,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 609,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 524,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pt-32 sm:pt-40 pb-20 sm:pb-28 text-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/[0.05] px-4 py-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 670,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[11px] font-semibold text-blue-400 uppercase tracking-wider",
                                    children: "AI-Powered Coaching"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 671,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 669,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]",
                            children: l.landingHeroTitle
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 675,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mx-auto max-w-2xl text-base sm:text-lg text-neutral-400 leading-relaxed",
                            children: l.landingHeroSub
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 678,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col sm:flex-row items-center justify-center gap-3 pt-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: user ? onDashboard : onStartAnalysis,
                                    className: "group rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-900/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-800/30 hover:-translate-y-0.5 active:scale-[0.98]",
                                    children: [
                                        user ? l.goToDashboard : l.landingCTA,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1",
                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].arrow
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 687,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 682,
                                    columnNumber: 13
                                }, this),
                                !user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onLogin,
                                    className: "rounded-xl border border-white/[0.08] bg-white/[0.03] px-8 py-4 text-base font-semibold text-neutral-300 transition-all duration-200 hover:border-white/[0.14] hover:text-white",
                                    children: l.authLogin
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 692,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 681,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 668,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 667,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pb-24",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4",
                    children: l.landingFeatures.map((f, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].cardInner} ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].cardHover} text-center`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative mx-auto mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-0 m-auto h-12 w-12 rounded-xl bg-blue-500/[0.12] blur-xl"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 710,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/[0.12] to-cyan-500/[0.08] border border-blue-500/15 shadow-lg shadow-blue-900/10",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FeatureIcon, {
                                                icon: f.icon
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 712,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 711,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 709,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-sm font-bold text-white mb-1",
                                    children: f.title
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 715,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[12px] text-neutral-500 leading-relaxed",
                                    children: f.desc
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 716,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 705,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 703,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 702,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                ref: howReveal.ref,
                className: "relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pb-24",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: `text-2xl sm:text-3xl font-extrabold text-white mb-10 text-center transition-all duration-700 ${howReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`,
                        children: l.landingHowTitle
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 727,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4",
                        children: l.landingHowSteps.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].cardInner} text-center transition-all duration-700 ${howReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
                                style: {
                                    transitionDelay: `${i * 100}ms`
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative mx-auto mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 m-auto h-10 w-10 rounded-full bg-blue-500/20 blur-lg"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 740,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 shadow-lg shadow-blue-900/25 ring-1 ring-white/10",
                                                children: [
                                                    i === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        width: "20",
                                                        height: "20",
                                                        viewBox: "0 0 24 24",
                                                        fill: "none",
                                                        stroke: "white",
                                                        strokeWidth: "2",
                                                        strokeLinecap: "round",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                                cx: "12",
                                                                cy: "12",
                                                                r: "10",
                                                                strokeWidth: "0",
                                                                fill: "rgba(255,255,255,0.15)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 752,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                d: "M12 6v6l4 2"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 759,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                                cx: "12",
                                                                cy: "12",
                                                                r: "9"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 760,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 743,
                                                        columnNumber: 21
                                                    }, this),
                                                    i === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        width: "20",
                                                        height: "20",
                                                        viewBox: "0 0 24 24",
                                                        fill: "none",
                                                        stroke: "white",
                                                        strokeWidth: "2",
                                                        strokeLinecap: "round",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 773,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 774,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 764,
                                                        columnNumber: 21
                                                    }, this),
                                                    i === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        width: "20",
                                                        height: "20",
                                                        viewBox: "0 0 24 24",
                                                        fill: "none",
                                                        stroke: "white",
                                                        strokeWidth: "2",
                                                        strokeLinecap: "round",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                                            points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 787,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 778,
                                                        columnNumber: 21
                                                    }, this),
                                                    i === 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        width: "20",
                                                        height: "20",
                                                        viewBox: "0 0 24 24",
                                                        fill: "none",
                                                        stroke: "white",
                                                        strokeWidth: "2",
                                                        strokeLinecap: "round",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                                x1: "18",
                                                                y1: "20",
                                                                x2: "18",
                                                                y2: "10"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 800,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                                x1: "12",
                                                                y1: "20",
                                                                x2: "12",
                                                                y2: "4"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 801,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                                x1: "6",
                                                                y1: "20",
                                                                x2: "6",
                                                                y2: "14"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 802,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 791,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 741,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0b1120] ring-2 ring-blue-500/30 text-[9px] font-bold text-blue-400",
                                                children: s.step
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 806,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 739,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-bold text-white mb-1",
                                        children: s.title
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 810,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[12px] text-neutral-500 leading-relaxed",
                                        children: s.desc
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 811,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 734,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 732,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 723,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                id: "section-about",
                className: "relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} overflow-hidden`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-8 sm:p-12 space-y-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl sm:text-3xl font-extrabold text-white mb-4",
                                        children: l.landingAboutTitle
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 825,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-base text-neutral-400 leading-relaxed max-w-3xl",
                                        children: l.landingAboutText
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 828,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-base text-neutral-400 leading-relaxed max-w-3xl mt-3",
                                        children: l.landingAboutMission
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 831,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 824,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid md:grid-cols-2 gap-5 pt-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-cyan-500/[0.04] to-transparent p-7 transition-all duration-300 hover:border-cyan-500/20 hover:from-cyan-500/[0.07] group overflow-hidden",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.04] rounded-full blur-[60px] group-hover:bg-cyan-500/[0.08] transition-all duration-500"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 837,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-3 mb-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/15 shadow-lg shadow-cyan-900/10",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                    width: "20",
                                                                    height: "20",
                                                                    viewBox: "0 0 24 24",
                                                                    fill: "none",
                                                                    stroke: "currentColor",
                                                                    strokeWidth: "2",
                                                                    className: "text-cyan-400",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                            d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 850,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                                            cx: "12",
                                                                            cy: "7",
                                                                            r: "4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 851,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 841,
                                                                    columnNumber: 23
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 840,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                        className: "text-lg font-bold text-white",
                                                                        children: l.landingB2CTitle
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 855,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-[10px] text-cyan-400/70 font-medium uppercase tracking-wider",
                                                                        children: lang === "tr" ? "Kendi hızında ilerle" : "Progress at your pace"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 858,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 854,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 839,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-neutral-400 leading-relaxed",
                                                        children: l.landingB2CText
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 865,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 838,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 836,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative rounded-2xl border border-blue-500/10 bg-gradient-to-br from-blue-500/[0.04] to-transparent p-7 transition-all duration-300 hover:border-blue-500/20 hover:from-blue-500/[0.07] group overflow-hidden",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.04] rounded-full blur-[60px] group-hover:bg-blue-500/[0.08] transition-all duration-500"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 871,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-3 mb-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/15 shadow-lg shadow-blue-900/10",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                    width: "20",
                                                                    height: "20",
                                                                    viewBox: "0 0 24 24",
                                                                    fill: "none",
                                                                    stroke: "currentColor",
                                                                    strokeWidth: "2",
                                                                    className: "text-blue-400",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                            d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 884,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                                            cx: "9",
                                                                            cy: "7",
                                                                            r: "4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 885,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                            d: "M23 21v-2a4 4 0 0 0-3-3.87"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 886,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                            d: "M16 3.13a4 4 0 0 1 0 7.75"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 887,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 875,
                                                                    columnNumber: 23
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 874,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                        className: "text-lg font-bold text-white",
                                                                        children: l.landingB2BTitle
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 891,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-[10px] text-blue-400/70 font-medium uppercase tracking-wider",
                                                                        children: lang === "tr" ? "Veriye dayalı kararlar" : "Data-driven decisions"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 894,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 890,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 873,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-neutral-400 leading-relaxed",
                                                        children: l.landingB2BText
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 901,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 872,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 870,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 835,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 823,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 822,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 818,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                ref: diffReveal.ref,
                className: "relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pb-24",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: `text-2xl sm:text-3xl font-extrabold text-white mb-10 text-center transition-all duration-700 ${diffReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`,
                        children: [
                            lang === "tr" ? "Neden " : "Why ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloWordmark, {
                                size: "text-2xl sm:text-3xl",
                                className: "inline"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 918,
                                columnNumber: 11
                            }, this),
                            "?"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 914,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid md:grid-cols-3 gap-4",
                        children: l.landingDiffItems.map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].cardInner} border-t-2 border-t-blue-500/20 transition-all duration-700 ${diffReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
                                style: {
                                    transitionDelay: `${i * 120}ms`
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-base font-bold text-white mb-2",
                                        children: item.title
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 927,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-neutral-400 leading-relaxed",
                                        children: item.desc
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 930,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 922,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 920,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 910,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                id: "section-blog",
                className: "relative z-10 mx-auto max-w-4xl px-4 sm:px-6 pb-24",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl sm:text-3xl font-extrabold text-white mb-8 text-center",
                        children: l.landingBlogTitle
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 941,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid md:grid-cols-3 gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "https://playvalorant.com/en-us/agents/",
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} overflow-hidden group cursor-pointer ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].cardHover}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative h-40 overflow-hidden bg-gradient-to-br from-[#0d1a2d] to-[#0b1120]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 flex items-center justify-center gap-[-8px]",
                                                children: [
                                                    "add6443a-41bd-e414-f6ad-e58d267f4e95",
                                                    "a3bfb853-43b2-7238-a4f1-ad90e9e46bcc",
                                                    "569fdd95-4d10-43ab-ca70-79becc718b46",
                                                    "dade69b4-4f5a-8528-247b-219e5a1facd6",
                                                    "8e253930-4c05-31dd-1b6c-968525494517"
                                                ].map((id, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: `https://media.valorant-api.com/agents/${id}/displayicon.png`,
                                                        alt: "",
                                                        className: "h-20 w-20 object-contain opacity-50 group-hover:opacity-75 transition-all duration-500",
                                                        style: {
                                                            marginLeft: i > 0 ? "-12px" : "0",
                                                            zIndex: 5 - i,
                                                            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
                                                        },
                                                        loading: "lazy"
                                                    }, id, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 961,
                                                        columnNumber: 19
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 953,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/30 to-transparent"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 975,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute bottom-3 left-4 flex items-center gap-2",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "rounded-md bg-cyan-500/20 border border-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-400 uppercase tracking-wider",
                                                    children: lang === "tr" ? "Rehber" : "Guide"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 977,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 976,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 952,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors",
                                                children: lang === "tr" ? "Tüm Ajanlar" : "All Agents"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 983,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[12px] text-neutral-500 leading-relaxed",
                                                children: lang === "tr" ? "Her ajanın yetenekleri, rolleri ve en iyi stratejileri" : "Abilities, roles, and best strategies for every agent"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 986,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 982,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 946,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "https://playvalorant.com/en-us/arsenal/",
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} overflow-hidden group cursor-pointer ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].cardHover}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative h-40 overflow-hidden bg-gradient-to-br from-[#1a1510] to-[#0b1120]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 flex items-center justify-center",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: "https://media.valorant-api.com/weapons/9c82e19d-4575-0200-1a81-3eacf00cf872/displayicon.png",
                                                    alt: "Vandal",
                                                    className: "h-24 w-auto object-contain opacity-45 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500",
                                                    style: {
                                                        filter: "drop-shadow(0 4px 16px rgba(245,158,11,0.15))"
                                                    },
                                                    loading: "lazy"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1002,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1001,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/20 to-transparent"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1012,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute bottom-3 left-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "rounded-md bg-amber-500/20 border border-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-400 uppercase tracking-wider",
                                                    children: lang === "tr" ? "Cephanelik" : "Arsenal"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1014,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1013,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1000,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition-colors",
                                                children: lang === "tr" ? "Tüm Silahlar" : "All Weapons"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1020,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[12px] text-neutral-500 leading-relaxed",
                                                children: lang === "tr" ? "Silah istatistikleri, hasar değerleri ve spray pattern rehberi" : "Weapon stats, damage values, and spray pattern guide"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1023,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1019,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 994,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "https://playvalorant.com/en-us/news/game-updates/",
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} overflow-hidden group cursor-pointer ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].cardHover}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative h-40 overflow-hidden",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png",
                                                alt: "Patch Notes",
                                                className: "h-full w-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500",
                                                loading: "lazy"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1038,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/40 to-purple-900/10"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1044,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 flex items-center justify-center",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "rounded-2xl bg-purple-500/10 border border-purple-500/15 p-3 backdrop-blur-sm group-hover:bg-purple-500/15 transition-all duration-300",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        width: "28",
                                                        height: "28",
                                                        viewBox: "0 0 24 24",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "1.5",
                                                        className: "text-purple-400",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 1056,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                                points: "14 2 14 8 20 8"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 1057,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                                x1: "16",
                                                                y1: "13",
                                                                x2: "8",
                                                                y2: "13"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 1058,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                                x1: "16",
                                                                y1: "17",
                                                                x2: "8",
                                                                y2: "17"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 1059,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 1047,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1046,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1045,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute bottom-3 left-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "rounded-md bg-purple-500/20 border border-purple-500/20 px-2 py-0.5 text-[9px] font-bold text-purple-400 uppercase tracking-wider",
                                                    children: lang === "tr" ? "Güncelleme" : "Updates"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1064,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1063,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1037,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-bold text-white mb-1 group-hover:text-purple-300 transition-colors",
                                                children: lang === "tr" ? "Son Patch Notları" : "Latest Patch Notes"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1070,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[12px] text-neutral-500 leading-relaxed",
                                                children: lang === "tr" ? "Valorant'ın en son değişiklikleri, denge ayarları ve yenilikler" : "Latest Valorant changes, balance updates, and new features"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1073,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1069,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1031,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 944,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 937,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                id: "section-faq",
                className: "relative z-10 mx-auto max-w-3xl px-4 sm:px-6 pb-24",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl sm:text-3xl font-extrabold text-white mb-8 text-center",
                        children: l.landingFaqTitle
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1086,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2.5",
                        children: l.landingFaqs.map((faq, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} overflow-hidden`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setOpenFaq(openFaq === i ? null : i),
                                        className: "w-full flex items-center justify-between p-5 text-left",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-semibold text-white pr-4",
                                                children: faq.q
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1096,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `shrink-0 text-neutral-500 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    width: "16",
                                                    height: "16",
                                                    viewBox: "0 0 24 24",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    strokeWidth: "2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M6 9l6 6 6-6"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 1110,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1102,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1099,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1092,
                                        columnNumber: 15
                                    }, this),
                                    openFaq === i && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-5 pb-5 -mt-1",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-neutral-400 leading-relaxed",
                                            children: faq.a
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1116,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1115,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1091,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1089,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].cardInner} text-center mt-6`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-neutral-400 mb-3",
                                children: l.landingHelpText
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1125,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "mailto:support@aimlo.gg",
                                className: "inline-flex items-center gap-2 rounded-xl bg-blue-500/[0.06] border border-blue-500/15 px-5 py-2.5 text-sm font-semibold text-blue-400 transition-all hover:bg-blue-500/[0.1]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "16",
                                        height: "16",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1138,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                points: "22,6 12,13 2,6"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1139,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1130,
                                        columnNumber: 13
                                    }, this),
                                    l.landingHelpEmail
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1126,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1124,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1082,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                ref: statsReveal.ref,
                className: "relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pb-24",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: `text-2xl sm:text-3xl font-extrabold text-white mb-10 text-center transition-all duration-700 ${statsReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`,
                        children: l.landingStatsTitle
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1149,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4",
                        children: l.landingStats.map((stat, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} p-6 sm:p-8 text-center transition-all duration-700 ${statsReveal.visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"}`,
                                style: {
                                    transitionDelay: `${i * 100}ms`
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1",
                                        children: stat.value
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1161,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[11px] font-semibold uppercase tracking-wider text-neutral-500",
                                        children: stat.label
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1164,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1156,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1154,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1145,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "relative z-10 mx-auto max-w-3xl px-4 sm:px-6 pb-24 text-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} p-8 sm:p-12 overflow-hidden relative`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-600/[0.04] to-cyan-500/[0.03]"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1173,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative space-y-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloWordmark, {
                                    size: "text-3xl",
                                    className: "block"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1175,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-base text-neutral-400 max-w-lg mx-auto",
                                    children: l.landingHeroSub
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1176,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: user ? onDashboard : onStartAnalysis,
                                    className: "rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-900/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]",
                                    children: user ? l.goToDashboard : l.landingCTA
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1179,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1174,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 1172,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1171,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "relative z-10 border-t border-white/[0.06]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-5xl px-4 sm:px-6 py-10",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col md:flex-row items-center md:items-start justify-between gap-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col items-center md:items-start gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloLogo, {
                                                    size: 22,
                                                    className: "opacity-50"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1193,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloWordmark, {
                                                    size: "text-base",
                                                    className: "opacity-50"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1194,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1192,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[11px] text-neutral-600 max-w-xs text-center md:text-left",
                                            children: lang === "tr" ? "Yapay zeka destekli Valorant koçluk platformu." : "AI-powered Valorant coaching platform."
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1196,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1191,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "mailto:support@aimlo.gg",
                                            className: "text-[11px] text-neutral-500 hover:text-white transition-colors",
                                            children: "support@aimlo.gg"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1203,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>document.getElementById("section-about")?.scrollIntoView({
                                                    behavior: "smooth"
                                                }),
                                            className: "text-[11px] text-neutral-500 hover:text-white transition-colors",
                                            children: l.landingNav.about
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1209,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>document.getElementById("section-faq")?.scrollIntoView({
                                                    behavior: "smooth"
                                                }),
                                            className: "text-[11px] text-neutral-500 hover:text-white transition-colors",
                                            children: l.landingNav.faq
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1219,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1202,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1190,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-6 pt-6 border-t border-white/[0.04] text-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] text-neutral-700",
                                children: [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].copy,
                                    " 2025 AIMLO. All rights reserved."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1232,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1231,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 1189,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1188,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 522,
        columnNumber: 5
    }, this);
}
_s(LandingPage, "/kqjA7toJPTPsM00xKTCgwXy8Wg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useScrollReveal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScrollReveal"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useScrollReveal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScrollReveal"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useScrollReveal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScrollReveal"]
    ];
});
_c13 = LandingPage;
/* ══════════════════════════════════════════════════════════
   AUTH SCREEN — profiles upsert + username login (ilike)
   ══════════════════════════════════════════════════════════ */ function AuthScreen({ lang, onAuth, initialMode, onBackToLanding }) {
    _s1();
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialMode);
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [passwordConfirm, setPasswordConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [firstName, setFirstName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [lastName, setLastName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [username, setUsername] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [successMsg, setSuccessMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [checkEmail, setCheckEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [forgotMode, setForgotMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [resendLoading, setResendLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [resendCooldown, setResendCooldown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const resendTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Cleanup interval on unmount to prevent memory leak
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthScreen.useEffect": ()=>{
            return ({
                "AuthScreen.useEffect": ()=>{
                    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
                }
            })["AuthScreen.useEffect"];
        }
    }["AuthScreen.useEffect"], []);
    const al = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["t"][lang];
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        // Client-side email format check — prevents unnecessary Supabase calls & rate limits
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (mode === "register" && !emailRegex.test(email.trim())) {
            setError(al.authInvalidEmail);
            return;
        }
        if (mode === "register" && username.trim().length < 3) {
            setError(al.authUsernameTooShort);
            return;
        }
        if (mode === "register" && password.length < 6) {
            setError(al.authPasswordTooShort);
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
                const usernameAvailable = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkUsernameAvailable"])(username);
                if (!usernameAvailable) {
                    setError(al.authUsernameTaken);
                    setLoading(false);
                    return;
                }
                const { data, error: err } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                            username,
                            display_name: `${firstName} ${lastName}`
                        }
                    }
                });
                if (err) {
                    setError((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["localizeAuthError"])(err.message, lang));
                    setLoading(false);
                    return;
                }
                // Create profile — notify user if it fails
                if (data.user) {
                    const profileResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["upsertProfile"])(data.user.id, {
                        username,
                        email,
                        first_name: firstName,
                        last_name: lastName
                    });
                    if (!profileResult.ok) {
                        console.warn("[Aimlo] Profile creation failed:", profileResult.error);
                        // Non-blocking warning — user can still use email login
                        setError(al.authProfileWarning);
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
                    const { data: foundEmail, error: rpcError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].rpc("lookup_email_by_username", {
                        lookup_username: loginEmail.toLowerCase()
                    });
                    if (rpcError || !foundEmail) {
                        setError((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["localizeAuthError"])("Username not found", lang));
                        setLoading(false);
                        return;
                    }
                    loginEmail = foundEmail;
                }
                const { data, error: err } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signInWithPassword({
                    email: loginEmail,
                    password
                });
                if (err) {
                    setError((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["localizeAuthError"])(err.message, lang));
                    setLoading(false);
                    return;
                }
                if (data.user) onAuth(data.user);
            }
        } catch (err) {
            console.error("[Aimlo] Auth error:", err);
            setError(al.authError);
        }
        setLoading(false);
    }
    async function handleForgotPassword(e) {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        if (!email.trim() || !email.includes("@")) {
            setError(al.authInvalidEmail);
            return;
        }
        setLoading(true);
        try {
            const { error: err } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/auth/callback`
            });
            if (err) {
                setError((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["localizeAuthError"])(err.message, lang));
            } else {
                setSuccessMsg(al.authResetSent);
            }
        } catch (err) {
            console.error("[Aimlo] Reset password error:", err);
            setError(al.authError);
        }
        setLoading(false);
    }
    async function handleResendEmail() {
        if (resendCooldown > 0) return;
        setResendLoading(true);
        setError("");
        setSuccessMsg("");
        try {
            const { error: err } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.resend({
                type: "signup",
                email: email.trim()
            });
            if (err) {
                setError((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["localizeAuthError"])(err.message, lang));
            } else {
                setSuccessMsg(al.authResendSuccess);
                // Start 60s cooldown
                setResendCooldown(60);
                if (resendTimerRef.current) clearInterval(resendTimerRef.current);
                resendTimerRef.current = setInterval(()=>{
                    setResendCooldown((prev)=>{
                        if (prev <= 1) {
                            if (resendTimerRef.current) clearInterval(resendTimerRef.current);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        } catch (err) {
            console.error("[Aimlo] Resend email error:", err);
            setError(al.authError);
        }
        setResendLoading(false);
    }
    if (checkEmail) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].pageBg} flex items-center justify-center px-4`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AmbientBg, {}, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1442,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 w-full max-w-sm space-y-8 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloLogo, {
                        size: 56,
                        className: "mx-auto"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1444,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloWordmark, {
                        size: "text-3xl",
                        className: "block"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1445,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} p-8 space-y-5`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/[0.08] border border-blue-500/10",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    width: "28",
                                    height: "28",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    className: "text-blue-400",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1449,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                            points: "22,6 12,13 2,6"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1450,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1448,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1447,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-neutral-300 leading-relaxed",
                                children: al.authCheckEmail
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1453,
                                columnNumber: 13
                            }, this),
                            successMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-xl bg-emerald-500/[0.06] border border-emerald-500/10 px-4 py-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-emerald-400",
                                    children: successMsg
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1458,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1457,
                                columnNumber: 15
                            }, this),
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-xl bg-red-500/[0.06] border border-red-500/10 px-4 py-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-red-400",
                                    children: error
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1463,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1462,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleResendEmail,
                                disabled: resendLoading || resendCooldown > 0,
                                className: `w-full rounded-xl border py-3.5 text-sm font-semibold transition-all duration-200 ${resendCooldown > 0 ? "border-neutral-700 bg-neutral-800/50 text-neutral-500 cursor-not-allowed" : "border-blue-500/30 bg-blue-500/[0.08] text-blue-400 hover:bg-blue-500/[0.12] hover:border-blue-500/50 active:scale-[0.98]"}`,
                                children: resendLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center justify-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "h-4 w-4 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1477,
                                            columnNumber: 19
                                        }, this),
                                        al.authResendWait
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1476,
                                    columnNumber: 17
                                }, this) : resendCooldown > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center justify-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            width: "14",
                                            height: "14",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            className: "text-neutral-500",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                    cx: "12",
                                                    cy: "12",
                                                    r: "10"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1483,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                    points: "12 6 12 12 16 14"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1484,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1482,
                                            columnNumber: 19
                                        }, this),
                                        lang === "tr" ? `${resendCooldown}s sonra tekrar gönderebilirsiniz` : `Resend available in ${resendCooldown}s`
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1481,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center justify-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            width: "15",
                                            height: "15",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            className: "text-blue-400",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1493,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                    points: "22,6 12,13 2,6"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1494,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1492,
                                            columnNumber: 19
                                        }, this),
                                        al.authResendEmail
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1491,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1466,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setCheckEmail(false);
                                    setMode("login");
                                    setError("");
                                    setSuccessMsg("");
                                },
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnSecondary,
                                children: al.authLogin
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1500,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1446,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1443,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 1441,
        columnNumber: 7
    }, this);
    // ── Forgot password screen ──
    if (forgotMode) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].pageBg} relative flex items-center justify-center px-4 py-12 overflow-hidden`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AmbientBg, {}, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 1519,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative z-10 w-full max-w-sm space-y-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloLogo, {
                                    size: 72,
                                    className: "mx-auto"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1522,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloWordmark, {
                                            size: "text-4xl",
                                            className: "block"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1524,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-2 text-sm text-neutral-500",
                                            children: al.authForgotPassword
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1525,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1523,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1521,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} p-6 sm:p-8 space-y-6`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-bold text-white",
                                        children: al.authForgotPassword
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1530,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1529,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                    onSubmit: handleForgotPassword,
                                    className: "space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Label, {
                                                    text: al.authEmail
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1534,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "email",
                                                    value: email,
                                                    onChange: (e)=>setEmail(e.target.value),
                                                    placeholder: al.authResetEmail,
                                                    required: true,
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].inputBase
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1535,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1533,
                                            columnNumber: 15
                                        }, this),
                                        successMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-xl bg-emerald-500/[0.06] border border-emerald-500/10 px-4 py-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-emerald-400",
                                                children: successMsg
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1546,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1545,
                                            columnNumber: 17
                                        }, this),
                                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-xl bg-red-500/[0.06] border border-red-500/10 px-4 py-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-red-400",
                                                children: error
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1551,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1550,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            disabled: loading,
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnPrimary,
                                            children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center justify-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 1557,
                                                        columnNumber: 21
                                                    }, this),
                                                    al.authLoading
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1556,
                                                columnNumber: 19
                                            }, this) : al.authResetSubmit
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1554,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1532,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        setForgotMode(false);
                                        setError("");
                                        setSuccessMsg("");
                                    },
                                    className: "w-full text-center text-xs text-neutral-500 hover:text-white transition",
                                    children: [
                                        "← ",
                                        al.authResetBack
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1563,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1528,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 1520,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 1518,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].pageBg} relative flex items-center justify-center px-4 py-12 overflow-hidden`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AmbientBg, {}, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1578,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 w-full max-w-sm space-y-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onBackToLanding,
                                className: "mx-auto flex items-center gap-2 text-[11px] text-neutral-500 transition hover:text-white mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "14",
                                        height: "14",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M19 12H5M12 19l-7-7 7-7"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1593,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1585,
                                        columnNumber: 13
                                    }, this),
                                    al.back
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1581,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloLogo, {
                                size: 72,
                                className: "mx-auto"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1597,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloWordmark, {
                                        size: "text-4xl",
                                        className: "block"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1599,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-2 text-sm text-neutral-500",
                                        children: al.tagline
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1600,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1598,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1580,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} p-6 sm:p-8 space-y-6`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-bold text-white",
                                    children: mode === "login" ? al.authLogin : al.authRegister
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1605,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1604,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: handleSubmit,
                                className: "space-y-4",
                                children: [
                                    mode === "register" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Label, {
                                                                text: al.authFirstName
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 1614,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                value: firstName,
                                                                onChange: (e)=>setFirstName(e.target.value),
                                                                placeholder: al.authFirstNamePh,
                                                                required: true,
                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].inputBase
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 1615,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 1613,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Label, {
                                                                text: al.authLastName
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 1625,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                value: lastName,
                                                                onChange: (e)=>setLastName(e.target.value),
                                                                placeholder: al.authLastNamePh,
                                                                required: true,
                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].inputBase
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 1626,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 1624,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1612,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Label, {
                                                        text: al.authUsername
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 1637,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: username,
                                                        onChange: (e)=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")),
                                                        placeholder: al.authUsernamePh,
                                                        required: true,
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].inputBase
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 1638,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1636,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Label, {
                                                text: mode === "login" ? al.authEmailOrUsername : al.authEmail
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1654,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: mode === "register" ? "email" : "text",
                                                value: email,
                                                onChange: (e)=>setEmail(e.target.value),
                                                placeholder: mode === "login" ? al.authEmailOrUsernamePh : al.authEmailPh,
                                                required: true,
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].inputBase
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1657,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1653,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Label, {
                                                text: al.authPassword
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1669,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "password",
                                                value: password,
                                                onChange: (e)=>setPassword(e.target.value),
                                                placeholder: al.authPasswordPh,
                                                required: true,
                                                minLength: 6,
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].inputBase
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1670,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1668,
                                        columnNumber: 13
                                    }, this),
                                    mode === "register" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Label, {
                                                text: al.authPasswordConfirm
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1682,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "password",
                                                value: passwordConfirm,
                                                onChange: (e)=>setPasswordConfirm(e.target.value),
                                                placeholder: al.authPasswordConfirmPh,
                                                required: true,
                                                minLength: 6,
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].inputBase
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1683,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1681,
                                        columnNumber: 15
                                    }, this),
                                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl bg-red-500/[0.06] border border-red-500/10 px-4 py-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-red-400",
                                            children: error
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1696,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1695,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        disabled: loading,
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnPrimary,
                                        children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "flex items-center justify-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1702,
                                                    columnNumber: 19
                                                }, this),
                                                al.authLoading
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1701,
                                            columnNumber: 17
                                        }, this) : mode === "login" ? al.authLogin : al.authRegister
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1699,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1609,
                                columnNumber: 11
                            }, this),
                            mode === "login" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    setForgotMode(true);
                                    setError("");
                                    setSuccessMsg("");
                                },
                                className: "w-full text-center text-[11px] text-neutral-500 hover:text-blue-400 transition",
                                children: al.authForgotPassword
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1713,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-center text-xs text-neutral-500",
                                children: [
                                    mode === "login" ? al.authNoAccount : al.authHasAccount,
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>{
                                            setMode(mode === "login" ? "register" : "login");
                                            setError("");
                                            setSuccessMsg("");
                                        },
                                        className: "text-blue-400 hover:text-blue-300 transition font-semibold",
                                        children: mode === "login" ? al.authRegister : al.authLogin
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1723,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1721,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1603,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1579,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 1575,
        columnNumber: 5
    }, this);
}
_s1(AuthScreen, "ceToF0QDDc/BIUi60xA8gzo9BDM=");
_c14 = AuthScreen;
function Home() {
    _s2();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [authLoading, setAuthLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [authMode, setAuthMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("login");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession().then({
                "Home.useEffect": ({ data: { session } })=>{
                    setUser(session?.user ?? null);
                    setAuthLoading(false);
                }
            }["Home.useEffect"]).catch({
                "Home.useEffect": (err)=>{
                    console.error("[Aimlo] getSession error:", err);
                    setAuthLoading(false);
                }
            }["Home.useEffect"]);
            const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange({
                "Home.useEffect": (_event, session)=>{
                    setUser(session?.user ?? null);
                }
            }["Home.useEffect"]);
            return ({
                "Home.useEffect": ()=>subscription.unsubscribe()
            })["Home.useEffect"];
        }
    }["Home.useEffect"], []);
    async function handleSignOut() {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
        } catch (err) {
            console.error("[Aimlo] signOut error:", err);
        }
        setUser(null);
        setScreen("landing");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearDraft"])();
    }
    const [lang, setLang] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [screen, setScreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("landing");
    const [setup, setSetup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        map: "",
        agent: "",
        side: "",
        teamComp: [],
        enemyComp: [],
        unknownEnemyComp: false
    });
    const [setupStep, setSetupStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("mapAgent");
    const [setupErrors, setSetupErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [compTarget, setCompTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("team");
    const [rounds, setRounds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [roundIdx, setRoundIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [roundForm, setRoundForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        deathLocation: "",
        enemyCount: "",
        yourNote: ""
    });
    const [roundErrors, setRoundErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [roundMode, setRoundMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("input");
    const [currentFeedback, setCurrentFeedback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentResult, setCurrentResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [survived, setSurvived] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [matchScore, setMatchScore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        yours: "",
        enemy: ""
    });
    const [pendingFinishRound, setPendingFinishRound] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [report, setReport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [savedReports, setSavedReports] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [viewingReport, setViewingReport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [historyLoading, setHistoryLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [feedbackLoading, setFeedbackLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [reportLoading, setReportLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [verifiedBanner, setVerifiedBanner] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const locations = setup.map ? __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAP_LOCATIONS"][setup.map] ?? [] : [];
    const roundNum = roundIdx + 1;
    // Check for email verification callback (?verified=true)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const params = new URLSearchParams(window.location.search);
            const verified = params.get("verified");
            if (verified === "true") {
                setVerifiedBanner("success");
                // Clean URL
                window.history.replaceState({}, "", window.location.pathname);
                // Auto-hide after 6 seconds
                setTimeout({
                    "Home.useEffect": ()=>setVerifiedBanner(null)
                }["Home.useEffect"], 6000);
            } else if (verified === "error") {
                setVerifiedBanner("error");
                window.history.replaceState({}, "", window.location.pathname);
                setTimeout({
                    "Home.useEffect": ()=>setVerifiedBanner(null)
                }["Home.useEffect"], 6000);
            }
        }
    }["Home.useEffect"], []);
    // ALL hooks must be above early returns — React rules of hooks
    const finishLockRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const submitLockRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const winRate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Home.useMemo[winRate]": ()=>savedReports.length > 0 ? Math.round(savedReports.filter({
                "Home.useMemo[winRate]": (r)=>r.won
            }["Home.useMemo[winRate]"]).length / savedReports.length * 100) : 0
    }["Home.useMemo[winRate]"], [
        savedReports
    ]);
    const topDeathSpot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Home.useMemo[topDeathSpot]": ()=>{
            const spots = {};
            savedReports.forEach({
                "Home.useMemo[topDeathSpot]": (r)=>{
                    r.rounds.filter({
                        "Home.useMemo[topDeathSpot]": (rd)=>!rd.skipped && !rd.survived && rd.deathLocation
                    }["Home.useMemo[topDeathSpot]"]).forEach({
                        "Home.useMemo[topDeathSpot]": (rd)=>{
                            spots[rd.deathLocation] = (spots[rd.deathLocation] || 0) + 1;
                        }
                    }["Home.useMemo[topDeathSpot]"]);
                }
            }["Home.useMemo[topDeathSpot]"]);
            return Object.entries(spots).sort({
                "Home.useMemo[topDeathSpot]": (a, b)=>b[1] - a[1]
            }["Home.useMemo[topDeathSpot]"])[0];
        }
    }["Home.useMemo[topDeathSpot]"], [
        savedReports
    ]);
    const topAgent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Home.useMemo[topAgent]": ()=>{
            const agents = {};
            savedReports.forEach({
                "Home.useMemo[topAgent]": (r)=>{
                    if (r.agent) agents[r.agent] = (agents[r.agent] || 0) + 1;
                }
            }["Home.useMemo[topAgent]"]);
            const top = Object.entries(agents).sort({
                "Home.useMemo[topAgent]": (a, b)=>b[1] - a[1]
            }["Home.useMemo[topAgent]"])[0];
            return top ? {
                name: top[0],
                count: top[1]
            } : null;
        }
    }["Home.useMemo[topAgent]"], [
        savedReports
    ]);
    // FIX: redirect "lang" via useEffect, not during render
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (user && screen === "lang") setScreen("landing");
        }
    }["Home.useEffect"], [
        user,
        screen
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            setLang((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadLang"])() || "en");
        }
    }["Home.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (screen === "setup" || screen === "round") (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveDraft"])({
                setup,
                setupStep,
                rounds,
                roundIdx,
                screen
            });
        }
    }["Home.useEffect"], [
        setup,
        setupStep,
        rounds,
        roundIdx,
        screen
    ]);
    const draftRestored = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (!draftRestored.current && user && lang) {
                draftRestored.current = true;
                const draft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadDraft"])();
                if (draft && (draft.screen === "setup" || draft.screen === "round") && draft.setup?.map && Array.isArray(draft.rounds) && typeof draft.roundIdx === "number") {
                    setSetup(draft.setup);
                    setSetupStep(draft.setupStep);
                    setRounds(draft.rounds);
                    setRoundIdx(draft.roundIdx);
                    setScreen(draft.screen);
                } else if (draft) {
                    // Invalid draft shape — clear it
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearDraft"])();
                }
            }
        }
    }["Home.useEffect"], [
        user,
        lang
    ]);
    const loadHistory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[loadHistory]": async ()=>{
            if (!user) return;
            setHistoryLoading(true);
            function rowToReport(row) {
                const json = row.raw_result_json || {};
                const rawDateStr = row.created_at || new Date().toISOString();
                const parsedDate = new Date(rawDateStr);
                const isValidDate = !isNaN(parsedDate.getTime());
                return {
                    id: row.id || crypto.randomUUID(),
                    map: json.map || row.riot_id || "",
                    agent: json.agent || row.region || "",
                    side: json.side || "",
                    score: json.score || "",
                    won: json.won ?? false,
                    rawDate: isValidDate ? parsedDate.toISOString() : new Date().toISOString(),
                    date: isValidDate ? parsedDate.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }) : "",
                    summary: row.summary || json.summary || "",
                    mistake: row.weakness || json.mistake || "",
                    tendencies: row.strength || json.tendencies || "",
                    adjustment: row.focus || json.adjustment || "",
                    winPct: json.winPct || 0,
                    roundsWon: json.roundsWon || 0,
                    roundsLost: json.roundsLost || 0,
                    roundsSkipped: json.roundsSkipped || 0,
                    survivedCount: json.survivedCount || 0,
                    totalRounds: json.totalRounds || 0,
                    rounds: json.rounds || [],
                    setup: json.setup || {
                        map: "",
                        agent: "",
                        side: "",
                        teamComp: [],
                        enemyComp: [],
                        unknownEnemyComp: false
                    }
                };
            }
            let allReports = [];
            try {
                const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("analyses").select("*").eq("user_id", user.id).order("created_at", {
                    ascending: false
                }).limit(50);
                if (error) console.error("[Aimlo] History load error:", error.message);
                else if (data?.length) allReports = data.map({
                    "Home.useCallback[loadHistory]": (row)=>rowToReport(row)
                }["Home.useCallback[loadHistory]"]);
            } catch (err) {
                console.error("[Aimlo] History load exception:", err);
            }
            try {
                const localRaw = JSON.parse(localStorage.getItem(`aimlo_local_reports_${user.id}`) || "[]");
                if (localRaw.length > 0) {
                    const lr = localRaw.map({
                        "Home.useCallback[loadHistory].lr": (row)=>rowToReport(row)
                    }["Home.useCallback[loadHistory].lr"]);
                    const ids = new Set(allReports.map({
                        "Home.useCallback[loadHistory]": (r)=>r.id
                    }["Home.useCallback[loadHistory]"]));
                    for (const r of lr){
                        if (!ids.has(r.id)) allReports.push(r);
                    }
                    allReports.sort({
                        "Home.useCallback[loadHistory]": (a, b)=>new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
                    }["Home.useCallback[loadHistory]"]);
                }
            } catch (localErr) {
                // Clear corrupted localStorage data
                console.error("[Aimlo] Local reports parse failed, clearing:", localErr);
                try {
                    localStorage.removeItem(`aimlo_local_reports_${user.id}`);
                } catch  {}
            }
            setSavedReports(allReports);
            setHistoryLoading(false);
        }
    }["Home.useCallback[loadHistory]"], [
        user,
        lang
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (user && lang) loadHistory();
        }
    }["Home.useEffect"], [
        user,
        lang,
        loadHistory
    ]);
    async function saveReportToDb(rep, sd, rd, sc) {
        if (!user) return;
        // NOTE: DB columns riot_id/region are legacy names; they store map/agent respectively.
        // raw_result_json contains the canonical field names.
        const payload = {
            user_id: user.id,
            riot_id: sd.map,
            region: sd.agent,
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
                setup: sd
            }
        };
        let ok = false;
        try {
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("analyses").insert(payload);
            if (error) console.error("[Aimlo] Save:", error.message);
            else ok = true;
        } catch (e) {
            console.error("[Aimlo] Save exception:", e);
        }
        if (!ok) {
            try {
                const ex = JSON.parse(localStorage.getItem(`aimlo_local_reports_${user.id}`) || "[]");
                ex.unshift({
                    ...payload,
                    id: crypto.randomUUID(),
                    created_at: new Date().toISOString()
                });
                localStorage.setItem(`aimlo_local_reports_${user.id}`, JSON.stringify(ex.slice(0, 100)));
            } catch  {}
        }
        loadHistory();
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            setSetup({
                "Home.useEffect": (prev)=>{
                    const comp = [
                        ...prev.teamComp
                    ];
                    if (prev.agent) {
                        const idx = comp.indexOf(prev.agent);
                        if (idx > 0) comp.splice(idx, 1);
                        comp[0] = prev.agent;
                        return {
                            ...prev,
                            teamComp: [
                                prev.agent,
                                ...comp.filter({
                                    "Home.useEffect": (a)=>a && a !== prev.agent
                                }["Home.useEffect"])
                            ]
                        };
                    } else {
                        if (comp.length > 0 && comp[0]) comp[0] = "";
                        return {
                            ...prev,
                            teamComp: comp.filter({
                                "Home.useEffect": (a)=>a
                            }["Home.useEffect"])
                        };
                    }
                }
            }["Home.useEffect"]);
        }
    }["Home.useEffect"], [
        setup.agent
    ]);
    if (authLoading || !lang) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].pageBg} flex items-center justify-center`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AmbientBg, {}, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 2077,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 flex flex-col items-center gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloLogo, {
                        size: 48,
                        className: "animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 2079,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 2080,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 2078,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 2076,
        columnNumber: 7
    }, this);
    // ── Email verification banner (shows on any screen) ──
    const VerifiedBanner = verifiedBanner ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-300 ${verifiedBanner === "success" ? "bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300" : "bg-red-500/20 border-b border-red-500/30 text-red-300"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: verifiedBanner === "success" ? `✓ ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["t"][lang].authVerifiedSuccess}` : `✕ ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["t"][lang].authVerifiedError}`
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 2093,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setVerifiedBanner(null),
                className: "ml-2 rounded-md px-2 py-0.5 text-xs opacity-70 hover:opacity-100 transition",
                children: "✕"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 2098,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 2086,
        columnNumber: 5
    }, this) : null;
    if (screen === "landing") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            VerifiedBanner,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LandingPage, {
                lang: lang,
                user: user,
                onStartAnalysis: ()=>{
                    setAuthMode("register");
                    setScreen("lang");
                },
                onLogin: ()=>{
                    setAuthMode("login");
                    setScreen("lang");
                },
                onRegister: ()=>{
                    setAuthMode("register");
                    setScreen("lang");
                },
                onLangToggle: ()=>{
                    const nl = lang === "tr" ? "en" : "tr";
                    setLang(nl);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveLang"])(nl);
                },
                onDashboard: ()=>setScreen("dashboard"),
                onSignOut: handleSignOut
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 2110,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
    if (!user) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthScreen, {
        lang: lang,
        onAuth: (u)=>{
            setUser(u);
            setScreen("dashboard");
        },
        initialMode: authMode,
        onBackToLanding: ()=>setScreen("landing")
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 2137,
        columnNumber: 7
    }, this);
    // useEffect redirects "lang" screen — show loading spinner briefly
    if (screen === "lang") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].pageBg} flex items-center justify-center`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 2151,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 2150,
        columnNumber: 7
    }, this);
    const l = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["t"][lang];
    function updateSetup(key, val) {
        setSetup((p)=>({
                ...p,
                [key]: val
            }));
        setSetupErrors((p)=>{
            const n = {
                ...p
            };
            delete n[key];
            return n;
        });
    }
    function updateRound(key, val) {
        setRoundForm((p)=>({
                ...p,
                [key]: val
            }));
        setRoundErrors((p)=>{
            const n = {
                ...p
            };
            delete n[key];
            return n;
        });
    }
    function handleCompSelect(type, agent) {
        setSetup((prev)=>{
            const arr = [
                ...prev[type]
            ];
            if (type === "teamComp" && agent === prev.agent) return prev;
            const idx = arr.indexOf(agent);
            if (idx >= 0) arr.splice(idx, 1);
            else if (arr.length < 5) arr.push(agent);
            return {
                ...prev,
                [type]: arr
            };
        });
        setSetupErrors((p)=>{
            const n = {
                ...p
            };
            delete n[type];
            return n;
        });
    }
    function loadRoundAtIndex(idx) {
        setRoundIdx(idx);
        setRoundErrors({});
        setRoundMode("input");
        setCurrentFeedback(null);
        setCurrentResult(null);
        setSurvived(false);
        if (idx < rounds.length) {
            const r = rounds[idx];
            setSurvived(r.survived);
            setRoundForm(r.skipped ? {
                deathLocation: "",
                enemyCount: "",
                yourNote: ""
            } : {
                deathLocation: r.deathLocation,
                enemyCount: r.enemyCount,
                yourNote: r.yourNote
            });
        } else setRoundForm({
            deathLocation: "",
            enemyCount: "",
            yourNote: ""
        });
    }
    function saveRoundData(rd) {
        setRounds((prev)=>{
            const c = [
                ...prev
            ];
            if (roundIdx < c.length) c[roundIdx] = rd;
            else c.push(rd);
            return c;
        });
    }
    function getRoundsForReport(extra) {
        const c = [
            ...rounds
        ];
        if (extra) {
            if (roundIdx < c.length) c[roundIdx] = extra;
            else c.push(extra);
        }
        return c;
    }
    function goToScoreInput(extraRound) {
        if (extraRound) {
            setPendingFinishRound(extraRound);
            saveRoundData(extraRound);
        } else setPendingFinishRound(null);
        setMatchScore({
            yours: "",
            enemy: ""
        });
        setScreen("scoreInput");
    }
    async function finishWithScore(yours, enemy) {
        if (reportLoading || finishLockRef.current) return;
        finishLockRef.current = true;
        const sc = {
            yours,
            enemy
        };
        const all = getRoundsForReport(pendingFinishRound ?? undefined);
        if (pendingFinishRound) setRounds(all);
        setReport(null); // clear stale report
        setReportLoading(true);
        setScreen("report");
        let rep;
        try {
            const reportAuthHeaders = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAuthHeaders"])();
            const res = await fetch("/api/ai/report", {
                method: "POST",
                headers: reportAuthHeaders,
                body: JSON.stringify({
                    setup,
                    rounds: all,
                    lang: lang ?? "tr",
                    score: sc
                })
            });
            if (res.ok) {
                const json = await res.json();
                rep = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidReport"])(json) ? json : (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$generators$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genMatchReport"])(setup, all, lang ?? "tr", sc);
            } else {
                rep = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$generators$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genMatchReport"])(setup, all, lang ?? "tr", sc);
            }
        } catch  {
            rep = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$generators$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genMatchReport"])(setup, all, lang ?? "tr", sc);
        } finally{
            setReportLoading(false);
            finishLockRef.current = false;
        }
        setReport(rep);
        saveReportToDb(rep, setup, all, sc);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearDraft"])();
    }
    function handleLangToggle() {
        const nl = lang === "tr" ? "en" : "tr";
        setLang(nl);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveLang"])(nl);
    }
    function resetForNewMatch() {
        setSetup({
            map: "",
            agent: "",
            side: "",
            teamComp: [],
            enemyComp: [],
            unknownEnemyComp: false
        });
        setRounds([]);
        setRoundIdx(0);
        setReport(null);
        setRoundMode("input");
        setCurrentFeedback(null);
        setCurrentResult(null);
        setSurvived(false);
        setSetupStep("mapAgent");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearDraft"])();
        setScreen("setup");
    }
    const SETUP_STEPS = [
        "mapAgent",
        "sideComp",
        "confirm"
    ];
    function getStepLabel(step) {
        return ({
            mapAgent: l.stepMapAgent,
            sideComp: l.stepSideComp,
            confirm: l.stepConfirm
        })[step];
    }
    const navProps = {
        user,
        lang,
        onSignOut: handleSignOut,
        onLogoClick: ()=>setScreen("landing"),
        onLangToggle: handleLangToggle,
        signOutLabel: l.authSignOut,
        onHome: ()=>setScreen("landing"),
        homeLabel: l.homePage
    };
    /* DASHBOARD */ if (screen === "dashboard") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].pageBg,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AmbientBg, {}, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 2318,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Navbar, {
                ...navProps
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 2319,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 mx-auto max-w-3xl px-4 pt-20 pb-12 space-y-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: resetForNewMatch,
                        className: `w-full group ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].cardHover} overflow-hidden`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-5 sm:p-6 flex items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative shrink-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-0 m-auto h-12 w-12 rounded-2xl bg-blue-500/25 blur-xl group-hover:bg-blue-500/35 transition-all duration-500"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 2327,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 shadow-lg shadow-blue-900/30 group-hover:scale-105 group-hover:shadow-xl transition-all duration-300 ring-1 ring-white/10",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                width: "24",
                                                height: "24",
                                                viewBox: "0 0 24 24",
                                                fill: "none",
                                                stroke: "white",
                                                strokeWidth: "2",
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                        cx: "12",
                                                        cy: "12",
                                                        r: "10",
                                                        opacity: "0.2",
                                                        fill: "white",
                                                        strokeWidth: "0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2339,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10",
                                                        strokeWidth: "0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2347,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                                        points: "10 8 16 12 10 16 10 8",
                                                        fill: "white"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2351,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2329,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 2328,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2326,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-left",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-lg font-bold text-white",
                                            children: l.dashNewMatch
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 2356,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-neutral-500 mt-0.5",
                                            children: l.dashNewMatchDesc
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 2359,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2355,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "ml-auto text-neutral-600 group-hover:text-blue-400 transition-colors duration-200 text-lg",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].arrow
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2363,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 2325,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 2321,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 sm:grid-cols-4 gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                                label: l.dashWinRate,
                                value: savedReports.length > 0 ? `${winRate}%` : "\u2014",
                                color: winRate >= 50 ? "text-emerald-400" : winRate > 0 ? "text-red-400" : "text-neutral-600"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2369,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                                label: l.dashMatches,
                                value: String(savedReports.length),
                                sub: savedReports.length > 0 ? `${savedReports.filter((r)=>r.won).length}W ${savedReports.filter((r)=>!r.won).length}L` : undefined
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2380,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                                label: l.dashFreqDeath,
                                value: topDeathSpot ? topDeathSpot[0] : "\u2014",
                                color: topDeathSpot ? "text-amber-400" : "text-neutral-600",
                                sub: topDeathSpot ? `${topDeathSpot[1]}x` : l.dashNoStats
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2389,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} p-4 sm:p-5 text-center`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-1.5",
                                        children: l.dashTopAgent
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2397,
                                        columnNumber: 15
                                    }, this),
                                    topAgent ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col items-center gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-8 w-8 rounded-lg overflow-hidden bg-black/20 ring-1 ring-white/[0.06]",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["agentImgUrl"])(topAgent.name),
                                                    alt: topAgent.name,
                                                    className: "h-full w-full object-cover",
                                                    loading: "lazy"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2403,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2402,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-extrabold text-cyan-400",
                                                children: topAgent.name
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2410,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] text-neutral-600 font-medium",
                                                children: [
                                                    topAgent.count,
                                                    "x"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2413,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2401,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-2xl font-extrabold tabular-nums text-neutral-600",
                                        children: "\u2014"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2418,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2396,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 2368,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xs font-bold uppercase tracking-[0.15em] text-neutral-500",
                                        children: l.dashRecentTitle
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2426,
                                        columnNumber: 15
                                    }, this),
                                    savedReports.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setScreen("history"),
                                        className: "text-[11px] font-semibold text-blue-400 transition hover:text-blue-300",
                                        children: [
                                            l.dashHistory,
                                            " ",
                                            __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].arrow
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2430,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2425,
                                columnNumber: 13
                            }, this),
                            historyLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} p-8 flex justify-center`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2440,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2439,
                                columnNumber: 15
                            }, this) : savedReports.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} p-10 text-center`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloLogo, {
                                        size: 48,
                                        className: "mx-auto opacity-10 mb-4"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2444,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-semibold text-neutral-400",
                                        children: l.dashNoData
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2445,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-xs text-neutral-600",
                                        children: l.dashNoDataDesc
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2448,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2443,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: savedReports.slice(0, 5).map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            setViewingReport(entry);
                                            setScreen("reportDetail");
                                        },
                                        className: `w-full text-left ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].cardHover} p-4 flex items-center gap-4`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-black/20 ring-1 ring-white/[0.06]",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAP_IMAGES"][entry.map],
                                                    alt: entry.map,
                                                    className: "h-full w-full object-cover opacity-75",
                                                    loading: "lazy"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2464,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2463,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-0 flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-bold text-white",
                                                                children: entry.map
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 2473,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-neutral-500",
                                                                children: entry.agent
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 2476,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2472,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-0.5 text-[11px] text-neutral-600",
                                                        children: entry.date
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2480,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2471,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-right shrink-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-bold text-white",
                                                        children: entry.score
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2485,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: `text-[10px] font-bold uppercase ${entry.won ? "text-emerald-400" : "text-red-400"}`,
                                                        children: entry.won ? l.victory : l.defeat
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2488,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2484,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, entry.id, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2455,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2453,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 2424,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 2320,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 2317,
        columnNumber: 7
    }, this);
    /* HISTORY */ if (screen === "history") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].pageBg,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AmbientBg, {}, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 2506,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Navbar, {
                ...navProps
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 2507,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 mx-auto max-w-3xl px-4 pt-20 pb-12 space-y-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setScreen("dashboard"),
                                className: "rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-400 transition hover:text-white",
                                children: [
                                    "\u2190",
                                    " ",
                                    l.back
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2510,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-bold text-white",
                                children: l.historyTitle
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2516,
                                columnNumber: 13
                            }, this),
                            savedReports.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-auto text-xs text-neutral-500",
                                children: [
                                    l.dashWinRate,
                                    ":",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: winRate >= 50 ? "text-emerald-400 font-bold" : "text-red-400 font-bold",
                                        children: [
                                            winRate,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2520,
                                        columnNumber: 17
                                    }, this),
                                    " ",
                                    __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].dot,
                                    " ",
                                    savedReports.length,
                                    " ",
                                    l.dashMatches.toLowerCase()
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2518,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 2509,
                        columnNumber: 11
                    }, this),
                    savedReports.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} p-12 text-center`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloLogo, {
                                size: 48,
                                className: "mx-auto opacity-10 mb-4"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2535,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-neutral-400",
                                children: l.historyEmpty
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2536,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-xs text-neutral-600",
                                children: l.historyEmptyDesc
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2537,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 2534,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: savedReports.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setViewingReport(entry);
                                    setScreen("reportDetail");
                                },
                                className: `w-full text-left ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].cardHover} p-4 sm:p-5 flex items-center gap-4`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-black/20 ring-1 ring-white/[0.06]",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAP_IMAGES"][entry.map],
                                            alt: entry.map,
                                            className: "h-full w-full object-cover opacity-75",
                                            loading: "lazy"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 2553,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2552,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-0 flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 flex-wrap",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-bold text-white",
                                                        children: entry.map
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2562,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-neutral-400",
                                                        children: entry.agent
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2565,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] text-neutral-500",
                                                        children: entry.side === "attack" ? l.sideAttack : l.sideDefense
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2568,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2561,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 text-[11px] text-neutral-600",
                                                children: entry.date
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2572,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2560,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-right shrink-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-lg font-extrabold text-white",
                                                children: entry.score
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2577,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `text-[10px] font-bold uppercase ${entry.won ? "text-emerald-400" : "text-red-400"}`,
                                                children: entry.won ? l.victory : l.defeat
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2580,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2576,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, entry.id, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2544,
                                columnNumber: 17
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 2542,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 2508,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 2505,
        columnNumber: 7
    }, this);
    /* REPORT DETAIL */ if (screen === "reportDetail" && viewingReport) {
        const vr = viewingReport;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].pageBg} relative`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapBg, {
                    map: vr.map
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 2598,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Navbar, {
                    ...navProps
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 2599,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative z-10 mx-auto max-w-lg px-4 pt-20 pb-12 space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setScreen("history"),
                                    className: "rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-400 transition hover:text-white",
                                    children: [
                                        "\u2190",
                                        " ",
                                        l.back
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2602,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-bold text-white",
                                    children: l.reportTitle
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2608,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 2601,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} overflow-hidden`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pointer-events-none absolute inset-0 opacity-[0.12]",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAP_IMAGES"][vr.map],
                                            alt: "",
                                            className: "h-full w-full object-cover"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 2613,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2612,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2619,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative flex items-end justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].label,
                                                        children: l.matchResult
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2622,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-1 text-4xl font-extrabold tracking-tight text-white",
                                                        children: vr.score
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2623,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: `mt-1 text-xs font-bold uppercase ${vr.won ? "text-emerald-400" : "text-red-400"}`,
                                                        children: vr.won ? l.victory : l.defeat
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2626,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2621,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-right space-y-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[11px] text-neutral-500",
                                                        children: [
                                                            vr.map,
                                                            " ",
                                                            __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].dot,
                                                            " ",
                                                            vr.agent
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2633,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[11px] text-neutral-600",
                                                        children: vr.date
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2636,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-lg font-extrabold text-blue-400",
                                                        children: [
                                                            vr.winPct,
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2637,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2632,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2620,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all",
                                            style: {
                                                width: `${vr.winPct}%`
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 2643,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2642,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative mt-3 grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wider",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-neutral-500",
                                                        children: l.enteredRounds
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2650,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2651,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-white text-sm",
                                                        children: vr.totalRounds
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2652,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2649,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-neutral-500",
                                                        children: l.roundsWon
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2655,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2656,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-emerald-400 text-sm",
                                                        children: vr.roundsWon
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2657,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2654,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-neutral-500",
                                                        children: l.roundsLost
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2662,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2663,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-red-400 text-sm",
                                                        children: vr.roundsLost
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2664,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2661,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-neutral-500",
                                                        children: l.roundsSkipped
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2667,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2668,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-neutral-400 text-sm",
                                                        children: vr.roundsSkipped
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2669,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2666,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2648,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2611,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 2610,
                            columnNumber: 11
                        }, this),
                        vr.rounds.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-1.5 justify-center",
                            children: vr.rounds.map((r, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `rounded-lg px-2 py-1 text-[10px] font-bold uppercase border ${r.result === "win" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-red-500/10 text-red-400 border-red-500/10"} ${r.skipped ? "opacity-40" : ""}`,
                                    children: [
                                        "R",
                                        r.roundNumber,
                                        " ",
                                        r.result === "win" ? l.wonLabel : l.lostLabel,
                                        r.skipped ? l.skippedLabel : ""
                                    ]
                                }, i, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2679,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 2677,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ReportCard, {
                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].diamond,
                                    color: "text-cyan-400",
                                    label: l.overallSummary,
                                    text: vr.summary
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2691,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ReportCard, {
                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].cross,
                                    color: "text-red-400",
                                    label: l.mainRecurringMistake,
                                    text: vr.mistake
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2697,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ReportCard, {
                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].circle,
                                    color: "text-amber-400",
                                    label: l.enemyTendencies,
                                    text: vr.tendencies
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2703,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ReportCard, {
                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].play,
                                    color: "text-emerald-400",
                                    label: l.suggestedAdjustment,
                                    text: vr.adjustment
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2709,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 2690,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: resetForNewMatch,
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnPrimary,
                                    children: l.newMatch
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2717,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setScreen("dashboard"),
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnSecondary,
                                    children: l.returnToMenu
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2720,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 2716,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 2600,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 2597,
            columnNumber: 7
        }, this);
    }
    /* SETUP */ if (screen === "setup") {
        const stepIdx = SETUP_STEPS.indexOf(setupStep);
        function nextStep() {
            const e = {};
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
            if (stepIdx < SETUP_STEPS.length - 1) {
                setSetupStep(SETUP_STEPS[stepIdx + 1]);
                setSetupErrors({});
            } else {
                setRounds([]);
                setRoundIdx(0);
                setRoundForm({
                    deathLocation: "",
                    enemyCount: "",
                    yourNote: ""
                });
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].pageBg} relative`,
            children: [
                setup.map ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapBg, {
                    map: setup.map
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 2774,
                    columnNumber: 22
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AmbientBg, {}, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 2774,
                    columnNumber: 50
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Navbar, {
                    ...navProps
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 2775,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative z-10 mx-auto max-w-2xl px-4 pt-20 pb-12 space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-2xl font-bold text-white",
                                children: l.setupTitle
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2778,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 2777,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-center gap-1",
                            children: SETUP_STEPS.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                if (i <= stepIdx) {
                                                    setSetupStep(s);
                                                    setSetupErrors({});
                                                }
                                            },
                                            className: `rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${i === stepIdx ? "bg-blue-500/12 text-blue-400 ring-1 ring-blue-500/30" : i < stepIdx ? "bg-white/[0.05] text-neutral-400 cursor-pointer hover:text-white" : "bg-white/[0.02] text-neutral-700"}`,
                                            children: getStepLabel(s)
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 2783,
                                            columnNumber: 17
                                        }, this),
                                        i < SETUP_STEPS.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-neutral-700 text-xs",
                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].mid
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 2795,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, s, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2782,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 2780,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].cardInner} space-y-6`,
                            children: [
                                setupStep === "mapAgent" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Label, {
                                                    text: l.map
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2804,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "grid grid-cols-3 gap-2.5 sm:grid-cols-4",
                                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAPS"].map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>updateSetup("map", m),
                                                            className: `relative overflow-hidden rounded-xl border py-4 text-sm font-medium transition-all duration-200 ${setup.map === m ? "border-blue-500/50 bg-blue-500/10 text-white ring-1 ring-blue-500/30 shadow-lg shadow-blue-500/5" : "border-white/[0.06] bg-[#070c16] text-neutral-400 hover:border-white/[0.1] hover:text-white"}`,
                                                            children: [
                                                                setup.map === m && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "pointer-events-none absolute inset-0 opacity-20",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                        src: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAP_IMAGES"][m],
                                                                        alt: "",
                                                                        className: "h-full w-full object-cover"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 2814,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 2813,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "relative",
                                                                    children: m
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 2821,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, m, true, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 2807,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2805,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InlineError, {
                                                    msg: setupErrors.map
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2825,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 2803,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "border-t border-white/[0.06] pt-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Label, {
                                                    text: l.agent
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2828,
                                                    columnNumber: 19
                                                }, this),
                                                setup.agent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mb-4 flex items-center gap-3 rounded-xl bg-blue-500/[0.06] border border-blue-500/15 px-4 py-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "h-10 w-10 overflow-hidden rounded-xl bg-black/20 ring-1 ring-blue-500/15",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                src: (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["agentImgUrl"])(setup.agent),
                                                                alt: setup.agent,
                                                                className: "h-full w-full object-cover",
                                                                loading: "lazy"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 2832,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 2831,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-sm font-bold text-white",
                                                                    children: setup.agent
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 2840,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-[10px] text-blue-400",
                                                                    children: l.selected
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 2843,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 2839,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2830,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-5",
                                                    children: Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AGENT_GROUPS"]).map(([group, agents])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "mb-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-600",
                                                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AGENT_GROUP_LABELS"][group][lang]
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 2852,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "grid grid-cols-4 gap-2 sm:grid-cols-6",
                                                                    children: agents.map((a)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AgentMiniCard, {
                                                                            name: a,
                                                                            selected: setup.agent === a,
                                                                            disabled: false,
                                                                            onClick: ()=>updateSetup("agent", setup.agent === a ? "" : a)
                                                                        }, a, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 2857,
                                                                            columnNumber: 29
                                                                        }, this))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 2855,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, group, true, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 2851,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2849,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InlineError, {
                                                    msg: setupErrors.agent
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2871,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 2827,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true),
                                setupStep === "sideComp" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Label, {
                                                    text: l.side
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2878,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-4",
                                                    children: [
                                                        [
                                                            "attack",
                                                            l.sideAttack,
                                                            "border-orange-500/25 bg-orange-500/[0.06]"
                                                        ],
                                                        [
                                                            "defense",
                                                            l.sideDefense,
                                                            "border-sky-500/25 bg-sky-500/[0.06]"
                                                        ]
                                                    ].map(([val, label, activeStyle])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>updateSetup("side", val),
                                                            className: `flex-1 rounded-xl border py-5 text-sm font-bold transition-all duration-200 ${setup.side === val ? `${activeStyle} text-white ring-1 ring-blue-500/30 shadow-lg` : "border-white/[0.06] bg-[#070c16] text-neutral-400 hover:border-white/[0.1] hover:text-white"}`,
                                                            children: label
                                                        }, val, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 2894,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2879,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InlineError, {
                                                    msg: setupErrors.side
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2903,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 2877,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "border-t border-white/[0.06] pt-6 space-y-5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                            className: "text-xs font-bold uppercase tracking-[0.15em] text-neutral-400",
                                                            children: l.compTitle
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 2907,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "flex cursor-pointer items-center gap-2 text-[11px] text-neutral-500",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "checkbox",
                                                                    checked: setup.unknownEnemyComp,
                                                                    onChange: (e)=>updateSetup("unknownEnemyComp", e.target.checked),
                                                                    className: "h-3.5 w-3.5 rounded border-white/20 bg-white/5 accent-blue-500"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 2911,
                                                                    columnNumber: 23
                                                                }, this),
                                                                l.unknownEnemy
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 2910,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2906,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-4 justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1 min-w-0",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center justify-between mb-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-400",
                                                                            children: l.yourTeam
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 2925,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-[9px] text-neutral-600",
                                                                            children: l.slotsRemaining(5 - setup.teamComp.length)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 2928,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 2924,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex flex-wrap gap-1.5",
                                                                    children: [
                                                                        0,
                                                                        1,
                                                                        2,
                                                                        3,
                                                                        4
                                                                    ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompSlot, {
                                                                            agent: setup.teamComp[i] || "",
                                                                            index: i,
                                                                            locked: i === 0 && setup.teamComp[0] === setup.agent && !!setup.agent,
                                                                            onRemove: ()=>{
                                                                                if (i === 0 && setup.teamComp[0] === setup.agent) return;
                                                                                const c = [
                                                                                    ...setup.teamComp
                                                                                ];
                                                                                c.splice(i, 1);
                                                                                updateSetup("teamComp", c);
                                                                            }
                                                                        }, i, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 2934,
                                                                            columnNumber: 27
                                                                        }, this))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 2932,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InlineError, {
                                                                    msg: setupErrors.teamComp
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 2953,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 2923,
                                                            columnNumber: 21
                                                        }, this),
                                                        !setup.unknownEnemyComp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1 min-w-0",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center justify-between mb-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-[10px] font-bold uppercase tracking-[0.15em] text-red-400",
                                                                            children: l.enemyTeam
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 2958,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-[9px] text-neutral-600",
                                                                            children: l.slotsRemaining(5 - setup.enemyComp.length)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 2961,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 2957,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex flex-wrap gap-1.5",
                                                                    children: [
                                                                        0,
                                                                        1,
                                                                        2,
                                                                        3,
                                                                        4
                                                                    ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompSlot, {
                                                                            agent: setup.enemyComp[i] || "",
                                                                            index: i,
                                                                            onRemove: ()=>{
                                                                                const c = [
                                                                                    ...setup.enemyComp
                                                                                ];
                                                                                c.splice(i, 1);
                                                                                updateSetup("enemyComp", c);
                                                                            }
                                                                        }, i, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 2967,
                                                                            columnNumber: 29
                                                                        }, this))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 2965,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InlineError, {
                                                                    msg: setupErrors.enemyComp
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 2979,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 2956,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2922,
                                                    columnNumber: 19
                                                }, this),
                                                !setup.unknownEnemyComp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-2 justify-center",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setCompTarget("team"),
                                                            className: `rounded-lg px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${compTarget === "team" ? "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/25" : "bg-white/[0.05] text-neutral-500 hover:text-white"}`,
                                                            children: [
                                                                "+ ",
                                                                l.yourTeam
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 2985,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setCompTarget("enemy"),
                                                            className: `rounded-lg px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${compTarget === "enemy" ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/25" : "bg-white/[0.05] text-neutral-500 hover:text-white"}`,
                                                            children: [
                                                                "+ ",
                                                                l.enemyTeam
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 2991,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2984,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-600",
                                                            children: l.agentPool
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 3000,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-4",
                                                            children: Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AGENT_GROUPS"]).map(([group, agents])=>{
                                                                const target = setup.unknownEnemyComp ? "team" : compTarget;
                                                                const currentArr = target === "team" ? setup.teamComp : setup.enemyComp;
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "mb-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-neutral-700",
                                                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AGENT_GROUP_LABELS"][group][lang]
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 3012,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "grid grid-cols-5 gap-1.5 sm:grid-cols-8",
                                                                            children: agents.map((a)=>{
                                                                                const isIn = currentArr.includes(a);
                                                                                const isLocked = target === "team" && a === setup.agent && setup.teamComp[0] === a;
                                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AgentMiniCard, {
                                                                                    name: a,
                                                                                    selected: isIn,
                                                                                    disabled: isIn && !isLocked,
                                                                                    locked: isLocked,
                                                                                    onClick: ()=>{
                                                                                        if (isLocked) return;
                                                                                        handleCompSelect(target === "team" ? "teamComp" : "enemyComp", a);
                                                                                    }
                                                                                }, a, false, {
                                                                                    fileName: "[project]/app/page.tsx",
                                                                                    lineNumber: 3023,
                                                                                    columnNumber: 35
                                                                                }, this);
                                                                            })
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 3015,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, group, true, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 3011,
                                                                    columnNumber: 27
                                                                }, this);
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 3003,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2999,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 2905,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true),
                                setupStep === "confirm" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-lg font-bold text-white",
                                                    children: l.confirmTitle
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3053,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-neutral-500",
                                                    children: l.confirmDesc
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3056,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3052,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} p-4 text-center`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].label,
                                                            children: l.map
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 3060,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "relative h-20 w-full overflow-hidden rounded-xl bg-black/20 mb-2 ring-1 ring-white/[0.06]",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                src: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAP_IMAGES"][setup.map],
                                                                alt: setup.map,
                                                                className: "h-full w-full object-cover opacity-65"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 3062,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 3061,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm font-bold text-white",
                                                            children: setup.map
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 3068,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3059,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} p-4 text-center`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].label,
                                                            children: l.agent
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 3071,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "mx-auto h-14 w-14 overflow-hidden rounded-xl bg-black/20 mb-2 ring-1 ring-white/[0.06]",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                src: (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["agentImgUrl"])(setup.agent),
                                                                alt: setup.agent,
                                                                className: "h-full w-full object-cover"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 3073,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 3072,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm font-bold text-white",
                                                            children: setup.agent
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 3079,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3070,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3058,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} p-4 flex items-center justify-between`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].label + " mb-0",
                                                    children: l.side
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3087,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-bold text-white",
                                                    children: setup.side === "attack" ? l.sideAttack : l.sideDefense
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3088,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3084,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} p-4`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].label,
                                                    children: l.yourTeam
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3093,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-2 mt-2",
                                                    children: setup.teamComp.map((a, i)=>a && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-2 py-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "h-5 w-5 rounded overflow-hidden",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                        src: (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["agentImgUrl"])(a),
                                                                        alt: a,
                                                                        className: "h-full w-full object-cover"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 3103,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 3102,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[11px] text-neutral-300",
                                                                    children: a
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 3109,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, i, true, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 3098,
                                                            columnNumber: 27
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3094,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3092,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3051,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3 pt-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: nextStep,
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnPrimary,
                                            children: setupStep === "confirm" ? l.startMatch : l.next
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3120,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: prevStep,
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnSecondary,
                                            children: l.back
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3123,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3119,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 2800,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 2776,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 2773,
            columnNumber: 7
        }, this);
    }
    /* ROUND */ if (screen === "round") {
        function validateRound() {
            const e = {};
            if (!survived) {
                if (!roundForm.deathLocation) e.deathLocation = l.required;
                if (!roundForm.enemyCount) e.enemyCount = l.required;
            }
            if (!roundForm.yourNote.trim()) e.yourNote = l.required;
            else if (roundForm.yourNote.trim().length < 3) e.yourNote = l.noteTooShort;
            return e;
        }
        async function handleSubmitRound(result) {
            const e = validateRound();
            setRoundErrors(e);
            if (Object.keys(e).length > 0) return;
            if (isSubmitting || submitLockRef.current) return;
            submitLockRef.current = true;
            setIsSubmitting(true);
            setFeedbackLoading(true);
            const prev = rounds.slice(0, roundIdx);
            const fallbackFb = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$generators$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genRoundFeedback"])(setup, roundForm, result, prev, lang ?? "tr", survived);
            let fb;
            try {
                const authHeaders = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAuthHeaders"])();
                const res = await fetch("/api/ai/feedback", {
                    method: "POST",
                    headers: authHeaders,
                    body: JSON.stringify({
                        setup,
                        form: roundForm,
                        result,
                        allRounds: prev,
                        lang: lang ?? "tr",
                        survived
                    })
                });
                if (res.ok) {
                    const json = await res.json();
                    fb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidFeedback"])(json) ? json : fallbackFb();
                } else {
                    fb = fallbackFb();
                }
            } catch  {
                fb = fallbackFb();
            } finally{
                setFeedbackLoading(false);
                setIsSubmitting(false);
                submitLockRef.current = false;
            }
            const rd = {
                roundNumber: roundNum,
                deathLocation: survived ? "" : roundForm.deathLocation,
                enemyCount: survived ? "" : roundForm.enemyCount,
                yourNote: roundForm.yourNote,
                result,
                skipped: false,
                survived,
                feedback: fb
            };
            saveRoundData(rd);
            setCurrentFeedback(fb);
            setCurrentResult(result);
            setRoundMode("feedback");
        }
        function handleSkipConfirm(result) {
            const rd = {
                roundNumber: roundNum,
                deathLocation: "",
                enemyCount: "",
                yourNote: "",
                result,
                skipped: true,
                survived: false,
                feedback: null
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
            // Don't force a result — just save the round data and let score screen determine outcome
            goToScoreInput();
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].pageBg} relative`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapBg, {
                    map: setup.map
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 3239,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Navbar, {
                    ...navProps
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 3240,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative z-10 mx-auto max-w-lg px-4 pt-20 pb-12 space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center space-y-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-2xl font-bold text-white",
                                    children: l.roundTitle(roundNum)
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3243,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-neutral-500",
                                    children: [
                                        setup.map,
                                        " ",
                                        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].dot,
                                        " ",
                                        setup.agent,
                                        " ",
                                        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].dot,
                                        " ",
                                        setup.side === "attack" ? l.sideAttack : l.sideDefense
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3246,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 3242,
                            columnNumber: 11
                        }, this),
                        (rounds.length > 0 || roundIdx > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-1.5 justify-center",
                            children: [
                                rounds.map((r, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>loadRoundAtIndex(i),
                                        className: `rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition border ${i === roundIdx ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-[#050810]" : ""} ${r.result === "win" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-red-500/10 text-red-400 border-red-500/10"} ${r.skipped ? "opacity-40" : ""}`,
                                        children: [
                                            "R",
                                            r.roundNumber,
                                            " ",
                                            r.result === "win" ? l.wonLabel : l.lostLabel,
                                            r.skipped ? l.skippedLabel : ""
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 3254,
                                        columnNumber: 17
                                    }, this)),
                                roundIdx >= rounds.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "rounded-lg bg-blue-500/10 border border-blue-500/20 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 ring-2 ring-blue-500 ring-offset-1 ring-offset-[#050810]",
                                    children: [
                                        "R",
                                        roundNum
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3265,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 3252,
                            columnNumber: 13
                        }, this),
                        roundMode === "input" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].cardInner} space-y-5`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        setSurvived(!survived);
                                        if (!survived) setRoundForm((f)=>({
                                                ...f,
                                                deathLocation: "",
                                                enemyCount: ""
                                            }));
                                    },
                                    className: `w-full rounded-xl border-2 py-4 text-base font-extrabold uppercase tracking-wider transition-all duration-200 ${survived ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/15" : "border-white/[0.08] bg-[#070c16] text-neutral-500 hover:border-emerald-500/25 hover:text-emerald-400 hover:bg-emerald-500/[0.04]"}`,
                                    children: [
                                        survived ? __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].check + " " : "",
                                        l.survived
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3273,
                                    columnNumber: 15
                                }, this),
                                !survived && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Label, {
                                                    text: l.deathLocation
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3291,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: roundForm.deathLocation,
                                                    onChange: (e)=>updateRound("deathLocation", e.target.value),
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].selectBase,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            disabled: true,
                                                            className: "bg-[#050810]",
                                                            children: l.deathLocationPh
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 3299,
                                                            columnNumber: 23
                                                        }, this),
                                                        locations.map((loc)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: loc,
                                                                className: "bg-[#050810]",
                                                                children: loc
                                                            }, loc, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 3303,
                                                                columnNumber: 25
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3292,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InlineError, {
                                                    msg: roundErrors.deathLocation
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3308,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3290,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Label, {
                                                    text: l.enemyCount
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3311,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: roundForm.enemyCount,
                                                    onChange: (e)=>updateRound("enemyCount", e.target.value),
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].selectBase,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            disabled: true,
                                                            className: "bg-[#050810]",
                                                            children: l.enemyCountPh
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 3319,
                                                            columnNumber: 23
                                                        }, this),
                                                        [
                                                            1,
                                                            2,
                                                            3,
                                                            4,
                                                            5
                                                        ].map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: String(n),
                                                                className: "bg-[#050810]",
                                                                children: n
                                                            }, n, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 3323,
                                                                columnNumber: 25
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3312,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InlineError, {
                                                    msg: roundErrors.enemyCount
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3332,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3310,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Label, {
                                            text: l.yourNote
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3337,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            value: roundForm.yourNote,
                                            onChange: (e)=>updateRound("yourNote", e.target.value),
                                            placeholder: survived ? lang === "tr" ? "ör. lurk oynadım, info verdim\u2026" : "e.g. lurked, gave info\u2026" : l.yourNotePh,
                                            rows: 3,
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].inputBase + " resize-none"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3338,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InlineError, {
                                            msg: roundErrors.yourNote
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3351,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3336,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Label, {
                                            text: l.roundResult
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3354,
                                            columnNumber: 17
                                        }, this),
                                        feedbackLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-center gap-3 py-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3357,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm text-neutral-400",
                                                    children: lang === "tr" ? "AI analiz ediyor..." : "AI analyzing..."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3358,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3356,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleSubmitRound("win"),
                                                    disabled: isSubmitting,
                                                    className: "flex-1 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] py-3.5 text-sm font-bold text-emerald-400 transition-all hover:bg-emerald-500/[0.1] active:scale-[0.98] disabled:opacity-40",
                                                    children: l.roundResultWin
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3366,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleSubmitRound("loss"),
                                                    disabled: isSubmitting,
                                                    className: "flex-1 rounded-xl border border-red-500/20 bg-red-500/[0.06] py-3.5 text-sm font-bold text-red-400 transition-all hover:bg-red-500/[0.1] active:scale-[0.98] disabled:opacity-40",
                                                    children: l.roundResultLoss
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3373,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3365,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3353,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3 pt-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setRoundMode("skipConfirm"),
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnSecondary,
                                            children: l.skipRound
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3384,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleBack,
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnSecondary,
                                                    children: l.back
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3391,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleFinishFromInput,
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnAccent,
                                                    children: l.finishMatch
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3394,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3390,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3383,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 3272,
                            columnNumber: 13
                        }, this),
                        roundMode === "skipConfirm" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} p-6 sm:p-8 space-y-5 text-center`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-bold text-white",
                                    children: l.skipConfirmTitle
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3406,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleSkipConfirm("win"),
                                            className: "flex-1 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] py-3.5 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/[0.1]",
                                            children: l.yes
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3410,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleSkipConfirm("loss"),
                                            className: "flex-1 rounded-xl border border-red-500/20 bg-red-500/[0.06] py-3.5 text-sm font-bold text-red-400 transition hover:bg-red-500/[0.1]",
                                            children: l.no
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3416,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3409,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setRoundMode("input"),
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnSecondary,
                                    children: l.back
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3423,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 3405,
                            columnNumber: 13
                        }, this),
                        roundMode === "feedback" && currentFeedback && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].cardInner}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mb-5 flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-xs font-bold uppercase tracking-[0.15em] text-blue-400",
                                                    children: l.feedbackTitle
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3435,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        survived && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "rounded-md bg-emerald-500/10 border border-emerald-400/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400",
                                                            children: l.survivedShort
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 3440,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase border ${currentResult === "win" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-red-500/10 text-red-400 border-red-500/10"}`,
                                                            children: currentResult === "win" ? l.roundResultWin : l.roundResultLoss
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 3444,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3438,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3434,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FeedbackCard, {
                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].cross,
                                                    color: "text-red-400",
                                                    label: l.mainMistake,
                                                    text: currentFeedback.mainMistake
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3454,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FeedbackCard, {
                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].circle,
                                                    color: "text-amber-400",
                                                    label: l.enemyHabit,
                                                    text: currentFeedback.enemyHabit
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3460,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FeedbackCard, {
                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].bolt,
                                                    color: "text-cyan-400",
                                                    label: l.microPlan,
                                                    text: currentFeedback.microPlan
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3466,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3453,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3433,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleNextRound,
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnPrimary,
                                            children: l.nextRound
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3475,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleBack,
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnSecondary,
                                                    children: l.back
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3479,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleFinishFromFeedback,
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnAccent,
                                                    children: l.finishMatch
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3482,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3478,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3474,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 3432,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 3241,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 3238,
            columnNumber: 7
        }, this);
    }
    /* SCORE INPUT */ if (screen === "scoreInput") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].pageBg} relative flex items-center justify-center px-4`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapBg, {
                map: setup.map
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 3502,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 w-full max-w-md space-y-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center space-y-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloLogo, {
                                size: 36,
                                className: "mx-auto opacity-40 mb-2"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 3505,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-xl font-bold text-white",
                                children: l.scoreTitle
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 3506,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 3504,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} ${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].cardInner} space-y-5`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Label, {
                                text: l.selectScore
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 3509,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto pr-1",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCORE_OPTIONS"].map((s)=>{
                                    const [y, e] = s.split(" - ");
                                    const isWin = Number(y) > Number(e);
                                    const sel = matchScore.yours === y && matchScore.enemy === e;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setMatchScore({
                                                yours: y,
                                                enemy: e
                                            }),
                                        className: `rounded-xl border py-3 text-sm font-bold transition-all duration-200 ${sel ? "border-blue-500/50 bg-blue-500/10 text-white ring-1 ring-blue-500/30 shadow-lg" : isWin ? "border-emerald-500/10 bg-emerald-500/[0.04] text-emerald-400 hover:bg-emerald-500/[0.07]" : "border-red-500/10 bg-red-500/[0.04] text-red-400 hover:bg-red-500/[0.07]"}`,
                                        children: s
                                    }, s, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 3516,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 3510,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3 pt-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            if (matchScore.yours && matchScore.enemy) finishWithScore(matchScore.yours, matchScore.enemy);
                                        },
                                        disabled: !matchScore.yours || !matchScore.enemy || reportLoading,
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnPrimary,
                                        children: reportLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "flex items-center justify-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3539,
                                                    columnNumber: 21
                                                }, this),
                                                lang === "tr" ? "Oluşturuluyor..." : "Generating..."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3538,
                                            columnNumber: 19
                                        }, this) : l.confirmScore
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 3527,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setScreen("round"),
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnSecondary,
                                        children: l.back
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 3546,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 3526,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 3508,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 3503,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 3499,
        columnNumber: 7
    }, this);
    /* REPORT */ if (screen === "report" && (reportLoading || !report)) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].pageBg} relative`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapBg, {
                map: setup.map
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 3561,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Navbar, {
                ...navProps
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 3562,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 mx-auto max-w-lg px-4 pt-40 flex flex-col items-center gap-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AimloLogo, {
                        size: 48,
                        className: "animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 3564,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 3565,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-neutral-400",
                        children: lang === "tr" ? "AI rapor oluşturuyor..." : "AI generating report..."
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 3566,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 3563,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 3560,
        columnNumber: 7
    }, this);
    if (screen === "report" && report) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].pageBg} relative`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapBg, {
                map: setup.map
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 3577,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Navbar, {
                ...navProps
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 3578,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 mx-auto max-w-lg px-4 pt-20 pb-12 space-y-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center space-y-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-2xl font-bold text-white",
                                children: l.reportTitle
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 3581,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-neutral-500",
                                children: [
                                    setup.map,
                                    " ",
                                    __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].dot,
                                    " ",
                                    setup.agent
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 3582,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 3580,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].card} overflow-hidden`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "pointer-events-none absolute inset-0 opacity-[0.12]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAP_IMAGES"][setup.map],
                                        alt: "",
                                        className: "h-full w-full object-cover"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 3589,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3588,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3595,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative flex items-end justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].label,
                                                    children: l.matchResult
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3598,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-1 text-4xl font-extrabold tracking-tight text-white",
                                                    children: report.scoreStr
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3599,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: `mt-1.5 text-xs font-bold uppercase ${report.matchWon ? "text-emerald-400" : "text-red-400"}`,
                                                    children: report.matchWon ? l.victory : l.defeat
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3602,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3597,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-right",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-lg font-extrabold text-blue-400",
                                                children: [
                                                    report.winPct,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 3609,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3608,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3596,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500",
                                        style: {
                                            width: `${report.winPct}%`
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 3615,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3614,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative mt-3 grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wider",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-neutral-500",
                                                    children: l.enteredRounds
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3622,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3623,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-white text-sm",
                                                    children: report.total
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3624,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3621,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-neutral-500",
                                                    children: l.roundsWon
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3627,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3628,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-emerald-400 text-sm",
                                                    children: report.won
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3629,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3626,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-neutral-500",
                                                    children: l.roundsLost
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3632,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3633,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-red-400 text-sm",
                                                    children: report.lost
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3634,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3631,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-neutral-500",
                                                    children: l.roundsSkipped
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3637,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3638,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-neutral-400 text-sm",
                                                    children: report.skipped
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 3639,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 3636,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 3620,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 3587,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 3586,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-1.5 justify-center",
                        children: rounds.map((r, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `rounded-lg px-2 py-1 text-[10px] font-bold uppercase border ${r.result === "win" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-red-500/10 text-red-400 border-red-500/10"} ${r.skipped ? "opacity-40" : ""}`,
                                children: [
                                    "R",
                                    r.roundNumber,
                                    " ",
                                    r.result === "win" ? l.wonLabel : l.lostLabel,
                                    r.skipped ? l.skippedLabel : ""
                                ]
                            }, i, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 3648,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 3646,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ReportCard, {
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].diamond,
                                color: "text-cyan-400",
                                label: l.overallSummary,
                                text: report.summary
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 3658,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ReportCard, {
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].cross,
                                color: "text-red-400",
                                label: l.mainRecurringMistake,
                                text: report.mistake
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 3664,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ReportCard, {
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].circle,
                                color: "text-amber-400",
                                label: l.enemyTendencies,
                                text: report.tendencies
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 3670,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ReportCard, {
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$game$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IC"].play,
                                color: "text-emerald-400",
                                label: l.suggestedAdjustment,
                                text: report.adjustment
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 3676,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 3657,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: resetForNewMatch,
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnPrimary,
                                children: l.newMatch
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 3684,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setScreen("dashboard");
                                    loadHistory();
                                },
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnSecondary,
                                children: l.returnToMenu
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 3687,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 3683,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 3579,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 3576,
        columnNumber: 7
    }, this);
    // Fallback — should never reach here, redirect to landing
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].pageBg} flex items-center justify-center`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center space-y-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-neutral-500 text-sm",
                    children: lang === "tr" ? "Sayfa bulunamadı" : "Page not found"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 3704,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setScreen("landing"),
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$design$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ds"].btnPrimary + " max-w-xs mx-auto",
                    children: lang === "tr" ? "Ana Sayfaya Dön" : "Go to Home"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 3707,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 3703,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 3702,
        columnNumber: 5
    }, this);
}
_s2(Home, "/6SgB59sPOWs5fimf87VWD+iqAc=");
_c15 = Home;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11, _c12, _c13, _c14, _c15;
__turbopack_context__.k.register(_c, "AimloLogo");
__turbopack_context__.k.register(_c1, "AimloWordmark");
__turbopack_context__.k.register(_c2, "Label");
__turbopack_context__.k.register(_c3, "InlineError");
__turbopack_context__.k.register(_c4, "AmbientBg");
__turbopack_context__.k.register(_c5, "MapBg");
__turbopack_context__.k.register(_c6, "FeatureIcon");
__turbopack_context__.k.register(_c7, "Navbar");
__turbopack_context__.k.register(_c8, "ReportCard");
__turbopack_context__.k.register(_c9, "FeedbackCard");
__turbopack_context__.k.register(_c10, "AgentMiniCard");
__turbopack_context__.k.register(_c11, "CompSlot");
__turbopack_context__.k.register(_c12, "StatCard");
__turbopack_context__.k.register(_c13, "LandingPage");
__turbopack_context__.k.register(_c14, "AuthScreen");
__turbopack_context__.k.register(_c15, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0sbt6f.._.js.map