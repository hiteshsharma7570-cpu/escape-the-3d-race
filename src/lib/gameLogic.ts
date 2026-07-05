import {
  GameState,
  Tile,
  TileType,
  Asset,
  AssetType,
  Liability,
  MarketHint,
  MarketCycle,
  OpportunityCard,
  SimpleOpportunityCard,
  StockOpportunityCard,
  DecisionOpportunityCard,
  MarketCard,
  calculateEMI,
} from "@/types/game";

export { type GameState, type Tile, type Asset, calculateEMI };

const LOG_LIMIT = 19;
const prefix = (state: GameState, msg: string) => `[Turn ${state.turnCount}] ${msg}`;
export const pushLog = (state: GameState, msg: string) => {
  state.gameLog = [prefix(state, msg), ...state.gameLog.slice(0, LOG_LIMIT)];
};

// ---------------------------------------------------------------------------
// TILE VISUALS
// ---------------------------------------------------------------------------
const G: Record<TileType, { color: string; gradient: string; icon: string }> = {
  payday:         { color: "#10B981", gradient: "linear-gradient(135deg,#10B981,#34d399)", icon: "💵" },
  opportunity:    { color: "#3B82F6", gradient: "linear-gradient(135deg,#3B82F6,#8b5cf6)", icon: "💡" },
  doodad:         { color: "#EF4444", gradient: "linear-gradient(135deg,#EF4444,#f97316)", icon: "🛍️" },
  market:         { color: "#F59E0B", gradient: "linear-gradient(135deg,#F59E0B,#fbbf24)", icon: "📊" },
  charity:        { color: "#8B5CF6", gradient: "linear-gradient(135deg,#8B5CF6,#ec4899)", icon: "💖" },
  baby:           { color: "#EC4899", gradient: "linear-gradient(135deg,#EC4899,#f472b6)", icon: "👶" },
  downsized:      { color: "#4B5563", gradient: "linear-gradient(135deg,#4B5563,#1f2937)", icon: "📉" },
  ft_business:    { color: "#0EA5E9", gradient: "linear-gradient(135deg,#0EA5E9,#22d3ee)", icon: "🏢" },
  ft_dream:       { color: "#F59E0B", gradient: "linear-gradient(135deg,#F59E0B,#fde047)", icon: "🌟" },
  ft_cashflowday: { color: "#10B981", gradient: "linear-gradient(135deg,#10B981,#facc15)", icon: "💰" },
  ft_charity:     { color: "#8B5CF6", gradient: "linear-gradient(135deg,#8B5CF6,#ec4899)", icon: "💖" },
  ft_divorce:     { color: "#DC2626", gradient: "linear-gradient(135deg,#DC2626,#7f1d1d)", icon: "💔" },
  ft_lawsuit:     { color: "#6D28D9", gradient: "linear-gradient(135deg,#6D28D9,#a855f7)", icon: "⚖️" },
};

const t = (id: number, type: TileType, label: string, extra: Partial<Tile> = {}): Tile => ({
  id, type, label, color: G[type].color, gradient: G[type].gradient, icon: G[type].icon, ...extra,
});

// ---------------------------------------------------------------------------
// BOARDS
// ---------------------------------------------------------------------------

/** 20-tile Rat Race ring — matches the uploaded reference exactly. */
export const RAT_RACE_TILES: Tile[] = [
  t(0,  "payday",      "Pay Day"),
  t(1,  "opportunity", "Opportunity"),
  t(2,  "doodad",      "New Phone",      { cost: 50000 }),
  t(3,  "market",      "Market"),
  t(4,  "opportunity", "Opportunity"),
  t(5,  "charity",     "Charity"),
  t(6,  "payday",      "Pay Day"),
  t(7,  "baby",        "Baby!"),
  t(8,  "opportunity", "Opportunity"),
  t(9,  "doodad",      "Dinner Out",     { cost: 8000 }),
  t(10, "market",      "Market"),
  t(11, "opportunity", "Opportunity"),
  t(12, "downsized",   "Downsized!"),
  t(13, "payday",      "Pay Day"),
  t(14, "opportunity", "Opportunity"),
  t(15, "doodad",      "Vacation",       { cost: 100000 }),
  t(16, "market",      "Market"),
  t(17, "opportunity", "Opportunity"),
  t(18, "charity",     "Charity"),
  t(19, "payday",      "Pay Day"),
];

