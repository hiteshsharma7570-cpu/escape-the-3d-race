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
}

export const INITIAL_GAME_STATE: GameState = {
  playerName: "Player",
  profession: "Teacher",
  cash: 2480690,
  salary: 96000,
  passiveIncome: 80400,
  assets: [],
  liabilities: [],
  position: 0,
  diceValue: null,
  isRolling: false,
  gameLog: ["Welcome! Roll the dice to begin."],
  marketCondition: "normal",
  hasEscapedRatRace: false,
  pendingDecision: null,
  marketHint: null,
};
