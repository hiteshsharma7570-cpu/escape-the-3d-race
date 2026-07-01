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

/** True debts with an outstanding principal that can be repaid. */
export type LiabilityCategory =
 | "home_loan"
 | "vehicle_loan"
 | "education_loan"
 | "personal_loan"
 | "credit_card"
 | "business_loan"
 | "medical_debt"
 | "gold_loan"
 | "bnpl"
 | "payday_loan"
 | "margin_loan"
 | "tax_arrears";

export interface Liability {
 id: string;
 name: string;
 category: LiabilityCategory;
 /** Outstanding principal in rupees — the only financial attribute of a debt. */
 principal: number;
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
 hasReachedFiveCrore: boolean;
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
 liabilities: [
 { name: "Two-Wheeler Loan", category: "vehicle_loan", principal: 80000 },
 { name: "Mobile Loan", category: "personal_loan", principal: 15000 },
 { name: "Family Loan", category: "personal_loan", principal: 50000 },
 ],
  expenses: [],
 },
 Engineer: {
 salary: 90000,
 cash: 80000,
 liabilities: [
 { name: "Home Loan", category: "home_loan", principal: 2500000 },
 { name: "Car Loan", category: "vehicle_loan", principal: 400000 },
 { name: "Education Loan",category: "education_loan",principal: 250000 },
 { name: "Furniture & Appliance Financing", category: "bnpl", principal: 90000 },
 ],
  expenses: [],
 },
 Doctor: {
 salary: 150000,
 cash: 100000,
 liabilities: [
 { name: "Medical Education Loan", category: "education_loan", principal: 1400000 },
 { name: "Car Loan", category: "vehicle_loan", principal: 800000 },
 { name: "Clinic Equipment Loan", category: "business_loan", principal: 500000 },
 { name: "Home Renovation Loan", category: "home_loan", principal: 600000 },
 ],
  expenses: [],
 },
 Lawyer: {
 salary: 120000,
 cash: 90000,
 liabilities: [
 { name: "Education Loan", category: "education_loan", principal: 700000 },
 { name: "Car Loan", category: "vehicle_loan", principal: 500000 },
 { name: "Loan Against Securities", category: "margin_loan", principal: 200000 },
 ],
  expenses: [],
 },
 "Business Owner": {
 salary: 60000,
 cash: 150000,
 liabilities: [
 { name: "Business Loan", category: "business_loan", principal: 1700000 },
 { name: "Working Capital Loan", category: "business_loan", principal: 500000 },
 { name: "Co-signed Sibling's Loan", category: "personal_loan", principal: 250000 },
 { name: "NBFC Instant App Loan", category: "personal_loan", principal: 35000 },
 ],
  expenses: [],
 },
};

export const createInitialGameState = (
 playerName = "Player",
 profession = "Teacher",
): GameState => {
 const profile = PROFESSION_PROFILES[profession] ?? PROFESSION_PROFILES.Teacher;
 const seed = Date.now();
 return {
 playerName,
 profession,
 cash: profile.cash,
 salary: profile.salary,
 passiveIncome: 0,
 assets: [],
 liabilities: [
 // Every player begins with a ₹5 lakh outstanding personal loan.
 {
 id: `start-liability-starter-${seed}`,
 name: "Starter Personal Loan",
 category: "personal_loan" as const,
 principal: 300000,
 },
 ...profile.liabilities.map((l, i) => ({
 ...l,
 id: `start-liability-${i}-${seed}`,
 })),
 ],
 expenses: profile.expenses.map((e, i) => ({
 ...e,
 id: `start-expense-${i}-${seed}`,
 })),
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
 loansTaken: 0,
 };
};

export const INITIAL_GAME_STATE: GameState = createInitialGameState();
