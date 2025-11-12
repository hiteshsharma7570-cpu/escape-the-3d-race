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
      // Random opportunity
      const opportunities = [
        { name: "Stock Investment", cost: 50000, income: 2400, value: 50000 },
        { name: "Rental Property", cost: 500000, income: 14400, value: 500000 },
        { name: "Side Business", cost: 100000, income: 6000, value: 100000 },
      ];
      const opp = opportunities[Math.floor(Math.random() * opportunities.length)];
      
      if (newState.cash >= opp.cost) {
        newState.cash -= opp.cost;
        newState.assets.push({
          id: `asset-${Date.now()}`,
          name: opp.name,
          value: opp.value,
          monthlyIncome: opp.income,
        });
        newState.passiveIncome += opp.income;
        logMessage = `Opportunity! Purchased ${opp.name} for ₹${opp.cost.toLocaleString()}. Monthly income: +₹${opp.income.toLocaleString()}`;
      } else {
        logMessage = `Opportunity available, but insufficient funds (need ₹${opp.cost.toLocaleString()})`;
      }
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
      const donation = 5000;
      newState.cash -= donation;
      logMessage = `Charity! Donated ₹${donation.toLocaleString()}`;
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
