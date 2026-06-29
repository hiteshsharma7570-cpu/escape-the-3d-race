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
  data: { name: string; category: LiabilityCategory; principal: number; monthlyEMI: number; interestRate: number }
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
  emi_hike:             { color: "#c0392b", gradient: "linear-gradient(135deg,#c0392b,#e74c3c)", icon: "📈" },
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
} as const;

const t = (id: number, type: keyof typeof G, label: string): Tile => ({
  id, type: type as Tile["type"], label, color: G[type].color, gradient: G[type].gradient, icon: G[type].icon,
});

export const BOARD_TILES: Tile[] = [
  t(0,  "payday",              "Pay Day"),
  t(1,  "opportunity",         "Opportunity"),
  t(2,  "electricity_bill",    "Electricity Bill"),
  t(3,  "market",              "Market"),
  t(4,  "tax_audit",           "Tax Audit"),
  t(5,  "credit_card_bill",    "Credit Card Bill"),
  t(6,  "payday",              "Pay Day"),
  t(7,  "baby",                "Baby!"),
  t(8,  "school_fees",         "School Fees"),
  t(9,  "medical_emergency",   "Medical"),
  t(10, "opportunity",         "Opportunity"),
  t(11, "traffic_fine",        "Traffic Fine"),
  t(12, "side_hustle",         "Side Hustle"),
  t(13, "market",              "Market"),
  t(14, "society_maintenance", "Society Fee"),
  t(15, "dinner",              "Dinner Out"),
  t(16, "downsized",           "Downsized!"),
  t(17, "home_repair",         "Home Repair"),
  t(18, "inheritance",         "Inheritance"),
  t(19, "payday",              "Pay Day"),
  t(20, "emi_hike",            "EMI Hike"),
  t(21, "real_estate_boom",    "RE Boom"),
  t(22, "opportunity",         "Opportunity"),
  t(23, "insurance_premium",   "Insurance"),
  t(24, "stock_market_crash",  "Crash"),
  t(25, "vacation",            "Vacation"),
  t(26, "festival_expense",    "Festival"),
  t(27, "payday",              "Pay Day"),
  t(28, "charity",             "Charity"),
  t(29, "rent_hike",           "Rent Hike"),
  t(30, "opportunity",         "Opportunity"),
  t(31, "tax_audit",           "Tax Audit"),
  t(32, "vehicle_breakdown",   "Vehicle Repair"),
  t(33, "market",              "Market"),
  t(34, "side_hustle",         "Side Hustle"),
  t(35, "loan_interest_spike", "Interest Spike"),
];

export const calculateMonthlyCashFlow = (state: GameState): number => {
  const totalIncome = state.salary + state.passiveIncome;
  const totalExpenses = state.liabilities.reduce((sum, l) => sum + l.monthlyPayment, 0);
  return totalIncome - totalExpenses;
};

export const calculateTotalExpenses = (state: GameState): number => {
  return state.liabilities.reduce((sum, l) => sum + l.monthlyPayment, 0);
};

export const calculateNetWorth = (state: GameState): number => {
  const totalAssets = state.assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = state.liabilities.reduce((sum, l) => sum + l.amount, 0);
  return state.cash + totalAssets - totalLiabilities;
};