/** 12-tile Fast Track ring. */
export const FAST_TRACK_TILES: Tile[] = [
  t(0,  "ft_business",    "E-Commerce Store",    { ftCost: 2000000,  ftIncome: 40000 }),
  t(1,  "ft_dream",       "World Tour",          { ftCost: 5000000 }),
  t(2,  "ft_cashflowday", "Cash Flow Day"),
  t(3,  "ft_business",    "Apartment Complex",   { ftCost: 8000000,  ftIncome: 100000 }),
  t(4,  "ft_charity",     "Charity Ball"),
  t(5,  "ft_dream",       "Dream Car",           { ftCost: 8000000 }),
  t(6,  "ft_cashflowday", "Cash Flow Day"),
  t(7,  "ft_business",    "Software Company",    { ftCost: 15000000, ftIncome: 250000 }),
  t(8,  "ft_divorce",     "Divorce"),
  t(9,  "ft_dream",       "Yacht",               { ftCost: 10000000 }),
  t(10, "ft_cashflowday", "Cash Flow Day"),
  t(11, "ft_lawsuit",     "Lawsuit"),
];

/** Backward-compat: existing GameBoard2D imports BOARD_TILES. */
export const BOARD_TILES: Tile[] = RAT_RACE_TILES;

// ---------------------------------------------------------------------------
// CARD DECKS
// ---------------------------------------------------------------------------

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

export const BEGINNER_OPPORTUNITY_CARDS: SimpleOpportunityCard[] = [
  { cardType: "simple", name: "Govt. Bonds",    cost: 10000, income: 200,  type: "paper",   description: "A safe, early investment. Buy Government Bonds for ₹10,000 to get ₹200/mo." },
  { cardType: "simple", name: "Local Tech Park",cost: 25000, income: 1000, type: "business",description: "An early-bird investment opportunity in a new local tech park for ₹25,000. Generates ₹1,000/mo." },
];

export const OPPORTUNITY_CARDS: OpportunityCard[] = shuffle<OpportunityCard>([
  // Stocks
  { cardType: "stock", name: "Astromee",           shares: 100, pricePerShare: 500,  description: "The popular astrological services provider, Astromee.com, is going public." },
  { cardType: "stock", name: "Reliance Industries",shares: 10,  pricePerShare: 2800, description: "A chance to buy shares in the diversified giant, Reliance Industries." },
  { cardType: "stock", name: "TCS",                shares: 5,   pricePerShare: 3800, description: "Invest in Tata Consultancy Services, a pillar of the Indian IT sector." },
  { cardType: "stock", name: "HDFC Bank",          shares: 15,  pricePerShare: 1500, description: "Own a piece of India's leading private sector bank." },
  { cardType: "stock", name: "Infosys",            shares: 10,  pricePerShare: 1500, description: "Buy shares in the global IT powerhouse, Infosys." },
  { cardType: "stock", name: "Hindustan Unilever", shares: 5,   pricePerShare: 2500, description: "Invest in the stable consumer goods company." },
  { cardType: "stock", name: "Bajaj Finance",      shares: 2,   pricePerShare: 7200, description: "High-value opportunity in Bajaj Finance." },
  { cardType: "stock", name: "Zomato",             shares: 200, pricePerShare: 180,  description: "A volatile but popular tech stock, Zomato, is available." },
  // Real Estate
  { cardType: "simple", name: "Small Rental Flat",     cost: 400000,  income: 8000,  type: "real_estate", description: "Down payment on a small rental flat for ₹4,00,000. Generates ₹8,000/mo cash flow." },
  { cardType: "simple", name: "Commercial Property",   cost: 1000000, income: 25000, type: "real_estate", description: "Invest in a commercial property for ₹10,00,000. Brings in ₹25,000/mo." },
  { cardType: "simple", name: "2 BHK Jagatpura",       cost: 500000,  income: 12000, type: "real_estate", description: "Buy a 2 BHK flat in Jagatpura for ₹5,00,000. Solid rental (~₹12,000/mo)." },
  { cardType: "simple", name: "Shop in Johari Bazaar", cost: 800000,  income: 20000, type: "real_estate", description: "A small commercial shop in bustling Johari Bazaar. ₹8,00,000 for ₹20,000/mo rent." },
  { cardType: "simple", name: "Land on Ajmer Road",    cost: 600000,  income: 0,     type: "land",        description: "A plot on Ajmer Road. Generates no income now, but could appreciate." },
  // Businesses
  { cardType: "simple", name: "Trendy Cafe",           cost: 150000,  income: 6000,  type: "business", volatile: true, description: "A trendy cafe in a popular Jaipur neighborhood. ₹1,50,000 for ₹6,000/mo — but trends change." },
  { cardType: "simple", name: "Handicraft Export",     cost: 250000,  income: 10000, type: "business", volatile: true, description: "Export Rajasthani handicrafts. ₹2,50,000 for ₹10,000/mo — regulations can bite." },
  { cardType: "simple", name: "Blue Pottery Workshop", cost: 300000,  income: 15000, type: "business", description: "Invest in a Blue Pottery workshop. ₹3,00,000 for ₹15,000/mo passive." },
  { cardType: "simple", name: "Tour Guide Service",    cost: 100000,  income: 5000,  type: "business", description: "A small tour guide service for tourists. ₹1,00,000 for ₹5,000/mo." },
  // Decision
  {
    cardType: "decision",
    name: "Startup Venture",
    description: "A friend is starting a delivery app. Huge upside, big risk. How much will you invest?",
    choices: [
      { text: "Small Seed",     cost: 50000,  reward: 5000,  successChance: 0.6,  logText: "a small seed investment" },
      { text: "Angel Investor", cost: 200000, reward: 25000, successChance: 0.4,  logText: "as an angel investor" },
      { text: "Lead Investor",  cost: 500000, reward: 75000, successChance: 0.25, logText: "as the lead investor" },
    ],
  },
]);

