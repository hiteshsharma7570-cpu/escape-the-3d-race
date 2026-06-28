export type TileType = 
  | "payday" 
  | "opportunity" 
  | "market" 
  | "charity" 
  | "baby" 
  | "vacation" 
  | "dinner" 
  | "downsized";

export interface Tile {
  id: number;
  type: TileType;
  label: string;
  color: string;
}

export interface Asset {
  id: string;
  name: string;
  value: number;
  monthlyIncome: number;
  risk: "low" | "medium" | "high";
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
  monthlyPayment: number;
}

export interface PendingDecision {
  type: "charity" | "opportunity";
  charityAmount?: number;
  opportunity?: {
    name: string;
    cost: number;
    income: number;
    value: number;
    risk: "low" | "medium" | "high";
    description: string;
  };
}

export interface MarketHint {
  sentiment: "bullish" | "bearish" | "neutral";
  headline: string;
}

export interface GameState {
  playerName: string;
  profession: string;
  cash: number;
  salary: number;
  passiveIncome: number;
  assets: Asset[];
  liabilities: Liability[];
  position: number;
  diceValue: number | null;
  isRolling: boolean;
  gameLog: string[];
  marketCondition: "normal" | "boom" | "crash";
  hasEscapedRatRace: boolean;
  pendingDecision: PendingDecision | null;
  marketHint: MarketHint | null;
  turnCount: number;
  loansTaken: number;
}

export interface ProfessionProfile {
  salary: number;
  cash: number;
  liabilities: Omit<Liability, "id">[];
}

export const PROFESSION_PROFILES: Record<string, ProfessionProfile> = {
  Teacher: {
    salary: 45000,
    cash: 50000,
    liabilities: [{ name: "Car Loan", amount: 800000, monthlyPayment: 4000 }],
  },
  Engineer: {
    salary: 90000,
    cash: 80000,
    liabilities: [
      { name: "Car Loan", amount: 1000000, monthlyPayment: 5000 },
      { name: "Student Loan", amount: 500000, monthlyPayment: 3000 },
    ],
  },
  Doctor: {
    salary: 150000,
    cash: 100000,
    liabilities: [
      { name: "Medical Education Loan", amount: 2000000, monthlyPayment: 12000 },
      { name: "Car Loan", amount: 1500000, monthlyPayment: 8000 },
    ],
  },
  Lawyer: {
    salary: 120000,
    cash: 90000,
    liabilities: [
      { name: "Education Loan", amount: 1200000, monthlyPayment: 7000 },
      { name: "Car Loan", amount: 1000000, monthlyPayment: 5000 },
    ],
  },
  "Business Owner": {
    salary: 60000,
    cash: 150000,
    liabilities: [{ name: "Business Loan", amount: 2500000, monthlyPayment: 15000 }],
  },
};

export const createInitialGameState = (
  playerName = "Player",
  profession = "Teacher",
): GameState => {
  const profile = PROFESSION_PROFILES[profession] ?? PROFESSION_PROFILES.Teacher;
  return {
    playerName,
    profession,
    cash: profile.cash,
    salary: profile.salary,
    passiveIncome: 0,
    assets: [],
    liabilities: profile.liabilities.map((l, i) => ({
      ...l,
      id: `start-liability-${i}-${Date.now()}`,
    })),
    position: 0,
    diceValue: null,
    isRolling: false,
    gameLog: [`[Turn 0] Welcome, ${playerName}! Roll the dice to begin.`],
    marketCondition: "normal",
    hasEscapedRatRace: false,
    pendingDecision: null,
    marketHint: null,
    turnCount: 0,
    loansTaken: 0,
  };
};

export const INITIAL_GAME_STATE: GameState = createInitialGameState();
