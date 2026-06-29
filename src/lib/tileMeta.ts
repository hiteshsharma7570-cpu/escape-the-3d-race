import type { TileType } from "@/types/game";

export interface TileMeta {
  category: string;        // e.g. "PAYDAY"
  subtitle: string;        // e.g. "+₹60,000" or "INVEST" or "-PAY"
  icon: string;            // emoji rendered at the top of the tile
  neonHsl: string;         // hsl triplet ("140 90% 55%") used for glow
  textColor?: string;      // optional white/gold override
}

// Map game logic tile types -> visual category metadata for the redesigned board.
export const TILE_META: Record<TileType, TileMeta> = {
  payday:             { category: "PAYDAY",       subtitle: "+SALARY",     icon: "💵", neonHsl: "140 90% 55%" },
  opportunity:        { category: "OPPORTUNITY",  subtitle: "INVEST",      icon: "💡", neonHsl: "210 100% 62%" },
  market:             { category: "MARKET",       subtitle: "VOLATILE",    icon: "📊", neonHsl: "210 100% 62%" },
  charity:            { category: "CHARITY",      subtitle: "DONATE",      icon: "💖", neonHsl: "325 95% 65%" },
  baby:               { category: "BABY!",        subtitle: "+EXPENSE",    icon: "👶", neonHsl: "325 95% 65%" },
  vacation:           { category: "VACATION",     subtitle: "RELAX",       icon: "🏝️", neonHsl: "170 80% 50%" },
  dinner:             { category: "DINNER OUT",   subtitle: "-PAY",        icon: "🍽️", neonHsl: "0 90% 60%" },
  downsized:          { category: "DOWNSIZED",    subtitle: "-INCOME",     icon: "📉", neonHsl: "0 90% 60%" },
  tax_audit:          { category: "TAX AUDIT",    subtitle: "-PAY",        icon: "🧾", neonHsl: "0 90% 60%" },
  medical_emergency:  { category: "MEDICAL",      subtitle: "EMERGENCY",   icon: "🏥", neonHsl: "0 90% 60%" },
  side_hustle:        { category: "SIDE HUSTLE",  subtitle: "EARN",        icon: "💻", neonHsl: "80 95% 55%" },
  inheritance:        { category: "INHERITANCE",  subtitle: "BONUS",       icon: "🎁", neonHsl: "50 100% 60%" },
  real_estate_boom:   { category: "REAL ESTATE",  subtitle: "BOOM",        icon: "🏠", neonHsl: "42 100% 58%" },
  stock_market_crash: { category: "RECESSION",    subtitle: "MARKET CRASH",icon: "🐻", neonHsl: "0 85% 50%" },
  emi_hike:            { category: "EMI HIKE",       subtitle: "RATES UP",   icon: "📈", neonHsl: "0 75% 50%" },
  insurance_premium:   { category: "INSURANCE",      subtitle: "PREMIUM",    icon: "🛡️", neonHsl: "280 70% 55%" },
  home_repair:         { category: "HOME REPAIR",    subtitle: "-PAY",       icon: "🔧", neonHsl: "25 90% 55%" },
  traffic_fine:        { category: "TRAFFIC FINE",   subtitle: "CHALLAN",    icon: "🚦", neonHsl: "0 90% 60%" },
  credit_card_bill:    { category: "CC BILL",        subtitle: "DUE",        icon: "💳", neonHsl: "0 80% 50%" },
  school_fees:         { category: "SCHOOL FEES",    subtitle: "TERM PAY",   icon: "🎒", neonHsl: "210 90% 58%" },
  festival_expense:    { category: "FESTIVAL",       subtitle: "CELEBRATE",  icon: "🪔", neonHsl: "40 100% 58%" },
  electricity_bill:    { category: "ELECTRICITY",    subtitle: "BILL",       icon: "⚡", neonHsl: "50 95% 55%" },
  rent_hike:           { category: "RENT HIKE",      subtitle: "+RENT",      icon: "🏠", neonHsl: "0 70% 45%" },
  vehicle_breakdown:   { category: "VEHICLE",        subtitle: "REPAIR",     icon: "🚗", neonHsl: "210 5% 55%" },
  loan_interest_spike: { category: "INTEREST",       subtitle: "SPIKE",      icon: "🏦", neonHsl: "20 60% 35%" },
  society_maintenance: { category: "SOCIETY",        subtitle: "MAINT.",     icon: "🏢", neonHsl: "205 70% 40%" },
};

// "Career start" corner — only for tile id 0 (PAY DAY) we mark as the start corner.
export const START_TILE_ID = 0;

export const getTileMeta = (type: TileType): TileMeta => TILE_META[type];