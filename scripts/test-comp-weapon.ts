// comp-weapon + classifyDeath saf-fonksiyon regresyon testleri.
// RUN: npx tsx scripts/test-comp-weapon.ts  (exit 1 = kırık)
import { extractKillerWeapon, classifyCompArchetype, buildWeaponCompDirective } from "../lib/comp-weapon";
import { classifyDeath } from "../lib/death-type";

let fail = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) console.log(`  ok  ${name}`);
  else { fail++; console.log(`  FAIL ${name}: got=${g} want=${w}`); }
};

// extractKillerWeapon
eq("with vandal", extractKillerWeapon("killed by jett with vandal")?.name, "vandal");
eq("with the operator", extractKillerWeapon("killed by chamber with the operator")?.cls, "sniper");
eq("bare weapon (OCR drop)", extractKillerWeapon("by reyna sheriff")?.name, "sheriff");
eq("bandit tanınır", extractKillerWeapon("killed by iso with bandit")?.cls, "pistol");
eq("outlaw sniper", extractKillerWeapon("with outlaw")?.cls, "sniper");
eq("silahsız → null", extractKillerWeapon("killed by jett"), null);
eq("boş → null", extractKillerWeapon(undefined), null);
eq("serbest metin silah sayılmaz", extractKillerWeapon("killed by jett with knife"), null);

// classifyCompArchetype
eq("double duelist", classifyCompArchetype(["Jett", "Reyna", "Omen", "Sova", "Sage"]), "double-duelist-dive");
eq("op-comp (jett + 2 sentinel)", classifyCompArchetype(["Jett", "Chamber", "Killjoy", "Omen", "Sova"]), "op-comp");
eq("double sentinel", classifyCompArchetype(["Phoenix", "Cypher", "Killjoy", "Omen", "Sova"]), "double-sentinel-kale");
eq("no controller", classifyCompArchetype(["Phoenix", "Jett", "Sova", "Sage", "Breach"]), "double-duelist-dive");
eq("kontrolörsüz rush", classifyCompArchetype(["Phoenix", "Sova", "Sage", "Breach", "Cypher"]), "double-initiator-util");
eq("standart 1-1-1-1-1", classifyCompArchetype(["Jett", "Omen", "Sova", "Cypher", "Phoenix"]), "double-duelist-dive");
eq("gerçek standart", classifyCompArchetype(["Jett", "Omen", "Sova", "Cypher", "Miks"]), "double-controller");
eq("eksik roster → null", classifyCompArchetype(["Jett", "Omen"]), null);
eq("boş → null", classifyCompArchetype(undefined), null);
eq("KAY/O slug toleransı", classifyCompArchetype(["KAYO", "kay/o", "Jett", "Omen", "Sage"]), "double-initiator-util");
eq("sıra bağımsızlığı", classifyCompArchetype(["Sage", "Omen", "Jett", "Reyna", "Sova"]), classifyCompArchetype(["Jett", "Reyna", "Omen", "Sova", "Sage"]));

// buildWeaponCompDirective
eq("sinyal yok → boş", buildWeaponCompDirective(null, null), "");
eq("standart komp → boş", buildWeaponCompDirective(null, "standart"), "");
const d = buildWeaponCompDirective({ name: "operator", cls: "sniper" }, "op-comp", "spectre");
eq("direktif silah içerir", d.includes("operator"), true);
eq("direktif loadout içerir", d.includes("spectre"), true);
eq("direktif arketip içerir", d.includes("op-comp"), true);

// classifyDeath — yeni dallar
eq("pistol-round", classifyDeath({ economyType: "pistol", side: "attack" }), "pistol-round");
eq("eco kendi-ekonomi", classifyDeath({ economyType: "eco", side: "attack" }), "eco-force-loss");
eq("half_buy spectre artık eco DEĞİL (def→def-wide-hold)", classifyDeath({ economyType: "half_buy", killerInfo: "with spectre", side: "defense" }), "def-wide-hold");
eq("alive 0/0 güvenilmez → clutch DEĞİL", classifyDeath({ alliesAlive: 0, enemiesAlive: 0, side: "attack" }), "info-less-push");
eq("alive 0/2 güvenilir → clutch", classifyDeath({ alliesAlive: 0, enemiesAlive: 2, side: "attack" }), "clutch-lost");
eq("judge artık eco-silah (crosshair-loss'u bloklar)", classifyDeath({ healthAtDeath: 100, killerInfo: "with judge", side: "attack" }), "info-less-push");
// denetim fix 2026-07-19: crosshair-loss kapısı hp>=100 yerine full_buy — healthAtDeath artık okunmuyor
eq("bulldog artık rifle (crosshair-loss açık)", classifyDeath({ economyType: "full_buy", killerInfo: "with bulldog", side: "attack" }), "crosshair-loss");
eq("op-angle korunur", classifyDeath({ killerInfo: "killed by chamber with operator", side: "defense" }), "op-angle");
eq("awp kısaltması korunur", classifyDeath({ killerInfo: "awp", side: "defense" }), "op-angle");