export const MARKET_CARDS: MarketCard[] = [
  { id: 0,  text: "Regulatory changes hit niche businesses hard! A volatile business venture might now be losing money." },
  { id: 1,  text: "A developer wants your land on Ajmer Road! Sell now for ₹10,00,000 profit." },
  { id: 2,  text: "Market booms! Any 'Reliance Industries' stock you own doubles in value." },
  { id: 3,  text: "A real estate buyer wants one of your properties! Sell for a ₹4,00,000 profit." },
  { id: 4,  text: "RBI increases interest rates. Your credit card EMI increases by 20%." },
  { id: 5,  text: "New tenant needed for a rental. Pay ₹10,000 in repairs." },
  { id: 6,  text: "Your business has a breakthrough! Passive income from it doubles." },
  { id: 7,  text: "Recession warning: if you have less than ₹50,000 cash, you may be downsized." },
];

// ---------------------------------------------------------------------------
// MARKET HINTS (existing pre-roll headlines)
// ---------------------------------------------------------------------------

const MARKET_NEWS: MarketHint[] = [
  { sentiment: "bullish", headline: "📰 Tech sector surges as quarterly earnings beat expectations" },
  { sentiment: "bullish", headline: "📰 Central bank cuts interest rates — investors cheer" },
  { sentiment: "bullish", headline: "📰 Real estate demand hits record highs this quarter" },
  { sentiment: "bearish", headline: "📰 Inflation fears spook markets — sell-off looms" },
  { sentiment: "bearish", headline: "📰 Geopolitical tensions rattle global investors" },
  { sentiment: "bearish", headline: "📰 Major bank reports losses — markets jittery" },
  { sentiment: "neutral", headline: "📰 Analysts split on market direction this week" },
  { sentiment: "neutral", headline: "📰 Mixed signals from economic data leave traders cautious" },
];

export const generateMarketHint = (): MarketHint =>
  MARKET_NEWS[Math.floor(Math.random() * MARKET_NEWS.length)];

// ---------------------------------------------------------------------------
// FINANCIAL CALCULATIONS
// ---------------------------------------------------------------------------

