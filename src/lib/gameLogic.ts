import { GameState, Tile, Asset, Liability, Expense, MarketHint, LiabilityCategory, ExpenseCategory } from "@/types/game";

export { type GameState, type Tile, type Asset, type Liability, type Expense };

const LOG_LIMIT = 19;
const prefix = (state: GameState, msg: string) => `[Turn ${state.turnCount}] ${msg}`;
const pushLog = (state: GameState, msg: string) => {
  state.gameLog = [prefix(state, msg), ...state.gameLog.slice(0, LOG_LIMIT)];
};

// ---------- liability / expense helpers ----------
let _uid = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(_uid++).toString(36)}`;

const addLiability = (
  state: GameState,
  data: { name: string; category: LiabilityCategory; principal: number; interestRate: number }
): Liability => {
  const l: Liability = { id: uid("liab"), ...data };
  state.liabilities.push(l);
  return l;
};

const addExpense = (
  state: GameState,
  data: { name: string; category: ExpenseCategory; monthlyAmount: number; essential?: boolean }
): Expense => {
  const e: Expense = { id: uid("exp"), essential: false, ...data };
  state.expenses.push(e);
  return e;
};

export const INVESTMENT_OPPORTUNITIES = [
  // Low Risk
  { name: "Fixed Deposit", cost: 25000, income: 600, value: 25000, risk: "low" as const, description: "Safe bank deposit with guaranteed returns" },
  { name: "Government Bonds", cost: 50000, income: 1200, value: 50000, risk: "low" as const, description: "Secure government-backed bonds" },
  { name: "Dividend Stocks", cost: 75000, income: 2000, value: 75000, risk: "low" as const, description: "Blue-chip stocks with steady dividends" },
  // Medium Risk
  { name: "Rental Property", cost: 500000, income: 14400, value: 500000, risk: "medium" as const, description: "Residential property for rental income" },
  { name: "Side Business", cost: 100000, income: 6000, value: 100000, risk: "medium" as const, description: "Part-time business venture" },
  { name: "REITs", cost: 150000, income: 5400, value: 150000, risk: "medium" as const, description: "Real Estate Investment Trust" },
  { name: "Mutual Funds", cost: 200000, income: 6000, value: 200000, risk: "medium" as const, description: "Diversified portfolio managed by experts" },
  // High Risk
  { name: "Startup Investment", cost: 250000, income: 15000, value: 250000, risk: "high" as const, description: "Equity in an early-stage company" },
  { name: "Crypto Portfolio", cost: 100000, income: 8000, value: 100000, risk: "high" as const, description: "Diversified cryptocurrency holdings" },
  { name: "Commercial Property", cost: 1000000, income: 40000, value: 1000000, risk: "high" as const, description: "Office/retail space for lease" },
  { name: "Franchise Business", cost: 750000, income: 30000, value: 750000, risk: "high" as const, description: "Branded franchise operation" },
];

const G = {
  payday:               { color: "#f7971e", gradient: "linear-gradient(135deg,#f7971e,#ffd200)", icon: "💰" },
  opportunity:          { color: "#4776E6", gradient: "linear-gradient(135deg,#4776E6,#8E54E9)", icon: "💡" },
  market:               { color: "#f46b45", gradient: "linear-gradient(135deg,#f46b45,#eea849)", icon: "📊" },
  charity:              { color: "#a18cd1", gradient: "linear-gradient(135deg,#a18cd1,#fbc2eb)", icon: "❤️" },
  baby:                 { color: "#f953c6", gradient: "linear-gradient(135deg,#f953c6,#b91d73)", icon: "👶" },
  vacation:             { color: "#43b89c", gradient: "linear-gradient(135deg,#43b89c,#0f3443)", icon: "🏝️" },
  dinner:               { color: "#cb2d3e", gradient: "linear-gradient(135deg,#cb2d3e,#ef473a)", icon: "🍽️" },
  downsized:            { color: "#373b44", gradient: "linear-gradient(135deg,#373b44,#4286f4)", icon: "📉" },
  tax_audit:            { color: "#eb3349", gradient: "linear-gradient(135deg,#eb3349,#f45c43)", icon: "🔍" },
  medical_emergency:    { color: "#c0392b", gradient: "linear-gradient(135deg,#c0392b,#8e44ad)", icon: "🏥" },
  side_hustle:          { color: "#56ab2f", gradient: "linear-gradient(135deg,#56ab2f,#a8e063)", icon: "💼" },
  inheritance:          { color: "#11998e", gradient: "linear-gradient(135deg,#11998e,#38ef7d)", icon: "🎁" },
  real_estate_boom:     { color: "#134e5e", gradient: "linear-gradient(135deg,#134e5e,#71b280)", icon: "🏠" },
  stock_market_crash:   { color: "#1a1a2e", gradient: "linear-gradient(135deg,#1a1a2e,#e94560)", icon: "📉" },
  rate_hike:            { color: "#c0392b", gradient: "linear-gradient(135deg,#c0392b,#e74c3c)", icon: "📈" },
  insurance_premium:    { color: "#8e44ad", gradient: "linear-gradient(135deg,#8e44ad,#9b59b6)", icon: "🛡️" },
  home_repair:          { color: "#d35400", gradient: "linear-gradient(135deg,#d35400,#e67e22)", icon: "🔧" },
  traffic_fine:         { color: "#e74c3c", gradient: "linear-gradient(135deg,#e74c3c,#c0392b)", icon: "🚦" },
  credit_card_bill:     { color: "#c0392b", gradient: "linear-gradient(135deg,#922b21,#c0392b)", icon: "💳" },
  school_fees:          { color: "#2980b9", gradient: "linear-gradient(135deg,#2980b9,#3498db)", icon: "🎒" },
  festival_expense:     { color: "#f39c12", gradient: "linear-gradient(135deg,#f39c12,#f1c40f)", icon: "🪔" },
  electricity_bill:     { color: "#d4ac0d", gradient: "linear-gradient(135deg,#d4ac0d,#f9ca24)", icon: "⚡" },
  rent_hike:            { color: "#922b21", gradient: "linear-gradient(135deg,#922b21,#c0392b)", icon: "🏠" },
  vehicle_breakdown:    { color: "#717d7e", gradient: "linear-gradient(135deg,#717d7e,#95a5a6)", icon: "🚗" },
  loan_interest_spike:  { color: "#6e2f1a", gradient: "linear-gradient(135deg,#6e2f1a,#a04000)", icon: "🏦" },
  society_maintenance:  { color: "#1a5276", gradient: "linear-gradient(135deg,#1a5276,#2471a3)", icon: "🏢" },
  gold_loan_offer:      { color: "#b7950b", gradient: "linear-gradient(135deg,#b7950b,#f1c40f)", icon: "🪙" },
  wedding_in_family:    { color: "#a93226", gradient: "linear-gradient(135deg,#a93226,#e74c3c)", icon: "💍" },
  subscription_creep:   { color: "#5b2c6f", gradient: "linear-gradient(135deg,#5b2c6f,#8e44ad)", icon: "📺" },
  fuel_price_hike:      { color: "#7b241c", gradient: "linear-gradient(135deg,#7b241c,#c0392b)", icon: "⛽" },
  parents_medical:      { color: "#5d6d7e", gradient: "linear-gradient(135deg,#5d6d7e,#85929e)", icon: "👴" },
  gst_notice:           { color: "#1b4f72", gradient: "linear-gradient(135deg,#1b4f72,#2874a6)", icon: "🧾" },
  bonus:                { color: "#1e8449", gradient: "linear-gradient(135deg,#1e8449,#28b463)", icon: "🎉" },
  tax_refund:           { color: "#117864", gradient: "linear-gradient(135deg,#117864,#16a085)", icon: "💸" },
  bnpl_trap:            { color: "#a93268", gradient: "linear-gradient(135deg,#a93268,#e84393)", icon: "🛍️" },
  solar_install:        { color: "#d4ac0d", gradient: "linear-gradient(135deg,#d4ac0d,#f1c40f)", icon: "☀️" },
  ev_switch:            { color: "#117a3e", gradient: "linear-gradient(135deg,#117a3e,#27ae60)", icon: "🔋" },
  streaming_audit:      { color: "#117a8b", gradient: "linear-gradient(135deg,#117a8b,#1abc9c)", icon: "✂️" },
  pet_adoption:         { color: "#cb6a1e", gradient: "linear-gradient(135deg,#cb6a1e,#f39c12)", icon: "🐶" },
  elderly_care_hire:    { color: "#6c3483", gradient: "linear-gradient(135deg,#6c3483,#8e44ad)", icon: "🧓" },
  payday_loan:          { color: "#922b50", gradient: "linear-gradient(135deg,#922b50,#e84393)", icon: "💸" },
  margin_call:          { color: "#7b1f1f", gradient: "linear-gradient(135deg,#7b1f1f,#e74c3c)", icon: "📞" },
  tax_arrears:          { color: "#7e5109", gradient: "linear-gradient(135deg,#7e5109,#b9770e)", icon: "🧾" },
  // ---- Pool slots (the only tile types actually placed on the 24-tile board)
  quick_cash_trap:      { color: "#8e0e3a", gradient: "linear-gradient(135deg,#8e0e3a,#e84393)", icon: "💸" },
  tax_trouble:          { color: "#7e5109", gradient: "linear-gradient(135deg,#7e5109,#c0392b)", icon: "🧾" },
  bill_shock:           { color: "#b03a2e", gradient: "linear-gradient(135deg,#b03a2e,#f1948a)", icon: "💥" },
  unexpected_repair:    { color: "#a04000", gradient: "linear-gradient(135deg,#a04000,#e67e22)", icon: "🛠️" },
  life_event:           { color: "#a93268", gradient: "linear-gradient(135deg,#a93268,#fbc2eb)", icon: "🎈" },
  family_care:          { color: "#5d3a8e", gradient: "linear-gradient(135deg,#5d3a8e,#8e44ad)", icon: "👨‍👩‍👧" },
  monthly_bills:        { color: "#1a5276", gradient: "linear-gradient(135deg,#1a5276,#5dade2)", icon: "🧾" },
  green_upgrade:        { color: "#117a3e", gradient: "linear-gradient(135deg,#117a3e,#27ae60)", icon: "🌱" },
} as const;

const t = (id: number, type: keyof typeof G, label: string): Tile => ({
  id, type: type as Tile["type"], label, color: G[type].color, gradient: G[type].gradient, icon: G[type].icon,
});

// 24-tile perimeter ring (7x7 board: 4*7 - 4 = 24).
// The 36 underlying tile types still exist; pool slots resolve to one of
// them at landing-time via resolvePoolTile(), so repeat visits feel different.
export const BOARD_TILES: Tile[] = [
  t(0,  "payday",              "Pay Day"),
  t(1,  "opportunity",         "Opportunity"),
  t(2,  "bill_shock",          "Bill Shock"),
  t(3,  "quick_cash_trap",     "Quick Cash Trap"),
  t(4,  "bonus",               "Bonus!"),
  t(5,  "life_event",          "Life Event"),
  t(6,  "market",              "Market"),
  t(7,  "credit_card_bill",    "Credit Card Bill"),
  t(8,  "side_hustle",         "Side Hustle"),
  t(9,  "monthly_bills",       "Monthly Bills"),
  t(10, "medical_emergency",   "Medical"),
  t(11, "charity",             "Charity"),
  t(12, "tax_refund",          "Tax Refund"),
  t(13, "unexpected_repair",   "Unexpected Repair"),
  t(14, "bnpl_trap",           "BNPL Trap"),
  t(15, "downsized",           "Downsized!"),
  t(16, "inheritance",         "Inheritance"),
  t(17, "family_care",         "Family Care"),
  t(18, "rate_hike",           "Rate Hike"),
  t(19, "real_estate_boom",    "RE Boom"),
  t(20, "wedding_in_family",   "Wedding"),
  t(21, "stock_market_crash",  "Crash"),
  t(22, "tax_trouble",         "Tax Trouble"),
  t(23, "green_upgrade",       "Green Upgrade"),
];

// Pool definitions: each board slot above maps to a set of underlying
// concrete tile types. Resolved at landing-time so the same board cell
// can produce different flavors on repeat visits.
const TILE_POOLS: Partial<Record<Tile["type"], Tile["type"][]>> = {
  quick_cash_trap:   ["gold_loan_offer", "payday_loan", "margin_call"],
  tax_trouble:       ["tax_audit", "tax_arrears", "gst_notice"],
  bill_shock:        ["rent_hike", "fuel_price_hike", "insurance_premium", "loan_interest_spike", "subscription_creep"],
  unexpected_repair: ["vehicle_breakdown", "home_repair", "traffic_fine"],
  life_event:        ["baby", "school_fees", "festival_expense", "vacation", "dinner"],
  family_care:       ["parents_medical", "elderly_care_hire", "pet_adoption"],
  monthly_bills:     ["electricity_bill", "society_maintenance"],
  green_upgrade:     ["ev_switch", "solar_install"],
};

/** If `tile` is a pool slot, return a synthetic Tile of a randomly-picked
 *  underlying type. Otherwise returns the tile unchanged. */
export const resolvePoolTile = (tile: Tile): Tile => {
  const pool = TILE_POOLS[tile.type];
  if (!pool || pool.length === 0) return tile;
  const pickedType = pool[Math.floor(Math.random() * pool.length)];
  return { ...tile, type: pickedType };
};

export const calculateMonthlyCashFlow = (state: GameState): number => {
  const totalIncome = (state.salary ?? 0) + (state.passiveIncome ?? 0);
  return totalIncome - calculateTotalExpenses(state);
};

export const calculateTotalExpenses = (state: GameState): number => {
  // Liabilities are outstanding debts only — they affect net worth, never monthly outflow.
  return (state.expenses ?? []).reduce((sum, e) => sum + (e.monthlyAmount ?? 0), 0);
};

/** Sum of all outstanding debt principal across liabilities. */
export const calculateOutstandingDebt = (state: GameState): number =>
  (state.liabilities ?? []).reduce((sum, l) => sum + (l.principal ?? 0), 0);

/** Sum of all recurring expenses (rent, bills, subscriptions). */
export const calculateRecurringExpenses = (state: GameState): number =>
  (state.expenses ?? []).reduce((sum, e) => sum + (e.monthlyAmount ?? 0), 0);

export const calculateNetWorth = (state: GameState): number => {
  const totalAssets = (state.assets ?? []).reduce((sum, a) => sum + (a.value ?? 0), 0);
  const totalLiabilities = (state.liabilities ?? []).reduce((sum, l) => sum + (l.principal ?? 0), 0);
  return (state.cash ?? 0) + totalAssets - totalLiabilities;
};

export const handleTileEffect = (state: GameState, tile: Tile): GameState => {
  const newState: GameState = {
    ...state,
    liabilities: [...state.liabilities],
    expenses: [...state.expenses],
    assets: [...state.assets],
  };
  let logMessage = "";
  let lessonMessage: string | null = null;

  switch (tile.type) {
    case "payday":
      const cashFlow = calculateMonthlyCashFlow(state);
      newState.cash += cashFlow;
      logMessage = `Pay Day! Received ₹${cashFlow.toLocaleString()} (Monthly Cash Flow)`;
      break;

    case "opportunity":
      const opp = INVESTMENT_OPPORTUNITIES[Math.floor(Math.random() * INVESTMENT_OPPORTUNITIES.length)];
      newState.pendingDecision = {
        type: "opportunity",
        opportunity: opp,
      };
      const riskLabel = opp.risk === "low" ? "🟢 Low" : opp.risk === "medium" ? "🟡 Medium" : "🔴 High";
      logMessage = `Opportunity (${riskLabel} Risk): ${opp.name} for ₹${opp.cost.toLocaleString()}`;
      break;

    case "market":
      // Market events affect investments based on risk level
      // If a hint was generated, bias the outcome toward it
      let isBoom: boolean;
      if (state.marketHint?.sentiment === "bullish") {
        isBoom = Math.random() < 0.8;
      } else if (state.marketHint?.sentiment === "bearish") {
        isBoom = Math.random() < 0.2;
      } else {
        isBoom = Math.random() > 0.5;
      }
      
      // Risk multipliers: high-risk assets are more volatile
      const riskMultipliers = {
        low: isBoom ? 1.03 : 0.98,    // ±2-3% for low risk
        medium: isBoom ? 1.08 : 0.92,  // ±8% for medium risk
        high: isBoom ? 1.20 : 0.75,    // +20% / -25% for high risk
      };
      
      let totalValueChange = 0;
      let totalIncomeChange = 0;
      newState.assets = newState.assets.map(a => {
        const multiplier = riskMultipliers[a.risk] || riskMultipliers.medium;
        const oldValue = a.value;
        const newValue = Math.round(a.value * multiplier);
        // Monthly income scales with the asset's new value (rents, dividends, yields all move with valuation).
        const newIncome = Math.round(a.monthlyIncome * multiplier);
        totalValueChange += newValue - oldValue;
        totalIncomeChange += newIncome - a.monthlyIncome;
        return { ...a, value: newValue, monthlyIncome: newIncome };
      });
      // Keep aggregate passive income in sync with per-asset changes so the financial model stays correct.
      newState.passiveIncome = Math.max(0, newState.passiveIncome + totalIncomeChange);

      if (newState.assets.length === 0) {
        logMessage = isBoom 
          ? "Market Boom! But you have no investments to benefit." 
          : "Market Dip! Good thing you have no investments at risk.";
      } else {
        const changeText = totalValueChange >= 0 
          ? `+₹${totalValueChange.toLocaleString()}` 
          : `-₹${Math.abs(totalValueChange).toLocaleString()}`;
        logMessage = isBoom 
          ? `📈 Market Boom! Portfolio ${changeText}. High-risk assets gained 20%!` 
          : `📉 Market Crash! Portfolio ${changeText}. High-risk assets lost 25%!`;
      }
      newState.marketCondition = isBoom ? "boom" : "crash";
      lessonMessage = "💡 High-risk assets are more volatile — they gain more in booms but lose more in crashes.";
      break;

    case "charity":
      const charityAmount = 5000;
      newState.pendingDecision = {
        type: "charity",
        charityAmount,
      };
      logMessage = `Charity opportunity! You can donate ₹${charityAmount.toLocaleString()}`;
      break;

    case "baby": {
      const babyExpense = 16000;
      addExpense(newState, {
        name: "Child Expenses",
        category: "childcare",
        monthlyAmount: babyExpense,
        essential: true,
      });
      logMessage = `👶 Baby! Monthly expenses increased by ₹${babyExpense.toLocaleString()}.`;
      break;
    }

    case "vacation":
      const vacationCost = 30000;
      newState.cash -= vacationCost;
      logMessage = `Vacation! Spent ₹${vacationCost.toLocaleString()}`;
      break;

    case "dinner":
      const dinnerCost = 5000;
      newState.cash -= dinnerCost;
      logMessage = `Dinner Out! Spent ₹${dinnerCost.toLocaleString()}`;
      break;

    case "downsized":
      newState.salary = Math.round(newState.salary * 0.8);
      logMessage = `Downsized! Salary reduced to ₹${newState.salary.toLocaleString()}`;
      break;

    case "tax_audit": {
      let penalty: number;
      if (newState.cash > 500000) {
        penalty = Math.round(newState.cash * 0.08);
      } else if (newState.cash > 0) {
        penalty = 20000;
      } else {
        penalty = Math.floor(Math.random() * 130000) + 20000;
      }
      newState.cash -= penalty;
      logMessage = `🔍 Tax Audit! The IT department reviewed your finances — penalty ₹${penalty.toLocaleString()}`;
      break;
    }

    case "medical_emergency": {
      let cost = Math.floor(Math.random() * 250000) + 50000;
      const hasInsurance =
        newState.assets.some(a => /insurance/i.test(a.name)) ||
        newState.expenses.some(e => e.category === "insurance" && /medical|health/i.test(e.name));
      if (hasInsurance) cost = Math.round(cost * 0.4);
      if (newState.cash >= cost) {
        newState.cash -= cost;
        logMessage = `🏥 Medical Emergency! Paid ₹${cost.toLocaleString()} in full.`;
      } else {
        newState.cash = Math.max(0, newState.cash);
        addLiability(newState, {
          name: "Medical Debt",
          category: "medical_debt",
          principal: cost,
          interestRate: 13,
        });
        logMessage = `🏥 Medical Emergency! ₹${cost.toLocaleString()} added as Medical Debt @ 13% p.a.`;
      }
      break;
    }

    case "side_hustle": {
      const earn = Math.floor(Math.random() * 60000) + 15000;
      newState.cash += earn;
      if (Math.random() < 0.3) {
        newState.assets.push({
          id: `side-${Date.now()}`,
          name: "Side Business",
          value: 50000,
          monthlyIncome: 5000,
          risk: "medium",
        });
        newState.passiveIncome += 5000;
        logMessage = `💼 Side Hustle pays off! Earned ₹${earn.toLocaleString()} + became a Side Business (+₹5,000/mo).`;
      } else {
        logMessage = `💼 Side Hustle pays off! Earned ₹${earn.toLocaleString()}.`;
      }
      break;
    }

    case "inheritance": {
      const amt = Math.floor(Math.random() * 800000) + 200000;
      newState.cash += amt;
      // 50% auto-invest into FD
      if (Math.random() < 0.5 && newState.cash >= amt) {
        const invest = Math.round(amt / 2);
        newState.cash -= invest;
        newState.assets.push({
          id: `inh-${Date.now()}`,
          name: "Fixed Deposit (Inheritance)",
          value: invest,
          monthlyIncome: Math.round(invest * 0.006),
          risk: "low",
        });
        newState.passiveIncome += Math.round(invest * 0.006);
        logMessage = `🎁 Inheritance! Received ₹${amt.toLocaleString()} — half invested in FD.`;
      } else {
        logMessage = `🎁 Inheritance received! ₹${amt.toLocaleString()} added to cash.`;
      }
      break;
    }

    case "real_estate_boom": {
      const realEstateNames = /(real estate|property|rental|reit|commercial|plot)/i;
      const re = newState.assets.filter(a => realEstateNames.test(a.name));
      if (re.length > 0) {
        let gain = 0;
        let incomeGain = 0;
        newState.assets = newState.assets.map(a => {
          if (realEstateNames.test(a.name)) {
            const newVal = Math.round(a.value * 1.25);
            const newInc = Math.round(a.monthlyIncome * 1.10);
            gain += newVal - a.value;
            incomeGain += newInc - a.monthlyIncome;
            return { ...a, value: newVal, monthlyIncome: newInc };
          }
          return a;
        });
        newState.passiveIncome += incomeGain;
        logMessage = `🏠 Real Estate Boom! Property values +₹${gain.toLocaleString()}, passive income +₹${incomeGain.toLocaleString()}/mo.`;
      } else {
        // Offer small plot via opportunity decision
        newState.pendingDecision = {
          type: "opportunity",
          opportunity: {
            name: "Small Plot of Land",
            cost: 300000,
            income: 8000,
            value: 300000,
            risk: "medium",
            description: "Buy a small plot riding the real estate boom — ₹8,000/mo rent.",
          },
        };
        logMessage = `🏠 Real Estate Boom! A small plot is on offer for ₹3,00,000.`;
      }
      break;
    }

    case "stock_market_crash": {
      const highRiskRegex = /(startup|crypto|franchise)/i;
      const high = newState.assets.filter(a => a.risk === "high" || highRiskRegex.test(a.name));
      if (high.length === 0) {
        logMessage = `📉 Stock Market Crash! You were safe from the crash.`;
      } else {
        let lost = 0;
        let incLost = 0;
        newState.assets = newState.assets.map(a => {
          if (a.risk === "high" || highRiskRegex.test(a.name)) {
            const newVal = Math.round(a.value * 0.6);
            const newInc = Math.round(a.monthlyIncome * 0.7);
            lost += a.value - newVal;
            incLost += a.monthlyIncome - newInc;
            return { ...a, value: newVal, monthlyIncome: newInc };
          }
          return a;
        });
        newState.passiveIncome = Math.max(0, newState.passiveIncome - incLost);
        newState.marketCondition = "crash";
        logMessage = `📉 Stock Market Crash! High-risk assets lost ₹${lost.toLocaleString()} in value, -₹${incLost.toLocaleString()}/mo.`;
      }
      break;
    }

    case "rate_hike": {
      const hikePct = 10 + Math.floor(Math.random() * 11);
      newState.liabilities = newState.liabilities.map(l => ({
        ...l,
        interestRate: Math.round((l.interestRate + l.interestRate * hikePct / 100) * 10) / 10,
      }));
      logMessage = newState.liabilities.length
        ? `📈 RBI hikes rates! Interest rates on all your loans are up ${hikePct}% (informational).`
        : `📈 RBI hikes rates by ${hikePct}% — but you have no loans. Phew.`;
      break;
    }

    case "insurance_premium": {
      const existing = newState.expenses.find(e => e.category === "insurance");
      if (existing) {
        const newAmt = Math.round(existing.monthlyAmount * 1.15);
        newState.expenses = newState.expenses.map(e =>
          e.id === existing.id ? { ...e, monthlyAmount: newAmt } : e
        );
        logMessage = `🛡️ Insurance renewal! ${existing.name} premium up 15% to ₹${newAmt.toLocaleString()}/mo.`;
      } else {
        const premium = 3000 + Math.floor(Math.random() * 4000);
        addExpense(newState, {
          name: "Insurance Premium",
          category: "insurance",
          monthlyAmount: premium,
          essential: true,
        });
        logMessage = `🛡️ You need insurance! Added ₹${premium.toLocaleString()}/mo insurance premium.`;
      }
      break;
    }

    case "home_repair": {
      const repairCost = 20000 + Math.floor(Math.random() * 80000);
      if (newState.cash >= repairCost) {
        newState.cash -= repairCost;
        logMessage = `🔧 Home Repair! Paid ₹${repairCost.toLocaleString()} for urgent repairs.`;
      } else {
        if (repairCost >= 60000) {
          const principal = repairCost + 50000;
          addLiability(newState, {
            name: "Home Renovation Loan",
            category: "home_loan",
            principal,
            interestRate: 10.5,
          });
          logMessage = `🔧 Home Renovation Loan taken — ₹${principal.toLocaleString()} outstanding @ 10.5% p.a.`;
        } else {
          addLiability(newState, {
            name: "Home Repair Loan",
            category: "personal_loan",
            principal: repairCost,
            interestRate: 14,
          });
          logMessage = `🔧 Home Repair! Couldn't afford it — added ₹${repairCost.toLocaleString()} as personal loan.`;
        }
      }
      break;
    }

    case "traffic_fine": {
      const fine = 2000 + Math.floor(Math.random() * 8000);
      newState.cash -= fine;
      logMessage = `🚦 Traffic Fine! Paid ₹${fine.toLocaleString()} in challan fees.`;
      break;
    }

    case "credit_card_bill": {
      const bill = 15000 + Math.floor(Math.random() * 35000);
      if (newState.cash >= bill) {
        newState.cash -= bill;
        logMessage = `💳 Credit Card Bill due! Paid ₹${bill.toLocaleString()}.`;
      } else {
        const existing = newState.liabilities.find(l => l.category === "credit_card");
        if (existing) {
          newState.liabilities = newState.liabilities.map(l =>
            l.id === existing.id
              ? { ...l, principal: l.principal + bill }
              : l
          );
        } else {
          addLiability(newState, {
            name: "Credit Card",
            category: "credit_card",
            principal: bill,
            interestRate: 36,
          });
        }
        logMessage = `💳 Credit Card Bill! Added ₹${bill.toLocaleString()} to outstanding card debt @ 36% p.a.`;
      }
      break;
    }

    case "school_fees": {
      const hasChild = newState.expenses.some(e => e.category === "childcare" || /child/i.test(e.name));
      if (hasChild) {
        const fees = 25000 + Math.floor(Math.random() * 50000);
        newState.cash -= fees;
        logMessage = `🎒 School fees due! Paid ₹${fees.toLocaleString()} for the term.`;
      } else {
        logMessage = `🎒 School fees notice — but you have no children yet. Skipped.`;
      }
      break;
    }

    case "festival_expense": {
      const festCost = 10000 + Math.floor(Math.random() * 40000);
      newState.cash -= festCost;
      logMessage = `🪔 Festival season! Spent ₹${festCost.toLocaleString()} on celebrations and gifts.`;
      const hasFestFund = newState.expenses.some(e => /festival fund/i.test(e.name));
      if (!hasFestFund && Math.random() < 0.6) {
        addExpense(newState, {
          name: "Society Festival Fund (Ganpati/Diwali)",
          category: "maintenance",
          monthlyAmount: 600,
          essential: false,
        });
        lessonMessage = "💡 Society collections feel small but add up — they're a real recurring expense.";
      }
      if (Math.random() < 0.2) {
        const principal = 60000 + Math.floor(Math.random() * 90000);
        addLiability(newState, {
          name: "Chit Fund Default",
          category: "personal_loan",
          principal,
          interestRate: 18,
        });
        logMessage += ` Chit fund payout missed — ₹${principal.toLocaleString()} now owed to the group.`;
      }
      break;
    }

    case "electricity_bill": {
      const bill = 3000 + Math.floor(Math.random() * 7000);
      newState.cash -= bill;
      logMessage = `⚡ Electricity bill! Paid ₹${bill.toLocaleString()} — summer AC costs hit hard.`;
      break;
    }

    case "rent_hike": {
      const rentExpense = newState.expenses.find(e => e.category === "rent");
      if (rentExpense) {
        const hike = Math.round(rentExpense.monthlyAmount * 0.15);
        newState.expenses = newState.expenses.map(e =>
          e.id === rentExpense.id ? { ...e, monthlyAmount: e.monthlyAmount + hike } : e
        );
        logMessage = `🏠 Rent Hike! Landlord raised rent by ₹${hike.toLocaleString()}/mo.`;
      } else {
        addExpense(newState, {
          name: "Home Rent",
          category: "rent",
          monthlyAmount: 15000,
          essential: true,
        });
        logMessage = `🏠 Rent Hike! New rental added — ₹15,000/mo.`;
      }
      break;
    }

    case "vehicle_breakdown": {
      const repairCost = 8000 + Math.floor(Math.random() * 32000);
      if (newState.cash >= repairCost) {
        newState.cash -= repairCost;
        logMessage = `🚗 Vehicle Breakdown! Paid ₹${repairCost.toLocaleString()} in repair costs.`;
      } else {
        addLiability(newState, {
          name: "Vehicle Repair Loan",
          category: "vehicle_loan",
          principal: repairCost,
          interestRate: 13,
        });
        logMessage = `🚗 Vehicle Breakdown! Added ₹${repairCost.toLocaleString()} repair loan @ 13% p.a.`;
      }
      break;
    }

    case "loan_interest_spike": {
      const floatingLoans = newState.liabilities.filter(
        l => l.category === "home_loan" || l.category === "personal_loan"
      );
      if (floatingLoans.length > 0) {
        const spikePct = 1 + Math.floor(Math.random() * 3); // +1 to +3 percentage points
        const ids = new Set(floatingLoans.map(l => l.id));
        newState.liabilities = newState.liabilities.map(l =>
          ids.has(l.id) ? { ...l, interestRate: l.interestRate + spikePct } : l
        );
        logMessage = `🏦 Floating rate spike! Home/personal loan interest rates up by ${spikePct}% (informational).`;
      } else {
        const penalty = 5000 + Math.floor(Math.random() * 10000);
        newState.cash -= penalty;
        logMessage = `🏦 Bank processing fee! Paid ₹${penalty.toLocaleString()} in charges.`;
      }
      break;
    }

    case "society_maintenance": {
      const fee = 2500 + Math.floor(Math.random() * 5000);
      const existing = newState.expenses.find(e => e.category === "maintenance");
      if (!existing) {
        addExpense(newState, {
          name: "Society Maintenance",
          category: "maintenance",
          monthlyAmount: fee,
          essential: true,
        });
        logMessage = `🏢 Society maintenance added — ₹${fee.toLocaleString()}/mo ongoing.`;
      } else {
        newState.cash -= fee;
        logMessage = `🏢 Annual society maintenance paid — ₹${fee.toLocaleString()}.`;
      }
      break;
    }

    case "gold_loan_offer": {
      // Pawn family gold for fast cash.
      const principal = 80000 + Math.floor(Math.random() * 170000);
      newState.cash += principal;
      newState.loansTaken += 1;
      addLiability(newState, {
        name: "Gold Loan",
        category: "gold_loan",
        principal,
        interestRate: 12,
      });
      logMessage = `🪙 Gold Loan! Pawned family gold — +₹${principal.toLocaleString()} cash, added as debt @ 12% p.a.`;
      break;
    }

    case "wedding_in_family": {
      const cost = 300000 + Math.floor(Math.random() * 700000);
      if (newState.cash >= cost) {
        newState.cash -= cost;
        logMessage = `💍 Wedding in the family! Spent ₹${cost.toLocaleString()} from savings.`;
      } else {
        const paid = Math.max(0, newState.cash);
        const shortfall = cost - paid;
        newState.cash -= paid;
        addLiability(newState, {
          name: "Wedding Loan",
          category: "personal_loan",
          principal: shortfall,
          interestRate: 15,
        });
        logMessage = `💍 Wedding! Paid ₹${paid.toLocaleString()}, rest ₹${shortfall.toLocaleString()} financed @ 15% p.a.`;
      }
      break;
    }

    case "subscription_creep": {
      const apps = ["Netflix", "Spotify Premium", "Hotstar", "Prime Video", "iCloud+", "ChatGPT Plus", "YouTube Premium"];
      const name = apps[Math.floor(Math.random() * apps.length)];
      const monthly = 200 + Math.floor(Math.random() * 1800);
      addExpense(newState, {
        name,
        category: "subscription",
        monthlyAmount: monthly,
        essential: false,
      });
      logMessage = `📺 Subscription Creep! You signed up for ${name} — ₹${monthly.toLocaleString()}/mo on auto-debit.`;
      lessonMessage = "💡 Small recurring charges silently inflate your monthly burn. Audit them quarterly.";
      const hasCloud = newState.expenses.some(e => /cloud storage/i.test(e.name));
      if (!hasCloud && Math.random() < 0.5) {
        addExpense(newState, {
          name: "Cloud Storage & App Subscriptions",
          category: "subscription",
          monthlyAmount: 350,
          essential: false,
        });
      }
      break;
    }

    case "fuel_price_hike": {
      const transport = newState.expenses.filter(e => e.category === "transport");
      if (transport.length === 0) {
        const penalty = 1500 + Math.floor(Math.random() * 2500);
        newState.cash -= penalty;
        logMessage = `⛽ Fuel price hike! You drove minimally — only ₹${penalty.toLocaleString()} extra this month.`;
      } else {
        const pct = 10 + Math.floor(Math.random() * 16);
        let extra = 0;
        newState.expenses = newState.expenses.map(e => {
          if (e.category !== "transport") return e;
          const bump = Math.round(e.monthlyAmount * pct / 100);
          extra += bump;
          return { ...e, monthlyAmount: e.monthlyAmount + bump };
        });
        logMessage = `⛽ Fuel price hike (+${pct}%)! Transport costs rose by ₹${extra.toLocaleString()}/mo.`;
      }
      break;
    }

    case "parents_medical": {
      const cost = 25000 + Math.floor(Math.random() * 75000);
      const hasParentInsurance = newState.expenses.some(
        e => e.category === "insurance" && /parent|senior/i.test(e.name)
      );
      if (newState.cash >= cost) {
        newState.cash -= cost;
        logMessage = `👴 Parents needed medical care. Paid ₹${cost.toLocaleString()} from cash.`;
      } else {
        addLiability(newState, {
          name: "Parents Medical Debt",
          category: "medical_debt",
          principal: cost,
          interestRate: 12,
        });
        logMessage = `👴 Parents medical emergency! ₹${cost.toLocaleString()} added as debt (₹4,000/mo).`;
      }
      if (!hasParentInsurance && Math.random() < 0.5) {
        addExpense(newState, {
          name: "Parents' Health Insurance",
          category: "insurance",
          monthlyAmount: 3500,
          essential: true,
        });
        lessonMessage = "💡 You bought parents' health cover — +₹3,500/mo, future hits will be softer.";
      }
      break;
    }

    case "gst_notice": {
      const isBiz =
        newState.profession === "Business Owner" ||
        newState.profession === "Lawyer" ||
        newState.liabilities.some(l => l.category === "business_loan");
      const base = isBiz ? 25000 + Math.floor(Math.random() * 75000) : 5000 + Math.floor(Math.random() * 10000);
      newState.cash -= base;
      logMessage = isBiz
        ? `🧾 GST Notice! Compliance shortfall — paid ₹${base.toLocaleString()} in dues + penalty.`
        : `🧾 Tax notice! Filed late — penalty ₹${base.toLocaleString()}.`;
      break;
    }

    case "bonus": {
      const bonus = Math.round(newState.salary * (0.5 + Math.random() * 2));
      newState.cash += bonus;
      logMessage = `🎉 Performance Bonus! +₹${bonus.toLocaleString()} credited.`;
      break;
    }

    case "tax_refund": {
      const refund = 8000 + Math.floor(Math.random() * 42000);
      newState.cash += refund;
      logMessage = `💸 Tax Refund! ₹${refund.toLocaleString()} from the IT department.`;
      break;
    }

    case "bnpl_trap": {
      // Buy Now Pay Later — adds debt to your liability stack with a 24% informational rate.
      const gadgets = ["iPhone", "OLED TV", "Gaming Laptop", "Smartwatch", "DSLR Camera", "Air Fryer Pro"];
      const item = gadgets[Math.floor(Math.random() * gadgets.length)];
      const principal = 30000 + Math.floor(Math.random() * 120000);
      addLiability(newState, {
        name: `BNPL: ${item}`,
        category: "bnpl",
        principal,
        interestRate: 24,
      });
      logMessage = `🛍️ BNPL Trap! "${item}" financed — ₹${principal.toLocaleString()} added to outstanding debt.`;
      lessonMessage = "💡 Even 'no-cost' financing adds real principal you'll have to pay back.";
      break;
    }

    case "solar_install": {
      // Rooftop solar — adds a personal loan but PERMANENTLY cuts the electricity bill.
      const principal = 150000;
      addLiability(newState, {
        name: "Solar Rooftop Loan",
        category: "personal_loan",
        principal,
        interestRate: 9,
      });
      const elec = newState.expenses.find(e => e.category === "utilities" && /electric/i.test(e.name));
      let saved = 0;
      if (elec) {
        const cut = Math.round(elec.monthlyAmount * 0.6);
        saved = cut;
        newState.expenses = newState.expenses.map(e =>
          e.id === elec.id ? { ...e, monthlyAmount: e.monthlyAmount - cut } : e
        );
      }
      logMessage = saved > 0
        ? `☀️ Solar Installed! +₹${principal.toLocaleString()} loan added, but electricity bill -₹${saved.toLocaleString()}/mo forever.`
        : `☀️ Solar Installed! New ₹${principal.toLocaleString()} loan added (no electricity bill to offset yet).`;
      lessonMessage = "💡 Smart liabilities can pay for themselves over time — recurring savings matter.";
      break;
    }

    case "ev_switch": {
      // Trade in petrol vehicle: new vehicle loan, but transport (fuel) expenses halved.
      const principal = 600000;
      addLiability(newState, {
        name: "EV Auto Loan",
        category: "vehicle_loan",
        principal,
        interestRate: 8.5,
      });
      let fuelCut = 0;
      newState.expenses = newState.expenses.map(e => {
        if (e.category === "transport") {
          const cut = Math.round(e.monthlyAmount * 0.5);
          fuelCut += cut;
          return { ...e, monthlyAmount: e.monthlyAmount - cut };
        }
        return e;
      });
      logMessage = fuelCut > 0
        ? `🔋 Switched to EV! +₹${principal.toLocaleString()} auto loan added, transport costs -₹${fuelCut.toLocaleString()}/mo.`
        : `🔋 Switched to EV! New ₹${principal.toLocaleString()} auto loan added.`;
      break;
    }

    case "streaming_audit": {
      // Audit your subscription stack — cut 40% off recurring subs.
      const subs = newState.expenses.filter(e => e.category === "subscription");
      if (subs.length === 0) {
        logMessage = `✂️ Subscription audit — nothing to cut. Stay disciplined!`;
      } else {
        let saved = 0;
        newState.expenses = newState.expenses.map(e => {
          if (e.category !== "subscription") return e;
          const cut = Math.round(e.monthlyAmount * 0.4);
          saved += cut;
          return { ...e, monthlyAmount: e.monthlyAmount - cut };
        });
        logMessage = `✂️ OTT Audit! Cancelled overlapping subscriptions — saved ₹${saved.toLocaleString()}/mo.`;
        lessonMessage = "💡 Auditing subscriptions every quarter is one of the highest-ROI financial habits.";
      }
      break;
    }

    case "pet_adoption": {
      // New family member — recurring pet expense + small one-time setup.
      const setup = 8000 + Math.floor(Math.random() * 12000);
      newState.cash -= setup;
      addExpense(newState, {
        name: "Pet Care",
        category: "pet",
        monthlyAmount: 3500,
        essential: true,
      });
      logMessage = `🐶 You adopted a pet! Setup ₹${setup.toLocaleString()} + ₹3,500/mo for food, vet & grooming.`;
      break;
    }

    case "elderly_care_hire": {
      // Hire a caregiver — high recurring expense, but prevents future parents_medical hits.
      const existing = newState.expenses.find(e => e.category === "eldercare");
      if (existing) {
        const bump = Math.round(existing.monthlyAmount * 0.1);
        newState.expenses = newState.expenses.map(e =>
          e.id === existing.id ? { ...e, monthlyAmount: e.monthlyAmount + bump } : e
        );
        logMessage = `🧓 Caregiver salary revision: +₹${bump.toLocaleString()}/mo (now ₹${(existing.monthlyAmount + bump).toLocaleString()}).`;
      } else {
        addExpense(newState, {
          name: "Live-in Caregiver",
          category: "eldercare",
          monthlyAmount: 8000,
          essential: true,
        });
        logMessage = `🧓 Hired a live-in caregiver for parents — ₹8,000/mo recurring.`;
        lessonMessage = "💡 Eldercare is a long-tail expense that's often missed in retirement planning.";
      }
      break;
    }

    case "payday_loan": {
      // Half the time it's a sketchy NBFC instant-app loan flavor.
      const isApp = Math.random() < 0.5;
      const principal = isApp
        ? 15000 + Math.floor(Math.random() * 35000)
        : 40000 + Math.floor(Math.random() * 60000);
      const apr = isApp ? 28 + Math.floor(Math.random() * 9) : 48;
      newState.cash += principal;
      newState.loansTaken += 1;
      addLiability(newState, {
        name: isApp ? "NBFC Instant App Loan" : "Payday Loan",
        category: "payday_loan",
        principal,
        interestRate: apr,
      });
      logMessage = isApp
        ? `📱 NBFC Instant App Loan! +₹${principal.toLocaleString()} in seconds @ ${apr}% APR.`
        : `💸 Payday Loan! +₹${principal.toLocaleString()} cash now @ 48% APR.`;
      lessonMessage = "💡 Quick-cash loans compound viciously — avoid unless truly desperate.";
      break;
    }

    case "margin_call": {
      const hasHighRisk = newState.assets.some(a => a.risk === "high");
      const hasStocks = newState.assets.some(a => /stock|equity|mutual|crypto|startup/i.test(a.name));
      if (hasHighRisk || hasStocks) {
        const principal = 200000 + Math.floor(Math.random() * 300000);
        const isLAS = hasStocks && !hasHighRisk;
        addLiability(newState, {
          name: isLAS ? "Loan Against Securities" : "Margin Loan",
          category: "margin_loan",
          principal,
          interestRate: isLAS ? 11 : 18,
        });
        logMessage = `📞 Margin Call! Broker financed your high-risk losses — ₹${principal.toLocaleString()} added to outstanding debt.`;
        lessonMessage = "💡 Leveraged investing magnifies losses. Margin loans survive even when the trade dies.";
      } else {
        const fee = 3000 + Math.floor(Math.random() * 5000);
        newState.cash -= fee;
        logMessage = `📞 Broker called — no margin position to liquidate. Paid ₹${fee.toLocaleString()} account fee.`;
      }
      break;
    }

    case "tax_arrears": {
      // Old returns flagged — owe past taxes as a structured debt.
      const arrears = 60000 + Math.floor(Math.random() * 140000);
      addLiability(newState, {
        name: "Tax Arrears (IT Dept)",
        category: "tax_arrears",
        principal: arrears,
        interestRate: 12,
      });
      logMessage = `🧾 Tax Arrears! IT Dept demands ₹${arrears.toLocaleString()} from past filings — added as debt @ 12% p.a.`;
      break;
    }
  }

  pushLog(newState, logMessage);
  if (lessonMessage) pushLog(newState, lessonMessage);

  // Clear any market hint that has now resolved (or stale after any roll)
  newState.marketHint = null;

  // Check win condition — only valid after at least one investment
  if (
    newState.assets.length > 0 &&
    newState.passiveIncome >= calculateTotalExpenses(newState) &&
    !newState.hasEscapedRatRace
  ) {
    newState.hasEscapedRatRace = true;
    pushLog(newState, "🎉 You escaped the Rat Race! Passive income covers all expenses!");
  }

  // Primary win: ₹5 Crore in cash
  if (newState.cash >= 50000000 && !newState.hasReachedFiveCrore) {
    newState.hasReachedFiveCrore = true;
    pushLog(newState, "🏆 You reached ₹5 Crore in cash!");
  }

  return newState;
};