// classifyDeath — dalga-5 yeni tipler/dallar (KB wiring 2026-07-19): pozitif vakalar
eq("retake-advantage-thrown (def+spike+aa>ea)", classifyDeath({ spikePlanted: true, side: "defense", alliesAlive: 3, enemiesAlive: 1 }), "retake-advantage-thrown");
eq("op-loss (kendi loadout Operator)", classifyDeath({ loadout: "operator", side: "attack" }), "op-loss");
eq("op-loss awp kısaltması (loadout OCR)", classifyDeath({ loadout: "awp", side: "attack" }), "op-loss");
// 🔴 SÖZLEŞME DEĞİŞTİ (canlı-test #7, softi 2026-07-31): ult-in-pocket dersi artık
// KENDİNE-DÖNÜK dövüş ult'u olan ajanlarda VERİLMİYOR. Jett bıçağını, Reyna
// İmparatoriçe'sini doğru anı bekleyerek tutmak NORMAL oyun davranışı; softi canlı
// maçta 6 round'un 3'ünde bu dersi alıp "reyna jett gibi karakterlere gelmemeli,
// sürekli geliyor" dedi. Ders takım-etkili ult'larda (Sova/Brim/Killjoy/Sage) KALIR —
// orada cepte çürüyen ult gerçek kayıptır. Bu test o ayrımı kilitler.
eq("ult-in-pocket ATLANIR (Jett — kendine-dönük dövüş ult'u)", classifyDeath({ ultReady: true, playerAgent: "Jett", side: "attack" }), "info-less-push");
eq("ult-in-pocket ATLANIR (Reyna)", classifyDeath({ ultReady: true, playerAgent: "Reyna", side: "attack" }), "info-less-push");
eq("ult-in-pocket KALIR (Sova — takım-etkili ult)", classifyDeath({ ultReady: true, playerAgent: "Sova", side: "attack" }), "ult-in-pocket");
eq("ult-in-pocket KALIR (ajan bilinmiyorsa muhafazakâr)", classifyDeath({ ultReady: true, side: "attack" }), "ult-in-pocket");
eq("numbers-down-carry (aa<ea-1 + late)", classifyDeath({ alliesAlive: 1, enemiesAlive: 3, deathTiming: "late", side: "attack" }), "numbers-down-carry");
eq("late-no-plant (atk+late+spike AÇIK false)", classifyDeath({ side: "attack", deathTiming: "late", spikePlanted: false }), "late-no-plant");
eq("late-def-no-plant (def+late+spike AÇIK false)", classifyDeath({ side: "defense", deathTiming: "late", spikePlanted: false }), "late-def-no-plant");
eq("full-buy-first-contact (full_buy+atk+early)", classifyDeath({ economyType: "full_buy", side: "attack", deathTiming: "early" }), "full-buy-first-contact");
eq("def-no-crossfire (def+trade'lenmedi)", classifyDeath({ side: "defense", tradedByAlly: false }), "def-no-crossfire");
eq("loss-streak (3+ kayıp serisi)", classifyDeath({ lossStreak: true, side: "attack" }), "loss-streak");
eq("win-streak-comfort (3+ kazanç serisi)", classifyDeath({ winStreak: true, side: "defense" }), "win-streak-comfort");
eq("overtime-matchpoint (skor 12 → highStakes)", classifyDeath({ highStakes: true, side: "attack" }), "overtime-matchpoint");

// classifyDeath — dalga-5 kritik öncelik-çakışma vakaları
eq("op-loss > ult-in-pocket (Operator + dolu ult)", classifyDeath({ loadout: "operator", ultReady: true, playerAgent: "Jett", side: "attack" }), "op-loss");
eq("spike > op-loss (post-plant Operator'lı)", classifyDeath({ spikePlanted: true, side: "attack", loadout: "operator" }), "post-plant-solo");
eq("retake aa==ea eşitlik avantaj DEĞİL → retake-no-util", classifyDeath({ spikePlanted: true, side: "defense", alliesAlive: 2, enemiesAlive: 2 }), "retake-no-util");
eq("retake alive 0/0 güvenilmez → retake-no-util", classifyDeath({ spikePlanted: true, side: "defense", alliesAlive: 0, enemiesAlive: 0 }), "retake-no-util");
eq("late+plant-yok+atk > entry-no-trade", classifyDeath({ side: "attack", deathTiming: "late", spikePlanted: false, tradedByAlly: false }), "late-no-plant");
eq("spike sinyali YOKKEN late-no-plant DEĞİL (undefined ≠ false)", classifyDeath({ side: "attack", deathTiming: "late", tradedByAlly: false }), "entry-no-trade");
eq("Clove + ultReady → ult-in-pocket ATLANIR", classifyDeath({ ultReady: true, playerAgent: "Clove", side: "attack" }), "info-less-push");
eq("aa+1==ea eşit sayı → numbers-down-carry DEĞİL", classifyDeath({ alliesAlive: 2, enemiesAlive: 3, deathTiming: "late", side: "attack", spikePlanted: false }), "late-no-plant");
eq("aa<ea-1 ama late DEĞİL → numbers-down-carry DEĞİL", classifyDeath({ alliesAlive: 1, enemiesAlive: 3, deathTiming: "early", side: "attack" }), "timing-window");
eq("full-buy-first-contact > timing-window (eco sinyali önce)", classifyDeath({ economyType: "full_buy", side: "attack", deathTiming: "early", tradedByAlly: true }), "full-buy-first-contact");
eq("overtime > loss-streak (highStakes öncelikli)", classifyDeath({ highStakes: true, lossStreak: true, side: "attack" }), "overtime-matchpoint");
eq("def-no-crossfire > over-peek (spesifik dal önce)", classifyDeath({ side: "defense", tradedByAlly: false, alliesAlive: 3, enemiesAlive: 2 }), "def-no-crossfire");
eq("over-peek katman fix: sinyalsiz aa>=ea hâlâ yakalanır", classifyDeath({ alliesAlive: 2, enemiesAlive: 2, side: "attack" }), "over-peek-advantage");

console.log(fail === 0 ? "\nTÜM TESTLER GEÇTİ ✓" : `\n${fail} TEST BAŞARISIZ ✗`);
process.exit(fail === 0 ? 0 : 1);
