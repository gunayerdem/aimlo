/**
 * AIMLO AI Improvement Plan System
 *
 * Generates personalized, actionable coaching plans.
 * NOT motivation — REAL coaching.
 */

export interface ImprovementPlan {
  // Daily focus (1 main thing)
  dailyFocus: {
    title: string;
    description: string;
    priority: "critical" | "high" | "medium";
  };

  // Specific tasks (3-5 items)
  tasks: Array<{
    id: string;
    task: string;
    reason: string;
    category: "positioning" | "decision" | "mechanics" | "mental";
    completed: boolean;
  }>;

  // What improved since last check
  improvements: string[];

  // What's still a problem
  ongoingIssues: string[];
}

interface MatchInput {
  won: boolean;
  map?: string;
  agent?: string;
  rounds: Array<{
    deathLocation?: string;
    survived?: boolean;
    skipped?: boolean;
    result?: string;
    enemyCount?: string;
    yourNote?: string;
  }>;
}

interface DetectedProblem {
  issue: string;
  severity: number;
  category: "positioning" | "decision" | "mechanics" | "mental";
}

export function generateImprovementPlan(
  matches: MatchInput[],
  previousPlan?: ImprovementPlan | null
): ImprovementPlan {
  if (matches.length < 2) return getDefaultPlan();

  const allRounds = matches.flatMap((m) =>
    m.rounds.filter((r) => !r.skipped)
  );

  // Guard: if no non-skipped rounds exist, return default plan
  if (allRounds.length === 0) return getDefaultPlan();

  // Detect problems
  const problems: DetectedProblem[] = [];

  // 1. Repeated death locations
  const deathLocs: Record<string, number> = {};
  allRounds
    .filter((r) => !r.survived && r.deathLocation)
    .forEach((r) => {
      deathLocs[r.deathLocation!] = (deathLocs[r.deathLocation!] || 0) + 1;
    });

  Object.entries(deathLocs)
    .filter(([, c]) => c >= 3)
    .forEach(([loc, count]) => {
      problems.push({
        // "utility kullan" KALDIRILDI (dil denetimi 2026-07-25): ai-policy BANNED_PHRASES
        // listesinde generik kalıp. Somut karşı-hamleyle değiştirildi.
        issue: `${loc}'de ${count} kez öldün — o açıyı bir round tamamen boş bırak ya da smoke'unu o hatta at`,
        severity: count,
        category: "positioning",
      });
    });

  // 2. Low survival rate
  const survivalRate =
    allRounds.filter((r) => r.survived).length / allRounds.length;
  if (survivalRate < 0.35) {
    problems.push({
      issue: `Hayatta kalma oranın çok düşük (${Math.round(survivalRate * 100)}%) — gereksiz ölümlerden kaçın`,
      severity: 8,
      category: "decision",
    });
  }

  // 3. Dying to many enemies (isolated)
  const isolatedDeaths = allRounds.filter(
    (r) => !r.survived && r.enemyCount && Number(r.enemyCount) >= 3
  ).length;
  if (isolatedDeaths >= 3) {
    problems.push({
      issue: `${isolatedDeaths} kez 3+ düşmana karşı izole öldün — takımla beraber oyna`,
      severity: isolatedDeaths,
      category: "positioning",
    });
  }

  // 4. Weak map
  const mapStats: Record<string, { w: number; l: number }> = {};
  matches.forEach((m) => {
    if (!m.map) return;
    if (!mapStats[m.map]) mapStats[m.map] = { w: 0, l: 0 };
    if (m.won) mapStats[m.map].w++;
    else mapStats[m.map].l++;
  });
  Object.entries(mapStats)
    .filter(([, s]) => s.w + s.l >= 2 && s.w / (s.w + s.l) < 0.3)
    .forEach(([map, s]) => {
      problems.push({
        issue: `${map}'te winrate ${Math.round((s.w / (s.w + s.l)) * 100)}% — bu haritada strateji değiştir`,
        severity: 6,
        category: "decision",
      });
    });

  // Sort by severity
  problems.sort((a, b) => b.severity - a.severity);

  // Build location context for more specific plans
  const topDeathSpots = Object.entries(deathLocs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([loc]) => loc);

  // Generate daily focus
  const topProblem = problems[0];
  const dailyFocus: ImprovementPlan["dailyFocus"] = topProblem
    ? {
        title:
          topProblem.category === "positioning"
            ? topDeathSpots.length > 0
              ? `Pozisyon Değişikliği: ${topDeathSpots[0]}`
              : "Pozisyon Değişikliği"
            : topProblem.category === "decision"
              ? "Karar Verme"
              : "Mekanik Geliştirme",
        description: topProblem.issue,
        priority:
          topProblem.severity >= 7
            ? "critical"
            : topProblem.severity >= 4
              ? "high"
              : "medium",
      }
    : {
        title: "Devam Et",
        description: "Belirgin problem yok — mevcut performansı koru",
        priority: "medium",
      };

  // Generate tasks
  const tasks: ImprovementPlan["tasks"] = problems
    .slice(0, 4)
    .map((p, i) => ({
      id: `task_${i}`,
      task: p.issue,
      reason: p.severity >= 5 ? `Bu pattern ${p.severity} kez tespit edildi (yüksek güven)` : p.severity >= 3 ? `Bu pattern ${p.severity} kez tespit edildi` : `Bu pattern ${p.severity} kez görüldü (sınırlı veri)`,
      category: p.category,
      completed: false,
    }));

  // Add data-driven filler tasks if fewer than 3
  if (tasks.length < 3) {
    if (survivalRate < 0.4) {
      tasks.push({
        id: "task_practice",
        task: "Öldüğün pozisyonlara alternatif açılar dene — custom game'de pratik yap",
        reason: `Hayatta kalma oranın %${Math.round(survivalRate * 100)} — farklı açılar hayatta kalmayı artırır`,
        category: "positioning",
        completed: false,
      });
    } else if (Object.entries(deathLocs).some(([, c]) => c >= 2)) {
      const topSpot = Object.entries(deathLocs).sort(([, a], [, b]) => b - a)[0];
      tasks.push({
        id: "task_practice",
        task: `${topSpot[0]} pozisyonunda utility kullanarak giriş pratiği yap`,
        reason: `Bu pozisyonda ${topSpot[1]} kez öldün — utility ile açmayı dene`,
        category: "positioning",
        completed: false,
      });
    } else if (isolatedDeaths >= 1) {
      tasks.push({
        id: "task_practice",
        task: "Takım arkadaşınla trade pozisyonu kur — birlikte peek at",
        reason: "İzole ölümlerin var — trade setup ile risk azalır",
        category: "decision",
        completed: false,
      });
    } else {
      tasks.push({
        id: "task_practice",
        task: "Farklı pozisyonlardan oynamayı dene — pozisyon çeşitliliğini artır",
        reason: "Öngörü zorluğun artar, düşman seni okuyamaz",
        category: "positioning",
        completed: false,
      });
    }
  }

  // Check improvements from previous plan
  const improvements: string[] = [];
  const ongoingIssues: string[] = [];

  if (previousPlan) {
    previousPlan.tasks.forEach((oldTask) => {
      const taskKey = oldTask.task.split("'")[0];
      const stillExists = problems.some((p) => p.issue.includes(taskKey));
      const taskLabel = oldTask.task.split("—")[0].trim();
      if (!stillExists) {
        improvements.push(`${taskLabel} — iyileşti`);
      } else {
        ongoingIssues.push(`${taskLabel} — devam ediyor`);
      }
    });
  }

  return { dailyFocus, tasks, improvements, ongoingIssues };
}

function getDefaultPlan(): ImprovementPlan {
  return {
    dailyFocus: {
      title: "Başla",
      description: "Birkaç maç oyna, AI seni analiz etsin",
      priority: "medium",
    },
    tasks: [
      {
        id: "t1",
        task: "İlk 3 maçını tamamla",
        reason: "AI pattern tespiti için veri gerekiyor",
        category: "decision",
        completed: false,
      },
    ],
    improvements: [],
    ongoingIssues: [],
  };
}
