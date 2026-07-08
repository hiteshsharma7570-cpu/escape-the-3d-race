// Rat Race + Fast Track — full game model
// (rebuilt to match the uploaded Cashflow-style spec)

export type TileType =
  // ---- Rat Race tile types ----
  | "payday"
  | "opportunity"
  | "doodad"
  | "market"
  | "charity"
  | "baby"
  | "downsized"
  // ---- Fast Track tile types ----
  | "ft_business"
  | "ft_dream"
  | "ft_cashflowday"
  | "ft_charity"
  | "ft_divorce"
  | "ft_lawsuit";

export interface Tile {
  id: number;
  type: TileType;
  label: string;
  color: string;
  gradient?: string;
  icon?: string;
  /** Cost for `doodad` tiles */
  cost?: number;
  /** For `ft_business` / `ft_dream`: purchase cost */
  ftCost?: number;
  /** For `ft_business`: monthly passive income added on purchase */
  ftIncome?: number;
}

export type AssetType = "paper" | "real_estate" | "business" | "stock" | "land";

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  /** What the player paid — also used as the "value" for net-worth calcs. */
  cost: number;
  /** Monthly passive income. Negative means the asset is a monthly loss. */
  income: number;
  /** True for businesses/stocks that can turn negative via market cards. */
  volatile?: boolean;
  /** Stock-specific */
  shares?: number;
  company?: string;
  // ---- Legacy aliases so older HUD/report code still works ----
  /** Same as `cost`. Retained for backward compatibility. */
  value: number;
  /** Same as `income`. */
  monthlyIncome: number;
  /** Coarse risk bucket derived from asset type. */
  risk: "low" | "medium" | "high";
}

export interface Liability {
  principal: number;
  emi: number;
  /** Annual interest rate as % (e.g. 12 = 12% APR). */
  interestRate: number;
}

export type LiabilityKey = string; // 'mortgage' | 'carLoan' | 'creditCard' | 'studentLoan' | 'bankLoan' | 'courseLoan' | ...
export type ExpenseKey   = string; // 'taxes' | 'other' | 'children' | ...

// ---- Opportunity / Market cards ----
export type OpportunityCard =
  | SimpleOpportunityCard
  | StockOpportunityCard
  | DecisionOpportunityCard;

export interface SimpleOpportunityCard {
  cardType: "simple";
  name: string;
  cost: number;
  income: number;
  type: AssetType;
  description: string;
  volatile?: boolean;
}

export interface StockOpportunityCard {
  cardType: "stock";
  name: string;
  shares: number;
  pricePerShare: number;
  description: string;
}

export interface DecisionOpportunityCard {
  cardType: "decision";
  name: string;
  description: string;
  choices: Array<{
    text: string;
    cost: number;
    reward: number;
    successChance: number;
    logText: string;
  }>;
}

export interface MarketCard {
  id: number;
  text: string;
}

// ---- Pending UI decisions ----
export type PendingDecision =
  | { type: "charity"; donation: number }
  | { type: "opportunity"; card: OpportunityCard; costAfterCycle: number }
  | { type: "doodad"; cost: number; label: string }
  | { type: "loan_for_asset"; card: OpportunityCard; totalCost: number; shortfall: number; loanAmount: number; newEMI: number; onAccept: "buy_simple" | "buy_stock" | "buy_decision"; decisionChoiceIndex?: number }
  | { type: "bankruptcy"; debtOwed: number }
  | { type: "course_offer" }
  | { type: "market_card"; cardId: number }
  | { type: "fast_track_buy"; tileType: "ft_business" | "ft_dream"; label: string; cost: number; income: number };

export interface MarketHint {
  sentiment: "bullish" | "bearish" | "neutral";
  headline: string;
}

export type MarketCycle = "Normal" | "Boom" | "Recession";

export interface ProfessionProfile {
  name: string;
  cash: number;
  salary: number;
  passiveIncome: number;
  expenses: Record<ExpenseKey, number>;
  liabilities: Record<LiabilityKey, Liability>;
}

export interface GameState {
  // identity
  playerName: string;
  profession: string;

  // financials
  cash: number;
  salary: number;
  passiveIncome: number;
  /** 1.0 default; 1.2 after TBS Financial Course. Multiplies salary + passive income. */
  efficiency: number;
  cashFlow: number;
  expenses: Record<ExpenseKey, number>;
  liabilities: Record<LiabilityKey, Liability>;
  assets: Asset[];

  // board
  position: number;
  ftPosition: number;
  onFastTrack: boolean;

  // dice / animation
  diceValue: number | null;
  isRolling: boolean;