export const calculateTotalEMI = (state: GameState): number =>
  Object.values(state.liabilities).reduce(
    (sum, l) => sum + (l.principal > 0 ? l.emi : 0),
    0,
  );

export const calculateTotalExpenses = (state: GameState): number => {
  const expensesTotal = Object.values(state.expenses).reduce((a, b) => a + b, 0);
  return expensesTotal + calculateTotalEMI(state);
};

export const calculateEffectiveSalary = (state: GameState): number =>
  Math.round((state.salary ?? 0) * (state.efficiency ?? 1));

export const calculateEffectivePassiveIncome = (state: GameState): number =>
  (state.assets ?? []).reduce(
    (sum, a) => sum + (a.income > 0 ? Math.round(a.income * (state.efficiency ?? 1)) : 0),
    0,
  );

export const calculateMonthlyCashFlow = (state: GameState): number =>
  calculateEffectiveSalary(state) + calculateEffectivePassiveIncome(state) - calculateTotalExpenses(state);

export const calculateNetWorth = (state: GameState): number => {
  const totalAssets = (state.assets ?? []).reduce((sum, a) => sum + (a.cost ?? 0), 0);
  const totalDebt   = Object.values(state.liabilities ?? {}).reduce((s, l) => s + (l.principal ?? 0), 0);
  return (state.cash ?? 0) + totalAssets - totalDebt;
};

/** Recomputes cashFlow + passiveIncome aggregate to keep state coherent. */
export const recomputeDerived = (state: GameState): GameState => {
  const passive = (state.assets ?? []).reduce((s, a) => s + (a.income > 0 ? a.income : 0), 0);
  const next: GameState = { ...state, passiveIncome: passive };
  next.cashFlow = calculateMonthlyCashFlow(next);
  return next;
};

// ---------------------------------------------------------------------------
// ASSET HELPERS
// ---------------------------------------------------------------------------

const RISK_BY_TYPE: Record<AssetType, "low" | "medium" | "high"> = {
  paper: "low",
  real_estate: "medium",
  business: "medium",
  stock: "high",
  land: "medium",
};