export const handleTileEffect = (state: GameState, tile: Tile): GameState => {
  const newState = { ...state };
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

    case "baby":
      const babyExpense = 16000;
      newState.liabilities.push({
        id: `liability-${Date.now()}`,
        name: "Child Expenses",
        amount: 0,
        monthlyPayment: babyExpense,
      });
      logMessage = `Baby! Monthly expenses increased by ₹${babyExpense.toLocaleString()}`;
      break;

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
      const hasInsurance = newState.assets.some(a => /insurance/i.test(a.name));
      if (hasInsurance) cost = Math.round(cost * 0.4);
      if (newState.cash >= cost) {
        newState.cash -= cost;
        logMessage = `🏥 Medical Emergency! Paid ₹${cost.toLocaleString()} in full.`;
      } else {
        newState.cash = Math.max(0, newState.cash);
        newState.liabilities.push({
          id: `med-${Date.now()}`,
          name: "Medical Debt",
          amount: cost,
          monthlyPayment: 8000,
        });
        logMessage = `🏥 Medical Emergency! ₹${cost.toLocaleString()} added as Medical Debt (₹8,000/mo).`;
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

    case "emi_hike": {
      const hikePct = 10 + Math.floor(Math.random() * 11);
      newState.liabilities = newState.liabilities.map(l =>
        /loan|emi|mortgage/i.test(l.name)
          ? { ...l, monthlyPayment: Math.round(l.monthlyPayment * (1 + hikePct / 100)) }
          : l
      );
      const hikedLoans = state.liabilities.filter(l => /loan|emi|mortgage/i.test(l.name));
      const extra = hikedLoans.reduce((s, l) => s + Math.round(l.monthlyPayment * hikePct / 100), 0);
      logMessage = `📈 RBI hikes rates! All loan EMIs increased by ${hikePct}%. Monthly burden up by ₹${extra.toLocaleString()}.`;
      break;
    }

    case "insurance_premium": {
      const existing = newState.liabilities.find(l => /insurance/i.test(l.name));
      if (existing) {
        newState.liabilities = newState.liabilities.map(l =>
          /insurance/i.test(l.name)
            ? { ...l, monthlyPayment: Math.round(l.monthlyPayment * 1.15) }
            : l
        );
        logMessage = `🛡️ Insurance renewal! Premium increased by 15% to ₹${Math.round(existing.monthlyPayment * 1.15).toLocaleString()}/mo.`;
      } else {
        const premium = 3000 + Math.floor(Math.random() * 4000);
        newState.liabilities.push({
          id: `ins-${Date.now()}`,
          name: "Insurance Premium",
          amount: 0,
          monthlyPayment: premium,
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
        newState.liabilities.push({
          id: `repair-${Date.now()}`,
          name: "Home Repair Loan",
          amount: repairCost,
          monthlyPayment: 5000,
        });
        logMessage = `🔧 Home Repair! Can't afford it — added ₹${repairCost.toLocaleString()} as loan (₹5,000/mo).`;
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
        const existing = newState.liabilities.find(l => /credit card/i.test(l.name));
        if (existing) {
          newState.liabilities = newState.liabilities.map(l =>
            /credit card/i.test(l.name)
              ? { ...l, amount: l.amount + bill, monthlyPayment: l.monthlyPayment + 2000 }
              : l
          );
        } else {
          newState.liabilities.push({
            id: `cc-${Date.now()}`,
            name: "Credit Card Debt",
            amount: bill,
            monthlyPayment: 4000,
          });
        }
        logMessage = `💳 Credit Card Bill! Added ₹${bill.toLocaleString()} to card debt (+₹4,000/mo minimum).`;
      }
      break;
    }

    case "school_fees": {
      const hasChild = newState.liabilities.some(l => /child/i.test(l.name));
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
      break;
    }

    case "electricity_bill": {
      const bill = 3000 + Math.floor(Math.random() * 7000);
      newState.cash -= bill;
      logMessage = `⚡ Electricity bill! Paid ₹${bill.toLocaleString()} — summer AC costs hit hard.`;
      break;
    }

    case "rent_hike": {
      const rentLiability = newState.liabilities.find(l => /rent/i.test(l.name));
      if (rentLiability) {
        const hike = Math.round(rentLiability.monthlyPayment * 0.15);
        newState.liabilities = newState.liabilities.map(l =>
          /rent/i.test(l.name)
            ? { ...l, monthlyPayment: l.monthlyPayment + hike }
            : l
        );
        logMessage = `🏠 Rent Hike! Landlord raised rent by ₹${hike.toLocaleString()}/mo.`;
      } else {
        newState.liabilities.push({
          id: `rent-${Date.now()}`,
          name: "Home Rent",
          amount: 0,
          monthlyPayment: 15000,
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
        newState.liabilities.push({
          id: `vehicle-${Date.now()}`,
          name: "Vehicle Repair Loan",
          amount: repairCost,
          monthlyPayment: 3000,
        });
        logMessage = `🚗 Vehicle Breakdown! Added ₹${repairCost.toLocaleString()} repair loan (₹3,000/mo).`;
      }
      break;
    }

    case "loan_interest_spike": {
      const floatingLoans = newState.liabilities.filter(l =>
        /home loan|mortgage|personal loan/i.test(l.name)
      );
      if (floatingLoans.length > 0) {
        const spike = 1500 + Math.floor(Math.random() * 3500);
        newState.liabilities = newState.liabilities.map(l =>
          /home loan|mortgage|personal loan/i.test(l.name)
            ? { ...l, monthlyPayment: l.monthlyPayment + spike }
            : l
        );
        logMessage = `🏦 Floating rate spike! Home/personal loan payments up by ₹${spike.toLocaleString()}/mo.`;
      } else {
        const penalty = 5000 + Math.floor(Math.random() * 10000);
        newState.cash -= penalty;
        logMessage = `🏦 Bank processing fee! Paid ₹${penalty.toLocaleString()} in charges.`;
      }
      break;
    }

    case "society_maintenance": {
      const fee = 2500 + Math.floor(Math.random() * 5000);
      const existing = newState.liabilities.find(l => /society|maintenance/i.test(l.name));
      if (!existing) {
        newState.liabilities.push({
          id: `society-${Date.now()}`,
          name: "Society Maintenance",
          amount: 0,
          monthlyPayment: fee,
        });
        logMessage = `🏢 Society maintenance added — ₹${fee.toLocaleString()}/mo ongoing.`;
      } else {
        newState.cash -= fee;
        logMessage = `🏢 Annual society maintenance paid — ₹${fee.toLocaleString()}.`;
      }
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

  // Primary win: ₹10 Crore in cash
  if (newState.cash >= 100000000 && !newState.hasReachedTenCrore) {
    newState.hasReachedTenCrore = true;
    pushLog(newState, "🏆 You reached ₹10 Crore in cash!");
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

// Apply periodic mechanics based on turn number. Mutates a copy.
export const applyPeriodicMechanics = (
  state: GameState
): { state: GameState; events: string[] } => {
  const events: string[] = [];
  let next = { ...state, liabilities: [...state.liabilities], assets: [...state.assets] };

  // Inflation every 5 turns: liability monthlyPayment +3%
  if (next.turnCount > 0 && next.turnCount % 5 === 0) {
    next.liabilities = next.liabilities.map(l => ({
      ...l,
      monthlyPayment: Math.round(l.monthlyPayment * 1.03),
    }));
    events.push("📈 Inflation! Your monthly costs just went up.");
    pushLog(next, "📈 Inflation hit — all monthly payments +3%.");
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
