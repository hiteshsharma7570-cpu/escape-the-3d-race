import { GameState } from "@/types/game";
import { calculateNetWorth } from "./gameLogic";

export interface LocalAchievement {
  id: string;
  name: string;
  description: string;
  type: "net_worth" | "assets" | "passive_income" | "games_won";
  threshold: number;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

export const ACHIEVEMENTS: LocalAchievement[] = [
  { id: "nw_1l", name: "First Lakh", description: "Reach ₹1 lakh net worth", type: "net_worth", threshold: 100000, icon: "Coins", tier: "bronze" },
  { id: "nw_10l", name: "Comfortable", description: "Reach ₹10 lakh net worth", type: "net_worth", threshold: 1000000, icon: "Wallet", tier: "silver" },
  { id: "nw_1cr", name: "Crorepati", description: "Reach ₹1 crore net worth", type: "net_worth", threshold: 10000000, icon: "Crown", tier: "gold" },
  { id: "assets_1", name: "First Investment", description: "Buy your first asset", type: "assets", threshold: 1, icon: "Sprout", tier: "bronze" },
  { id: "assets_5", name: "Diversified", description: "Own 5 assets", type: "assets", threshold: 5, icon: "LayoutGrid", tier: "silver" },
  { id: "assets_10", name: "Portfolio Pro", description: "Own 10 assets", type: "assets", threshold: 10, icon: "Briefcase", tier: "gold" },
  { id: "pi_10k", name: "Side Income", description: "Earn ₹10k/mo passive income", type: "passive_income", threshold: 10000, icon: "TrendingUp", tier: "bronze" },
  { id: "pi_50k", name: "Half Free", description: "Earn ₹50k/mo passive income", type: "passive_income", threshold: 50000, icon: "TrendingUp", tier: "silver" },
  { id: "pi_1l", name: "Financially Free", description: "Earn ₹1 lakh/mo passive income", type: "passive_income", threshold: 100000, icon: "Trophy", tier: "platinum" },
  { id: "won_1", name: "Rat Race Escapee", description: "Win your first game", type: "games_won", threshold: 1, icon: "Award", tier: "gold" },
];

export const getProgress = (a: LocalAchievement, state: GameState, gamesWon: number): number => {
  let current = 0;
  switch (a.type) {
    case "net_worth": current = calculateNetWorth(state); break;
    case "assets": current = state.assets.length; break;
    case "passive_income": current = state.passiveIncome; break;
    case "games_won": current = gamesWon; break;
  }
  return Math.min((current / a.threshold) * 100, 100);
};

export const meetsThreshold = (a: LocalAchievement, state: GameState, gamesWon: number): boolean => {
  switch (a.type) {
    case "net_worth": return calculateNetWorth(state) >= a.threshold;
    case "assets": return state.assets.length >= a.threshold;
    case "passive_income": return state.passiveIncome >= a.threshold;
    case "games_won": return gamesWon >= a.threshold;
  }
};