export const applyCharityDecision = (state: GameState, accept: boolean): GameState => {
  const newState = { ...state, pendingDecision: null };
  
  if (accept && state.pendingDecision?.charityAmount) {
    newState.cash -= state.pendingDecision.charityAmount;
    pushLog(newState, `Donated ₹${state.pendingDecision.charityAmount.toLocaleString()} to charity!`);
  } else {
    pushLog(newState, "Declined charity donation.");
  }
  
  return newState;
};

export const applyOpportunityDecision = (state: GameState, accept: boolean): GameState => {
  const newState = { ...state, pendingDecision: null };
  const opp = state.pendingDecision?.opportunity;
  
  if (accept && opp) {
    if (newState.cash >= opp.cost) {
      newState.cash -= opp.cost;
      newState.assets.push({
        id: `asset-${Date.now()}`,
        name: opp.name,
        value: opp.value,
        monthlyIncome: opp.income,
        risk: opp.risk,
      });
      newState.passiveIncome += opp.income;
      pushLog(newState, `Invested in ${opp.name}! Monthly income: +₹${opp.income.toLocaleString()}`);
    } else {
      pushLog(newState, `Insufficient funds for ${opp.name} (need ₹${opp.cost.toLocaleString()})`);
    }
  } else {
    pushLog(newState, "Passed on investment opportunity.");
  }
  
  // Check win condition after investment (only after at least one asset exists)
  if (
    newState.assets.length > 0 &&
    newState.passiveIncome >= calculateTotalExpenses(newState) &&
    !newState.hasEscapedRatRace
  ) {
    newState.hasEscapedRatRace = true;
    pushLog(newState, "🎉 You escaped the Rat Race! Passive income covers all expenses!");
  }
  
  return newState;
};

