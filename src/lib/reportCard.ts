import { GameState } from "@/types/game";
import { calculateNetWorth } from "./gameLogic";

export type Grade = "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";

export interface ReportCategory {
  key: string;
  label: string;
  grade: Grade;
  score: number; // 0-100
  summary: string;
}

export interface ReportCard {
  overall: Grade;
  overallScore: number;
  headline: string;
  categories: ReportCategory[];
}

const toGrade = (score: number): Grade => {
  if (score >= 95) return "A+";
  if (score >= 88) return "A";
  if (score >= 80) return "B+";
  if (score >= 72) return "B";
  if (score >= 64) return "C+";
  if (score >= 55) return "C";
  if (score >= 45) return "D";
  return "F";
};

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export const buildReportCard = (state: GameState): ReportCard => {
  const netWorth = calculateNetWorth(state);
  const totalLiabilityAmount = state.liabilities.reduce((s, l) => s + l.principal, 0);
  const assets = state.assets;
  const turns = Math.max(1, state.turnCount);

  // 1. Risk Management — asset diversification across risk tiers + penalty for medical debt
  const riskCount = { low: 0, medium: 0, high: 0 };
  assets.forEach((a) => {
    riskCount[a.risk] += 1;
  });
  const tiersUsed = Object.values(riskCount).filter((n) => n > 0).length;
  const highRatio = assets.length ? riskCount.high / assets.length : 0;
  let riskScore = 40 + tiersUsed * 18; // 1 tier = 58, 2 = 76, 3 = 94
  if (highRatio > 0.6) riskScore -= 20; // over-concentrated in high risk
  if (assets.length === 0) riskScore = 30;
  const hasMedicalDebt = state.liabilities.some((l) => l.category === "medical_debt");
  if (hasMedicalDebt) riskScore -= 12;
  riskScore = clamp(riskScore);

  // 2. Debt Management — low debt-to-net-worth + restrained loan taking
  const debtRatio =
    netWorth > 0 ? totalLiabilityAmount / (netWorth + totalLiabilityAmount) : 1;
  let debtScore = 100 - debtRatio * 110;
  debtScore -= state.loansTaken * 6;
  debtScore = clamp(debtScore);

  // 3. Investment Timing — passive income built per turn
  const incomePerTurn = state.passiveIncome / turns;
  // 2000/turn ~ A, 4000/turn ~ A+
  const timingScore = clamp(Math.sqrt(incomePerTurn / 4000) * 100);

  // 4. Cash Flow — passive income vs salary replacement
  const coverage = state.salary > 0 ? state.passiveIncome / state.salary : 1;
  const cashFlowScore = clamp(coverage * 70 + (state.hasEscapedRatRace ? 30 : 0));

  // 5. Wealth Building — net worth growth
  const worthPerTurn = netWorth / turns;
  // 50k/turn ~ A+
  const wealthScore = clamp(Math.sqrt(Math.max(0, worthPerTurn) / 50000) * 100);

  const categories: ReportCategory[] = [
    {
      key: "risk",
      label: "Risk Management",
      score: riskScore,
      grade: toGrade(riskScore),
      summary:
        tiersUsed >= 3
          ? "Well-diversified across low, medium, and high-risk assets."
          : tiersUsed === 2
          ? "Spread across two risk tiers — room to diversify further."
          : assets.length === 0
          ? "No investments — you avoided risk by avoiding wealth."
          : highRatio > 0.6
          ? "Over-exposed to high-risk assets. A crash would hurt."
          : "Concentrated in one risk tier.",
    },
    {
      key: "debt",
      label: "Debt Management",
      score: debtScore,
      grade: toGrade(debtScore),
      summary:
        totalLiabilityAmount === 0
          ? "Debt-free. You kept the balance sheet clean."
          : debtRatio < 0.2
          ? "Low debt relative to net worth — healthy leverage."
          : debtRatio < 0.5
          ? "Moderate debt load. Manageable but watch the payments."
          : "Heavy debt burden ate into your net worth.",
    },
    {
      key: "timing",
      label: "Investment Timing",
      score: timingScore,
      grade: toGrade(timingScore),
      summary:
        incomePerTurn >= 3000
          ? "Quickly built passive income — strong compounding."
          : incomePerTurn >= 1000
          ? "Steady investment cadence."
          : "Slow to deploy capital into income-producing assets.",
    },
    {
      key: "cashflow",
      label: "Cash Flow",
      score: cashFlowScore,
      grade: toGrade(cashFlowScore),
      summary: state.hasEscapedRatRace
        ? "Passive income now exceeds your salary — escape achieved."
        : coverage >= 0.5
        ? "Passive income covers half your salary. Almost there."
        : "Salary still funds most of your lifestyle.",
    },
    {
      key: "wealth",
      label: "Wealth Building",
      score: wealthScore,
      grade: toGrade(wealthScore),
      summary:
        worthPerTurn >= 40000
          ? "Exceptional net-worth growth per turn."
          : worthPerTurn >= 10000
          ? "Solid, consistent wealth growth."
          : "Net worth grew slowly relative to game length.",
    },
  ];

  const overallScore = Math.round(
    categories.reduce((s, c) => s + c.score, 0) / categories.length
  );
  const overall = toGrade(overallScore);

  const headline =
    overall === "A+"
      ? "Outstanding — a textbook escape."
      : overall === "A" || overall === "B+"
      ? "Strong financial discipline across the board."
      : overall === "B" || overall === "C+"
      ? "Solid run with clear areas to improve."
      : overall === "C" || overall === "D"
      ? "You escaped, but the journey was rough."
      : "A near miss — review your debt and timing.";

  return { overall, overallScore, headline, categories };
};

export const gradeColor = (grade: Grade): string => {
  if (grade === "A+" || grade === "A") return "text-emerald-500";
  if (grade === "B+" || grade === "B") return "text-sky-500";
  if (grade === "C+" || grade === "C") return "text-amber-500";
  if (grade === "D") return "text-orange-500";
  return "text-destructive";
};
