export type TileType = 
 | "payday" 
 | "opportunity" 
 | "market" 
 | "charity" 
 | "baby" 
 | "vacation" 
 | "dinner" 
 | "downsized"
 | "tax_audit"
 | "medical_emergency"
 | "side_hustle"
 | "inheritance"
 | "real_estate_boom"
 | "stock_market_crash"
  | "rate_hike"
 | "insurance_premium"
 | "home_repair"
 | "traffic_fine"
 | "credit_card_bill"
 | "school_fees"
 | "festival_expense"
 | "electricity_bill"
 | "rent_hike"
 | "vehicle_breakdown"
 | "loan_interest_spike"
 | "society_maintenance"
 | "gold_loan_offer"
 | "wedding_in_family"
 | "subscription_creep"
 | "fuel_price_hike"
 | "parents_medical"
 | "gst_notice"
 | "bonus"
 | "tax_refund"
 | "bnpl_trap"
 | "solar_install"
 | "ev_switch"
 | "streaming_audit"
 | "pet_adoption"
 | "elderly_care_hire"
 | "payday_loan"
 | "margin_call"
 | "tax_arrears"
 | "college_admission_loan"
 | "home_purchase_loan"
 | "legal_settlement"
 // ---- Pool slots used directly on the 24-tile board.
 // Each resolves at landing-time to one of several concrete TileTypes above.
 | "quick_cash_trap"
 | "tax_trouble"
 | "bill_shock"
 | "unexpected_repair"
 | "life_event"
 | "family_care"
 | "monthly_bills"
 | "green_upgrade";

export interface Tile {
 id: number;
 type: TileType;
 label: string;
 color: string;
 gradient?: string;
 icon?: string;
}

export interface Asset {
 id: string;
 name: string;
 value: number;
 monthlyIncome: number;
 risk: "low" | "medium" | "high";
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
 position: number;
 diceValue: number | null;
 isRolling: boolean;
 gameLog: string[];
 marketCondition: "normal" | "boom" | "crash";
 hasEscapedRatRace: boolean;
 hasReachedFiveCrore: boolean;
 pendingDecision: PendingDecision | null;
 marketHint: MarketHint | null;
 turnCount: number;
}

export interface ProfessionProfile {
 salary: number;
 cash: number;
}

export const PROFESSION_PROFILES: Record<string, ProfessionProfile> = {
 Teacher:         { salary: 45000,  cash: 50000  },
 Engineer:        { salary: 90000,  cash: 80000  },
 Doctor:          { salary: 150000, cash: 100000 },
 Lawyer:          { salary: 120000, cash: 90000  },
 "Business Owner":{ salary: 60000,  cash: 150000 },
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
 position: 0,
 diceValue: null,
 isRolling: false,
 gameLog: [`[Turn 0] Welcome, ${playerName}! Roll the dice to begin.`],
 marketCondition: "normal",
 hasEscapedRatRace: false,
 hasReachedFiveCrore: false,
 pendingDecision: null,
 marketHint: null,
 turnCount: 0,
 };
};

export const INITIAL_GAME_STATE: GameState = createInitialGameState();