const MARKET_NEWS: MarketHint[] = [
  { sentiment: "bullish", headline: "📰 Tech sector surges as quarterly earnings beat expectations" },
  { sentiment: "bullish", headline: "📰 Central bank cuts interest rates — investors cheer" },
  { sentiment: "bullish", headline: "📰 Real estate demand hits record highs this quarter" },
  { sentiment: "bullish", headline: "📰 Crypto rally continues as institutional money pours in" },
  { sentiment: "bearish", headline: "📰 Inflation fears spook markets — sell-off looms" },
  { sentiment: "bearish", headline: "📰 Geopolitical tensions rattle global investors" },
  { sentiment: "bearish", headline: "📰 Major bank reports losses — markets jittery" },
  { sentiment: "bearish", headline: "📰 Crypto regulation crackdown sparks panic selling" },
  { sentiment: "neutral", headline: "📰 Analysts split on market direction this week" },
  { sentiment: "neutral", headline: "📰 Mixed signals from economic data leave traders cautious" },
];

export const generateMarketHint = (): MarketHint => {
  return MARKET_NEWS[Math.floor(Math.random() * MARKET_NEWS.length)];
};

export const sellAsset = (state: GameState, assetId: string): GameState => {
  const asset = state.assets.find(a => a.id === assetId);
  if (!asset) return state;

  const newState = { ...state };
  newState.cash += asset.value;
  newState.passiveIncome = Math.max(0, newState.passiveIncome - asset.monthlyIncome);
  newState.assets = newState.assets.filter(a => a.id !== assetId);
  pushLog(newState, `Sold ${asset.name} for ₹${asset.value.toLocaleString()} (lost ₹${asset.monthlyIncome.toLocaleString()}/mo income)`);
  return newState;
};