export const createAsset = (partial: {
  name: string;
  type: AssetType;
  cost: number;
  income: number;
  volatile?: boolean;
  shares?: number;
  company?: string;
}): Asset => ({
  id: `asset-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  ...partial,
  value: partial.cost,
  monthlyIncome: partial.income,
  risk: RISK_BY_TYPE[partial.type] ?? "medium",
});

// ---------------------------------------------------------------------------
// LOANS
// ---------------------------------------------------------------------------

export const maxLoanLimit = (state: GameState): number => (state.salary ?? 0) * 20;

export const availableBankLoan = (state: GameState): number => {
  const bank = state.liabilities.bankLoan ?? { principal: 0, emi: 0, interestRate: 12 };
  return Math.max(0, maxLoanLimit(state) - bank.principal);
};

export const takeBankLoan = (state: GameState, amount: number): GameState => {
  if (amount <= 0) return state;
  const bank: Liability = state.liabilities.bankLoan ?? { principal: 0, emi: 0, interestRate: 12 };
  const newPrincipal = bank.principal + amount;
  const newEMI = calculateEMI(newPrincipal, bank.interestRate);
  const next: GameState = {
    ...state,
    cash: state.cash + amount,
    liabilities: {
      ...state.liabilities,
      bankLoan: { principal: newPrincipal, emi: newEMI, interestRate: bank.interestRate },
    },
    decisionHistory: [
      ...(state.decisionHistory ?? []),
      { type: "loan", turn: state.turnCount, amount },
    ],
  };
  pushLog(next, `Took a bank loan of ₹${amount.toLocaleString()} at 12% APR. New EMI: ₹${newEMI.toLocaleString()}.`);
  return recomputeDerived(next);
};

export const repayBankLoan = (state: GameState, amount: number): GameState => {
  const bank = state.liabilities.bankLoan;
  if (!bank || amount <= 0) return state;
  const repay = Math.min(amount, bank.principal, state.cash);
  const newPrincipal = bank.principal - repay;
  const newEMI = calculateEMI(newPrincipal, bank.interestRate);
  const next: GameState = {
    ...state,
    cash: state.cash - repay,
    liabilities: {
      ...state.liabilities,
      bankLoan: { principal: newPrincipal, emi: newEMI, interestRate: bank.interestRate },
    },
  };
  pushLog(next, `Repaid ₹${repay.toLocaleString()} of bank loan. New EMI: ₹${newEMI.toLocaleString()}.`);
  return recomputeDerived(next);
};

export const payOffDebt = (state: GameState, key: string): GameState => {
  const debt = state.liabilities[key];
  if (!debt || debt.principal <= 0) return state;
  if (state.cash < debt.principal) return state;
  const next: GameState = {
    ...state,
    cash: state.cash - debt.principal,
    liabilities: {
      ...state.liabilities,
      [key]: { principal: 0, emi: 0, interestRate: debt.interestRate },
    },
  };
  pushLog(next, `Paid off ${prettifyKey(key)} completely!`);
  return recomputeDerived(next);
};

const prettifyKey = (k: string) =>
  k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

// ---------------------------------------------------------------------------
// MARKET CYCLE
// ---------------------------------------------------------------------------

export const opportunityCostAfterCycle = (baseCost: number, cycle: MarketCycle): number => {
  if (cycle === "Boom") return Math.round(baseCost * 1.5);
  if (cycle === "Recession") return Math.round(baseCost * 0.7);
  return baseCost;
};

export const tickMarketCycle = (state: GameState): GameState => {
  const remaining = state.turnsUntilCycleChange - 1;
  if (remaining > 0) return { ...state, turnsUntilCycleChange: remaining };
  const pool: MarketCycle[] = ["Normal", "Normal", "Boom", "Recession"];
  const nextCycle = pool[Math.floor(Math.random() * pool.length)];
  const next: GameState = {
    ...state,
    marketCycle: nextCycle,
    turnsUntilCycleChange: 5 + Math.floor(Math.random() * 5),
    marketCondition: nextCycle === "Boom" ? "boom" : nextCycle === "Recession" ? "crash" : "normal",
  };
  pushLog(next, `Market cycle changed → ${nextCycle}.`);
  return next;
};

// ---------------------------------------------------------------------------
// DRAWING CARDS
// ---------------------------------------------------------------------------

export const drawOpportunityCard = (state: GameState): { card: OpportunityCard; state: GameState } => {
  // Turns 1-5: use beginner deck for first N picks
  const recentBuys = (state.decisionHistory ?? []).filter((d) => (d.turn as number) <= 5).length;
  if (state.turnCount <= 5 && recentBuys < BEGINNER_OPPORTUNITY_CARDS.length) {
    return { card: BEGINNER_OPPORTUNITY_CARDS[recentBuys], state };
  }
  const idx = state.opportunityCardIndex % OPPORTUNITY_CARDS.length;
  const card = OPPORTUNITY_CARDS[idx];
  return {
    card,
    state: { ...state, opportunityCardIndex: (idx + 1) % OPPORTUNITY_CARDS.length },
  };
};

export const drawMarketCard = (state: GameState): { card: MarketCard; state: GameState } => {
  const idx = state.marketCardIndex % MARKET_CARDS.length;
  const card = MARKET_CARDS[idx];
  return { card, state: { ...state, marketCardIndex: (idx + 1) % MARKET_CARDS.length } };
};

// ---------------------------------------------------------------------------
// TILE EFFECTS
// ---------------------------------------------------------------------------

export const handleTileEffect = (state: GameState, tile: Tile): GameState => {
  let next: GameState = {
    ...state,
    assets: [...state.assets],
    expenses: { ...state.expenses },
    liabilities: Object.fromEntries(
      Object.entries(state.liabilities).map(([k, v]) => [k, { ...v }]),
    ),
  };

  switch (tile.type) {
    case "payday": {
      // Pay Day = full monthly cash flow (income - all expenses & EMIs).
      const flow = calculateMonthlyCashFlow(next);
      next.cash += flow;
      pushLog(next, `Pay Day! Received ₹${flow.toLocaleString()} in monthly cash flow.`);
      break;
    }

    case "opportunity": {
      const drawn = drawOpportunityCard(next);
      next = drawn.state;
      const card = drawn.card;
      let baseCost = 0;
      if (card.cardType === "simple") baseCost = card.cost;
      else if (card.cardType === "stock") baseCost = card.pricePerShare * card.shares;
      else if (card.cardType === "decision") baseCost = card.choices[0].cost;
      const costAfterCycle = opportunityCostAfterCycle(baseCost, next.marketCycle);
      next.pendingDecision = { type: "opportunity", card, costAfterCycle };
      pushLog(next, `Opportunity: ${card.name}.`);
      break;
    }

    case "doodad": {
      const cost = tile.cost ?? 0;
      next.cash -= cost;
      pushLog(next, `Doodad: ${tile.label} — spent ₹${cost.toLocaleString()}.`);
      break;
    }

    case "market": {
      const drawn = drawMarketCard(next);
      next = drawn.state;
      next.pendingDecision = { type: "market_card", cardId: drawn.card.id };
      pushLog(next, `Market: ${drawn.card.text}`);
      break;
    }

    case "charity": {
      const total = calculateEffectiveSalary(next) + calculateEffectivePassiveIncome(next);
      const donation = Math.round(total * 0.1);
      next.pendingDecision = { type: "charity", donation };
      pushLog(next, `Charity: donate ₹${donation.toLocaleString()} for 2-dice next roll?`);
      break;
    }

    case "baby": {
      next.childrenCount += 1;
      const childCost = Math.round((next.salary / 10) * next.childrenCount);
      next.expenses.children = childCost;
      pushLog(next, `👶 Baby! Monthly children expense is now ₹${childCost.toLocaleString()}.`);
      break;
    }

    case "downsized": {
      next.skipTurns = 2;
      const shortfall = Math.max(0, calculateTotalExpenses(next) - calculateEffectiveSalary(next));
      next.cash -= shortfall;
      pushLog(next, `📉 Downsized! Skip 2 turns and lose ₹${shortfall.toLocaleString()} to cover expenses.`);
      break;
    }

    // Fast Track
    case "ft_cashflowday": {
      const bonus = calculateEffectivePassiveIncome(next) * 10;
      next.cash += bonus;
      pushLog(next, `💰 Cash Flow Day! +₹${bonus.toLocaleString()}.`);
      break;
    }
    case "ft_business":
    case "ft_dream": {
      // Handled via pending decision in Index (needs UI confirmation)
      next.pendingDecision = null; // Index shows a modal separately using tile data
      break;
    }
    case "ft_charity": {
      const donation = Math.round(next.cash * 0.05);
      next.cash -= donation;
      pushLog(next, `Charity Ball: donated ₹${donation.toLocaleString()}.`);
      break;
    }
    case "ft_divorce": {
      const loss = Math.round(next.cash / 2);
      next.cash -= loss;
      pushLog(next, `💔 Divorce! Lost ₹${loss.toLocaleString()}.`);
      break;
    }
    case "ft_lawsuit": {
      next.cash -= 500000;
      pushLog(next, `⚖️ Lawsuit! -₹5,00,000.`);
      break;
    }
  }

  return recomputeDerived(next);
};

// ---------------------------------------------------------------------------
// DECISIONS
// ---------------------------------------------------------------------------

export const applyCharityDecision = (state: GameState, accept: boolean): GameState => {
  const next: GameState = { ...state, pendingDecision: null };
  if (accept && state.pendingDecision?.type === "charity") {
    const donation = state.pendingDecision.donation;
    if (next.cash >= donation) {
      next.cash -= donation;
      next.charityUsed = true;
      next.decisionHistory = [...next.decisionHistory, { type: "charity", turn: next.turnCount }];
      pushLog(next, `Donated ₹${donation.toLocaleString()}. Next roll uses 2 dice!`);
    } else {
      pushLog(next, `Not enough cash to donate.`);
    }
  } else {
    pushLog(next, `Declined charity.`);
  }
  return recomputeDerived(next);
};

const buySimple = (state: GameState, card: SimpleOpportunityCard, costAfterCycle: number): GameState => {
  const next = { ...state, assets: [...state.assets] };
  next.cash -= costAfterCycle;
  next.assets.push(createAsset({ name: card.name, type: card.type, cost: costAfterCycle, income: card.income, volatile: card.volatile }));
  next.decisionHistory = [...next.decisionHistory, { type: "buy", turn: next.turnCount, name: card.name, cost: costAfterCycle, income: card.income }];
  pushLog(next, `Invested in ${card.name} for ₹${costAfterCycle.toLocaleString()} (+₹${card.income.toLocaleString()}/mo).`);
  return next;
};

const buyStock = (state: GameState, card: StockOpportunityCard, totalCost: number): GameState => {
  const next = { ...state, assets: [...state.assets] };
  next.cash -= totalCost;
  next.assets.push(createAsset({ name: `${card.name} Stock`, type: "stock", cost: totalCost, income: 0, shares: card.shares, company: card.name }));
  next.decisionHistory = [...next.decisionHistory, { type: "buy", turn: next.turnCount, name: card.name, cost: totalCost, income: 0 }];
  pushLog(next, `Bought ${card.shares} shares of ${card.name} for ₹${totalCost.toLocaleString()}.`);
  return next;
};

const buyDecision = (state: GameState, card: DecisionOpportunityCard, choiceIndex: number): GameState => {
  const next = { ...state, assets: [...state.assets] };
  const choice = card.choices[choiceIndex];
  next.cash -= choice.cost;
  next.decisionHistory = [...next.decisionHistory, { type: "buy", turn: next.turnCount, name: card.name, cost: choice.cost, income: choice.reward }];
  if (Math.random() < choice.successChance) {
    next.assets.push(createAsset({ name: card.name, type: "business", cost: choice.cost, income: choice.reward, volatile: true }));
    pushLog(next, `Success! ${card.name} (${choice.logText}) → +₹${choice.reward.toLocaleString()}/mo.`);
  } else {
    pushLog(next, `The venture failed. Lost ₹${choice.cost.toLocaleString()}.`);
  }
  return next;
};

/** Called when the player accepts/declines a simple/stock opportunity from the modal. */
export const applyOpportunityDecision = (
  state: GameState,
  accept: boolean,
  extra?: { decisionChoiceIndex?: number },
): GameState => {
  let next: GameState = { ...state, pendingDecision: null };
  if (!accept || state.pendingDecision?.type !== "opportunity") {
    pushLog(next, `Passed on opportunity.`);
    if (state.pendingDecision?.type === "opportunity") {
      next.decisionHistory = [...next.decisionHistory, { type: "pass", turn: next.turnCount, name: state.pendingDecision.card.name }];
    }
    return recomputeDerived(next);
  }

  const { card, costAfterCycle } = state.pendingDecision;
  if (card.cardType === "simple") {
    if (next.cash >= costAfterCycle) next = buySimple(next, card, costAfterCycle);
    else return offerLoanForAsset(next, card, costAfterCycle, "buy_simple");
  } else if (card.cardType === "stock") {
    const total = card.pricePerShare * card.shares;
    if (next.cash >= total) next = buyStock(next, card, total);
    else return offerLoanForAsset(next, card, total, "buy_stock");
  } else if (card.cardType === "decision") {
    const idx = extra?.decisionChoiceIndex ?? 0;
    const cost = card.choices[idx].cost;
    if (next.cash >= cost) next = buyDecision(next, card, idx);
    else return offerLoanForAsset(next, card, cost, "buy_decision", idx);
  }

  next = checkEscapeRatRace(next);
  return recomputeDerived(next);
};

/** Presents a loan-for-shortfall modal decision. */
const offerLoanForAsset = (
  state: GameState,
  card: OpportunityCard,
  totalCost: number,
  onAccept: "buy_simple" | "buy_stock" | "buy_decision",
  decisionChoiceIndex?: number,
): GameState => {
  const shortfall = totalCost - state.cash;
  const loanAmount = Math.ceil(shortfall / 1000) * 1000;
  const bank = state.liabilities.bankLoan ?? { principal: 0, emi: 0, interestRate: 12 };
  if (availableBankLoan(state) < loanAmount) {
    pushLog(state, `Loan denied — need ₹${loanAmount.toLocaleString()} but limit remaining is ₹${availableBankLoan(state).toLocaleString()}.`);
    return recomputeDerived({ ...state, pendingDecision: null });
  }
  const newEMI = calculateEMI(bank.principal + loanAmount, bank.interestRate);
  return {
    ...state,
    pendingDecision: {
      type: "loan_for_asset",
      card,
      totalCost,
      shortfall,
      loanAmount,
      newEMI,
      onAccept,
      decisionChoiceIndex,
    },
  };
};

/** Accept the offered loan and complete the purchase. */
export const applyLoanForAssetDecision = (state: GameState, accept: boolean): GameState => {
  if (state.pendingDecision?.type !== "loan_for_asset") return state;
  let next = { ...state, pendingDecision: null };
  if (!accept) {
    pushLog(next, `Declined loan — passed on the deal.`);
    return recomputeDerived(next);
  }
  const { card, totalCost, loanAmount, onAccept, decisionChoiceIndex } = state.pendingDecision;
  next = takeBankLoan(next, loanAmount);
  if (onAccept === "buy_simple" && card.cardType === "simple") {
    next = buySimple(next, card, totalCost);
  } else if (onAccept === "buy_stock" && card.cardType === "stock") {
    next = buyStock(next, card, totalCost);
  } else if (onAccept === "buy_decision" && card.cardType === "decision") {
    next = buyDecision(next, card, decisionChoiceIndex ?? 0);
  }
  next = checkEscapeRatRace(next);
  return recomputeDerived(next);
};

// ---------------------------------------------------------------------------
// ESCAPE / WIN
// ---------------------------------------------------------------------------

export const checkEscapeRatRace = (state: GameState): GameState => {
  if (state.hasEscapedRatRace || state.onFastTrack) return state;
  const totalExpenses = calculateTotalExpenses(state);
  const effPassive = calculateEffectivePassiveIncome(state);
  if (state.assets.length > 0 && effPassive > totalExpenses) {
    const next: GameState = {
      ...state,
      hasEscapedRatRace: true,
      onFastTrack: true,
      ftPosition: 0,
    };
    pushLog(next, `🎉 You escaped the Rat Race! Passive income now covers all expenses.`);
    return next;
  }
  return state;
};

// ---------------------------------------------------------------------------
// SELL ASSET (used for bankruptcy)
// ---------------------------------------------------------------------------

export const sellAsset = (state: GameState, assetId: string): GameState => {
  const asset = state.assets.find((a) => a.id === assetId);
  if (!asset) return state;
  const salePrice = Math.round(asset.cost * 0.8);
  const next: GameState = {
    ...state,
    cash: state.cash + salePrice,
    assets: state.assets.filter((a) => a.id !== assetId),
  };
  pushLog(next, `Sold ${asset.name} for ₹${salePrice.toLocaleString()} (80% of cost).`);
  return recomputeDerived(next);
};

// ---------------------------------------------------------------------------
// PERIODIC MECHANICS
// ---------------------------------------------------------------------------

export const applyPeriodicMechanics = (
  state: GameState,
): { state: GameState; events: string[] } => {
  const events: string[] = [];
  const next: GameState = { ...state, assets: [...state.assets] };

  // Salary review every 8 turns
  if (next.turnCount > 0 && next.turnCount % 8 === 0) {
    const pct = 5 + Math.floor(Math.random() * 11);
    const oldSalary = next.salary;
    next.salary = Math.round(next.salary * (1 + pct / 100));
    events.push(`🎉 Salary review! +${pct}% (₹${oldSalary.toLocaleString()} → ₹${next.salary.toLocaleString()})`);
    pushLog(next, `Salary review: +${pct}% raise to ₹${next.salary.toLocaleString()}.`);
  }

  return { state: recomputeDerived(next), events };
};

// ---------------------------------------------------------------------------
// LEGACY EXPORT (kept for old imports)
// ---------------------------------------------------------------------------

/** No-op kept so old imports don't break — kept as identity. */
export const resolvePoolTile = (tile: Tile): Tile => tile;

/** Legacy: kept for consumers that used the old opportunity catalog. */
export const INVESTMENT_OPPORTUNITIES: never[] = [];
