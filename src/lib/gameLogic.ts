import { GameState, Tile, Asset, Liability } from "@/types/game";

export { type GameState, type Tile, type Asset, type Liability };

export const BOARD_TILES: Tile[] = [
  { id: 0, type: "payday", label: "Pay Day", color: "#10b981" },
  { id: 1, type: "opportunity", label: "Opportunity", color: "#3b82f6" },
  { id: 2, type: "market", label: "Market", color: "#f59e0b" },
  { id: 3, type: "charity", label: "Charity", color: "#8b5cf6" },
  { id: 4, type: "payday", label: "Pay Day", color: "#10b981" },
  { id: 5, type: "baby", label: "Baby!", color: "#ec4899" },
  { id: 6, type: "opportunity", label: "Opportunity", color: "#3b82f6" },
  { id: 7, type: "payday", label: "Pay Day", color: "#10b981" },
  { id: 8, type: "market", label: "Market", color: "#f59e0b" },
  { id: 9, type: "opportunity", label: "Opportunity", color: "#3b82f6" },
  { id: 10, type: "dinner", label: "Dinner Out", color: "#ef4444" },
  { id: 11, type: "downsized", label: "Downsized!", color: "#64748b" },
  { id: 12, type: "opportunity", label: "Opportunity", color: "#3b82f6" },
  { id: 13, type: "market", label: "Market", color: "#f59e0b" },
  { id: 14, type: "vacation", label: "Vacation", color: "#ef4444" },
  { id: 15, type: "payday", label: "Pay Day", color: "#10b981" },
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

  switch (tile.type) {
    case "payday":
      const cashFlow = calculateMonthlyCashFlow(state);
      newState.cash += cashFlow;
      logMessage = `Pay Day! Received ₹${cashFlow.toLocaleString()} (Monthly Cash Flow)`;
      break;

    case "opportunity":
      // Generate opportunity with risk levels
      const opportunities = [
        // Low Risk - Stable, modest returns
        { name: "Fixed Deposit", cost: 25000, income: 600, value: 25000, risk: "low" as const, description: "Safe bank deposit with guaranteed returns" },
        { name: "Government Bonds", cost: 50000, income: 1200, value: 50000, risk: "low" as const, description: "Secure government-backed bonds" },
        { name: "Dividend Stocks", cost: 75000, income: 2000, value: 75000, risk: "low" as const, description: "Blue-chip stocks with steady dividends" },
        
        // Medium Risk - Balanced risk/reward
        { name: "Rental Property", cost: 500000, income: 14400, value: 500000, risk: "medium" as const, description: "Residential property for rental income" },
        { name: "Side Business", cost: 100000, income: 6000, value: 100000, risk: "medium" as const, description: "Part-time business venture" },
        { name: "REITs", cost: 150000, income: 5400, value: 150000, risk: "medium" as const, description: "Real Estate Investment Trust" },
        { name: "Mutual Funds", cost: 200000, income: 6000, value: 200000, risk: "medium" as const, description: "Diversified portfolio managed by experts" },
        
        // High Risk - High potential returns
        { name: "Startup Investment", cost: 250000, income: 15000, value: 250000, risk: "high" as const, description: "Equity in an early-stage company" },
        { name: "Crypto Portfolio", cost: 100000, income: 8000, value: 100000, risk: "high" as const, description: "Diversified cryptocurrency holdings" },
        { name: "Commercial Property", cost: 1000000, income: 40000, value: 1000000, risk: "high" as const, description: "Office/retail space for lease" },
        { name: "Franchise Business", cost: 750000, income: 30000, value: 750000, risk: "high" as const, description: "Branded franchise operation" },
      ];
      const opp = opportunities[Math.floor(Math.random() * opportunities.length)];
      newState.pendingDecision = {
        type: "opportunity",
        opportunity: opp,
      };
      const riskLabel = opp.risk === "low" ? "🟢 Low" : opp.risk === "medium" ? "🟡 Medium" : "🔴 High";
      logMessage = `Opportunity (${riskLabel} Risk): ${opp.name} for ₹${opp.cost.toLocaleString()}`;
      break;

    case "market":
      const change = Math.random() > 0.5 ? 1.1 : 0.9;
      newState.assets = newState.assets.map(a => ({
        ...a,
        value: Math.round(a.value * change),
      }));
      logMessage = change > 1 
        ? "Market Boom! Asset values increased by 10%" 
        : "Market Dip! Asset values decreased by 10%";
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
  }

  newState.gameLog = [logMessage, ...newState.gameLog.slice(0, 9)];
  
  // Check win condition
  if (newState.passiveIncome >= calculateTotalExpenses(newState) && !newState.hasEscapedRatRace) {
    newState.hasEscapedRatRace = true;
    newState.gameLog = ["🎉 You escaped the Rat Race! Passive income covers all expenses!", ...newState.gameLog];
  }

  return newState;
};

export const applyCharityDecision = (state: GameState, accept: boolean): GameState => {
  const newState = { ...state, pendingDecision: null };
  
  if (accept && state.pendingDecision?.charityAmount) {
    newState.cash -= state.pendingDecision.charityAmount;
    newState.gameLog = [`Donated ₹${state.pendingDecision.charityAmount.toLocaleString()} to charity!`, ...newState.gameLog.slice(0, 9)];
  } else {
    newState.gameLog = ["Declined charity donation.", ...newState.gameLog.slice(0, 9)];
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
      });
      newState.passiveIncome += opp.income;
      newState.gameLog = [`Invested in ${opp.name}! Monthly income: +₹${opp.income.toLocaleString()}`, ...newState.gameLog.slice(0, 9)];
    } else {
      newState.gameLog = [`Insufficient funds for ${opp.name} (need ₹${opp.cost.toLocaleString()})`, ...newState.gameLog.slice(0, 9)];
    }
  } else {
    newState.gameLog = ["Passed on investment opportunity.", ...newState.gameLog.slice(0, 9)];
  }
  
  // Check win condition after investment
  if (newState.passiveIncome >= calculateTotalExpenses(newState) && !newState.hasEscapedRatRace) {
    newState.hasEscapedRatRace = true;
    newState.gameLog = ["🎉 You escaped the Rat Race! Passive income covers all expenses!", ...newState.gameLog];
  }
  
  return newState;
};
