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
 /** Outstanding principal in rupees. */
 principal: number;
 /** Annualised interest rate, percent. Informational. */
 interestRate: number;
}

/** Recurring monthly outflows with no principal — rent, bills, subscriptions. */
export type ExpenseCategory =
 | "rent"
 | "utilities"
 | "insurance"
 | "subscription"
 | "childcare"
 | "lifestyle"
 | "professional"
 | "maintenance"
 | "transport"
 | "food"
 | "pet"
 | "eldercare";

export interface Expense {
 id: string;
 name: string;
 category: ExpenseCategory;
 monthlyAmount: number;
 /** True = hard to cut (rent, utilities). False = discretionary. */
 essential: boolean;
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
 expenses: Expense[];
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
 expenses: Omit<Expense, "id">[];
}

export const PROFESSION_PROFILES: Record<string, ProfessionProfile> = {
 Teacher: {
 salary: 45000,
 cash: 50000,
 liabilities: [
 { name: "Two-Wheeler Loan", category: "vehicle_loan", principal: 80000, interestRate: 8.5 },
 { name: "Mobile Loan", category: "personal_loan", principal: 15000, interestRate: 10 },
 { name: "Family Loan (No Interest)", category: "personal_loan", principal: 50000, interestRate: 0 },
 ],
 expenses: [
 { name: "Home Rent", category: "rent", monthlyAmount: 9000, essential: true },
 { name: "Electricity Bill", category: "utilities", monthlyAmount: 1500, essential: true },
 { name: "Mobile + Broadband", category: "utilities", monthlyAmount: 900, essential: true },
 { name: "Health Insurance", category: "insurance", monthlyAmount: 1200, essential: true },
 { name: "Parents' Allowance", category: "lifestyle", monthlyAmount: 3000, essential: false },
 { name: "Kids' Tuition / Coaching Classes", category: "childcare", monthlyAmount: 2500, essential: false },
 { name: "Cab / Auto Commute", category: "transport", monthlyAmount: 1800, essential: true },
 { name: "Recurring Temple/Charity Offering", category: "lifestyle", monthlyAmount: 500, essential: false },
 ],
 },
 Engineer: {
 salary: 90000,
 cash: 80000,
 liabilities: [
 { name: "Home Loan", category: "home_loan", principal: 2500000, interestRate: 6.5 },
 { name: "Car Loan", category: "vehicle_loan", principal: 400000, interestRate: 7.0 },
 { name: "Education Loan",category: "education_loan",principal: 250000, interestRate: 5.5 },
 { name: "Furniture & Appliance Financing", category: "bnpl", principal: 90000, interestRate: 18 },
 ],
 expenses: [
 { name: "Society Maintenance",category: "maintenance", monthlyAmount: 3000, essential: true },
 { name: "Electricity Bill", category: "utilities", monthlyAmount: 2500, essential: true },
 { name: "Mobile + Broadband", category: "utilities", monthlyAmount: 1800, essential: true },
 { name: "Fuel", category: "transport", monthlyAmount: 4000, essential: true },
 { name: "Parents' Allowance", category: "lifestyle", monthlyAmount: 6000, essential: false },
 { name: "Term + Health Ins.", category: "insurance", monthlyAmount: 3000, essential: true },
 { name: "WiFi + DTH Bundle", category: "utilities", monthlyAmount: 1400, essential: true },
 { name: "Gym / Yoga Membership", category: "lifestyle", monthlyAmount: 1500, essential: false },
 { name: "Cloud Storage & App Subscriptions", category: "subscription", monthlyAmount: 350, essential: false },
 ],
 },
 Doctor: {
 salary: 150000,
 cash: 100000,
 liabilities: [
 { name: "Medical Education Loan", category: "education_loan", principal: 1400000, interestRate: 7.0 },
 { name: "Car Loan", category: "vehicle_loan", principal: 800000, interestRate: 7.0 },
 { name: "Clinic Equipment Loan", category: "business_loan", principal: 500000, interestRate: 8 },
 { name: "Home Renovation Loan", category: "home_loan", principal: 600000, interestRate: 10.5 },
 ],
 expenses: [
 { name: "Home Rent", category: "rent", monthlyAmount: 18000, essential: true },
 { name: "Medical Insurance", category: "insurance", monthlyAmount: 5000, essential: true },
 { name: "Society Maintenance", category: "maintenance", monthlyAmount: 4000, essential: true },
 { name: "Electricity Bill", category: "utilities", monthlyAmount: 3500, essential: true },
 { name: "Clinic Staff Salary", category: "professional", monthlyAmount: 14000, essential: true },
 { name: "Clinic Consumables", category: "professional", monthlyAmount: 5000, essential: true },
 { name: "Fuel", category: "transport", monthlyAmount: 5000, essential: true },
 { name: "Parents' Allowance", category: "lifestyle", monthlyAmount: 8000, essential: false },
 { name: "Domestic Help & Cook", category: "lifestyle", monthlyAmount: 7000, essential: false },
 { name: "Elderly Parents' Medicines", category: "eldercare", monthlyAmount: 3500, essential: true },
 { name: "Salon / Personal Grooming", category: "lifestyle", monthlyAmount: 1800, essential: false },
 ],
 },
 Lawyer: {
 salary: 120000,
 cash: 90000,
 liabilities: [
 { name: "Education Loan", category: "education_loan", principal: 700000, interestRate: 6.0 },
 { name: "Car Loan", category: "vehicle_loan", principal: 500000, interestRate: 7.0 },
 { name: "Loan Against Securities", category: "margin_loan", principal: 200000, interestRate: 11 },
 ],
 expenses: [
 { name: "Office Rent", category: "rent", monthlyAmount: 14000, essential: true },
 { name: "Bar Council Fees", category: "professional", monthlyAmount: 2000, essential: true },
 { name: "Office Internet", category: "utilities", monthlyAmount: 1800, essential: true },
 { name: "Indemnity Insurance", category: "insurance", monthlyAmount: 3000, essential: true },
 { name: "Society Maintenance", category: "maintenance", monthlyAmount: 3000, essential: true },
 { name: "Electricity Bill", category: "utilities", monthlyAmount: 3000, essential: true },
 { name: "Fuel", category: "transport", monthlyAmount: 5000, essential: true },
 { name: "Parents' Allowance", category: "lifestyle", monthlyAmount: 6000, essential: false },
 { name: "Vehicle Servicing & Maintenance", category: "transport", monthlyAmount: 1500, essential: true },
 { name: "Co-working Space Membership", category: "professional", monthlyAmount: 8000, essential: false },
 { name: "Pet Grooming & Vet Visits", category: "pet", monthlyAmount: 2000, essential: false },
 ],
 },
 "Business Owner": {
 salary: 60000,
 cash: 150000,
 liabilities: [
 { name: "Business Loan", category: "business_loan", principal: 1700000, interestRate: 8.5 },
 { name: "Working Capital Loan", category: "business_loan", principal: 500000, interestRate: 10 },
 { name: "Co-signed Sibling's Loan", category: "personal_loan", principal: 250000, interestRate: 12 },
 { name: "NBFC Instant App Loan", category: "personal_loan", principal: 35000, interestRate: 32 },
 ],
 expenses: [
 { name: "Office Rent", category: "rent", monthlyAmount: 25000, essential: true },
 { name: "Staff Salaries", category: "professional", monthlyAmount: 35000, essential: true },
 { name: "Utilities & Electricity",category: "utilities", monthlyAmount: 8000, essential: true },
 { name: "Accountant Fees", category: "professional", monthlyAmount: 3500, essential: true },
 { name: "Business Insurance", category: "insurance", monthlyAmount: 6000, essential: true },
 { name: "Fuel + Logistics", category: "transport", monthlyAmount: 10000, essential: true },
 { name: "Parents' Allowance", category: "lifestyle", monthlyAmount: 9000, essential: false },
 { name: "Co-working Space Membership", category: "professional", monthlyAmount: 6000, essential: false },
 { name: "Society Festival Fund (Ganpati/Diwali collection)", category: "maintenance", monthlyAmount: 800, essential: false },
 { name: "WiFi + DTH Bundle", category: "utilities", monthlyAmount: 1600, essential: true },
 ],
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
 interestRate: 9,
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