/**
 * Repay a specific liability by `amount` rupees from cash.
 * Full repayment removes the liability entirely.
 * Partial repayment shrinks the outstanding principal.
 */
export const repayLiability = (
  state: GameState,
  liabilityId: string,
  amount: number,
): { state: GameState; ok: boolean; error?: string } => {
  const liability = state.liabilities.find(l => l.id === liabilityId);
  if (!liability) return { state, ok: false, error: "Loan not found." };
  const pay = Math.min(Math.max(0, Math.floor(amount)), liability.principal);
  if (pay <= 0) return { state, ok: false, error: "Enter an amount greater than zero." };
  if (state.cash < pay) return { state, ok: false, error: "Insufficient cash for this repayment." };

  const next: GameState = { ...state, liabilities: [...state.liabilities] };
  next.cash -= pay;

  if (pay >= liability.principal) {
    next.liabilities = next.liabilities.filter(l => l.id !== liabilityId);
    pushLog(next, `✅ Fully repaid ${liability.name} (₹${pay.toLocaleString()}). Debt cleared.`);
  } else {
    next.liabilities = next.liabilities.map(l =>
      l.id === liabilityId
        ? { ...l, principal: l.principal - pay }
        : l
    );
    pushLog(next, `💰 Part-paid ${liability.name} (₹${pay.toLocaleString()}). Outstanding: ₹${(liability.principal - pay).toLocaleString()}.`);
  }
  return { state: next, ok: true };
};

