export type Lang = "tr" | "en";
export type Screen =
  | "landing"
  | "lang"
  | "dashboard"
  | "setup"
  | "round"
  | "scoreInput"
  | "report"
  | "history"
  | "reportDetail"
  | "_setup_disabled"
  | "_round_disabled"
  | "_scoreInput_disabled";
export type RoundResult = "win" | "loss";
export type SetupStep = "mapAgent" | "sideComp" | "confirm";
export type SetupData = {
  map: string;
  agent: string;
  side: string;
  teamComp: string[];
  enemyComp: string[];
  unknownEnemyComp: boolean;
};
export type RoundFeedback = {
  deathAnalysis: string;
  enemyPatterns: string[];
  nextRoundPlan: string;
};
export type RoundData = {
  roundNumber: number;
  deathLocation: string;
  enemyCount: string;
  yourNote: string;
  result: RoundResult;
  skipped: boolean;
  survived: boolean;
  feedback: RoundFeedback | null;
};
export type RoundForm = {
  deathLocation: string;
  enemyCount: string;
  yourNote: string;
};
export type FormErrors = Record<string, string>;
export type RoundScreenMode = "input" | "skipConfirm" | "feedback";
export type MatchScore = { yours: string; enemy: string };
export type CompTarget = "team" | "enemy";
export type AuthMode = "login" | "register";
export type SavedReport = {
  id: string;
  map: string;
  agent: string;
  side: string;
  score: string;
  won: boolean;
  date: string;
  rawDate: string;
  summary: string;
  mistake: string;
  tendencies: string;
  adjustment: string;
  bestRound: string;
  decisionScore: string;
  winPct: number;
  roundsWon: number;
  roundsLost: number;
  roundsSkipped: number;
  survivedCount: number;
  totalRounds: number;
  rounds: RoundData[];
  setup: SetupData;
};
export type DraftState = {
  setup: SetupData;
  setupStep: SetupStep;
  rounds: RoundData[];
  roundIdx: number;
  screen: Screen;
};
