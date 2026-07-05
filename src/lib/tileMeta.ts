import type { TileType } from "@/types/game";

export interface TileMeta {
  category: string;
  subtitle: string;
  icon: string;
  neonHsl: string;
  textColor?: string;
}

export const TILE_META: Record<TileType, TileMeta> = {
  // Rat Race
  payday:          { category: "PAY DAY",     subtitle: "+CASH FLOW",  icon: "💵", neonHsl: "140 90% 55%" },
  opportunity:     { category: "OPPORTUNITY", subtitle: "INVEST",      icon: "💡", neonHsl: "210 100% 62%" },
  doodad:          { category: "DOODAD",      subtitle: "SPEND -₹",    icon: "🛍️", neonHsl: "0 90% 60%" },
  market:          { category: "MARKET",      subtitle: "EVENT",       icon: "📊", neonHsl: "35 100% 55%" },
  charity:         { category: "CHARITY",     subtitle: "DONATE",      icon: "💖", neonHsl: "325 95% 65%" },
  baby:            { category: "BABY!",       subtitle: "+EXPENSE",    icon: "👶", neonHsl: "325 95% 65%" },
  downsized:       { category: "DOWNSIZED",   subtitle: "SKIP+PAY",    icon: "📉", neonHsl: "0 90% 60%" },
  // Fast Track
  ft_business:     { category: "BUSINESS",    subtitle: "BIG DEAL",    icon: "🏢", neonHsl: "170 90% 50%" },
  ft_dream:        { category: "DREAM",       subtitle: "WIN?",        icon: "🌟", neonHsl: "45 100% 60%" },
  ft_cashflowday:  { category: "CASH FLOW",   subtitle: "×10",         icon: "💰", neonHsl: "140 90% 55%" },
  ft_charity:      { category: "CHARITY BALL",subtitle: "GIVE",        icon: "💖", neonHsl: "325 95% 65%" },
  ft_divorce:      { category: "DIVORCE",     subtitle: "-HALF",       icon: "💔", neonHsl: "0 90% 55%" },
  ft_lawsuit:      { category: "LAWSUIT",     subtitle: "-500K",       icon: "⚖️", neonHsl: "260 60% 55%" },
};

export const START_TILE_ID = 0;
export const getTileMeta = (type: TileType): TileMeta => TILE_META[type];