  // flags
  charityUsed: boolean;
  skipTurns: number;
  childrenCount: number;
  missedEMIs: number;
  bankruptcies: number;
  hasTakenCourse: boolean;
  isOut: boolean;
  hasEscapedRatRace: boolean;
  hasReachedFiveCrore: boolean;

  // decks / cycle
  opportunityCardIndex: number;
  marketCardIndex: number;
  marketCycle: MarketCycle;
  turnsUntilCycleChange: number;

  // UI
  pendingDecision: PendingDecision | null;
  marketHint: MarketHint | null;

  // logs / history
  gameLog: string[];
  turnCount: number;
  decisionHistory: Array<{ type: string; turn: number; [k: string]: unknown }>;

  // legacy compatibility (kept so existing UI still renders):
  marketCondition: "normal" | "boom" | "crash";
}

// EMI utility used both in profession seed and at runtime.
export const calculateEMI = (principal: number, interestRate: number, months = 60): number => {
  const p = Number(principal);
  const rate = Number.isFinite(interestRate) && interestRate! > 0 ? interestRate : 12;
  if (!Number.isFinite(p) || p <= 0) return 0;
  const r = rate / 100 / 12;
  if (r === 0) return Math.round(p / months);
  const emi =
    (p * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return Number.isFinite(emi) ? Math.round(emi) : 0;
};

const liab = (principal: number, interestRate: number): Liability => ({
  principal,
  emi: calculateEMI(principal, interestRate),
  interestRate,
});

export const PROFESSION_PROFILES: Record<string, ProfessionProfile> = {
  Engineer: {
    name: "Engineer",
    cash: 32000,
    salary: 200000,
    passiveIncome: 0,
    expenses: { taxes: 40000, other: 48000 },
    liabilities: {
      mortgage: liab(4000000, 8.5),
      carLoan: liab(400000, 10),
      creditCard: liab(160000, 20),
      bankLoan: { principal: 0, emi: 0, interestRate: 12 },
    },
  },
  Doctor: {
    name: "Doctor",
    cash: 20000,
    salary: 400000,
    passiveIncome: 0,
    expenses: { taxes: 100000, other: 80000 },
    liabilities: {
      mortgage: liab(6000000, 9),
      carLoan: liab(800000, 11),
      creditCard: liab(400000, 22),
      studentLoan: liab(1500000, 7.5),
      bankLoan: { principal: 0, emi: 0, interestRate: 12 },
    },
  },
  Teacher: {
    name: "Teacher",
    cash: 40000,
    salary: 80000,
    passiveIncome: 0,
    expenses: { taxes: 12000, other: 20000 },
    liabilities: {
      mortgage: liab(1200000, 8),
      carLoan: liab(150000, 9.5),
      creditCard: liab(50000, 18),
      bankLoan: { principal: 0, emi: 0, interestRate: 12 },
    },
  },
  Pilot: {
    name: "Pilot",
    cash: 25000,
    salary: 350000,
    passiveIncome: 0,
    expenses: { taxes: 80000, other: 60000 },
    liabilities: {
      mortgage: liab(5000000, 9.2),
      carLoan: liab(700000, 10.5),
      creditCard: liab(500000, 21),
      bankLoan: { principal: 0, emi: 0, interestRate: 12 },
    },
  },
};

export const createInitialGameState = (
  playerName = "Player",
  profession = "Engineer",
): GameState => {
  const profile =
    PROFESSION_PROFILES[profession] ?? PROFESSION_PROFILES.Engineer;
  return {
    playerName,
    profession: profile.name,
    cash: profile.cash,
    salary: profile.salary,
    passiveIncome: profile.passiveIncome,
    efficiency: 1,
    cashFlow: 0,
    expenses: { ...profile.expenses },
    liabilities: Object.fromEntries(
      Object.entries(profile.liabilities).map(([k, v]) => [k, { ...v }]),
    ),
    assets: [],
    position: 0,
    ftPosition: 0,
    onFastTrack: false,
    diceValue: null,
    isRolling: false,
    charityUsed: false,
    skipTurns: 0,
    childrenCount: 0,
    missedEMIs: 0,
    bankruptcies: 0,
    hasTakenCourse: false,
    isOut: false,
    hasEscapedRatRace: false,
    hasReachedFiveCrore: false,
    opportunityCardIndex: 0,
    marketCardIndex: 0,
    marketCycle: "Normal",
    turnsUntilCycleChange: 7,
    pendingDecision: null,
    marketHint: null,
    gameLog: [`[Turn 0] Welcome, ${playerName}! Roll the dice to begin.`],
    turnCount: 0,
    decisionHistory: [],
    marketCondition: "normal",
  };
};

export const INITIAL_GAME_STATE: GameState = createInitialGameState();
