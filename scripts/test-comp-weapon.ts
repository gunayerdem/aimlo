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
eq("bulldog artık rifle (crosshair-loss açık)", classifyDeath({ healthAtDeath: 100, killerInfo: "with bulldog", side: "attack" }), "crosshair-loss");
eq("op-angle korunur", classifyDeath({ killerInfo: "killed by chamber with operator", side: "defense" }), "op-angle");
eq("awp kısaltması korunur", classifyDeath({ killerInfo: "awp", side: "defense" }), "op-angle");

console.log(fail === 0 ? "\nTÜM TESTLER GEÇTİ ✓" : `\n${fail} TEST BAŞARISIZ ✗`);
process.exit(fail === 0 ? 0 : 1);