// Apply periodic mechanics based on turn number. Mutates a copy.
export const applyPeriodicMechanics = (
  state: GameState
): { state: GameState; events: string[] } => {
  const events: string[] = [];
  let next = { ...state, liabilities: [...state.liabilities], assets: [...state.assets] };

  // Inflation every 5 turns: recurring expenses +3% (liabilities are principal-only and unaffected).
  if (next.turnCount > 0 && next.turnCount % 5 === 0) {
    next.expenses = next.expenses.map(e => ({
      ...e,
      monthlyAmount: Math.round(e.monthlyAmount * 1.03),
    }));
    events.push("📈 Inflation! Your recurring expenses just went up.");
    pushLog(next, "📈 Inflation hit — all recurring expenses +3%.");
  }

  // Salary review every 8 turns: +5–15%
  if (next.turnCount > 0 && next.turnCount % 8 === 0) {
    const pct = 5 + Math.floor(Math.random() * 11);
    const oldSalary = next.salary;
    next.salary = Math.round(next.salary * (1 + pct / 100));
    events.push(`🎉 Salary review! +${pct}% (₹${oldSalary.toLocaleString()} → ₹${next.salary.toLocaleString()})`);
    pushLog(next, `🎉 Salary review: +${pct}% raise to ₹${next.salary.toLocaleString()}.`);
  }

  // Depreciation every 10 turns: non-real-estate assets -2% value
  if (next.turnCount > 0 && next.turnCount % 10 === 0) {
    const reRegex = /(real estate|property|rental|reit|commercial|plot)/i;
    next.assets = next.assets.map(a =>
      reRegex.test(a.name) ? a : { ...a, value: Math.round(a.value * 0.98) }
    );
  }

  return { state: next, events };
};
