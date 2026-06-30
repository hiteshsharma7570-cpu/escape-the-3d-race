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
  vacation:           { category: "VACATION",     subtitle: "GETAWAY -₹",  icon: "🏝️", neonHsl: "170 80% 50%" },
  dinner:             { category: "DINNER OUT",   subtitle: "TREAT -₹",    icon: "🍽️", neonHsl: "0 90% 60%" },
  downsized:          { category: "DOWNSIZED",    subtitle: "-INCOME",     icon: "📉", neonHsl: "0 90% 60%" },
  tax_audit:          { category: "TAX AUDIT",    subtitle: "-PAY",        icon: "🧾", neonHsl: "0 90% 60%" },
  medical_emergency:  { category: "MEDICAL",      subtitle: "EMERGENCY",   icon: "🏥", neonHsl: "0 90% 60%" },
  side_hustle:        { category: "SIDE HUSTLE",  subtitle: "EARN",        icon: "💻", neonHsl: "80 95% 55%" },
  inheritance:        { category: "INHERITANCE",  subtitle: "BONUS",       icon: "🎁", neonHsl: "50 100% 60%" },
  real_estate_boom:   { category: "REAL ESTATE",  subtitle: "BOOM",        icon: "🏠", neonHsl: "42 100% 58%" },
  stock_market_crash: { category: "RECESSION",    subtitle: "MARKET CRASH",icon: "🐻", neonHsl: "0 85% 50%" },
  rate_hike:           { category: "RATE HIKE",      subtitle: "RBI MOVE",   icon: "📈", neonHsl: "0 75% 50%" },
  insurance_premium:   { category: "INSURANCE",      subtitle: "PREMIUM",    icon: "🛡️", neonHsl: "280 70% 55%" },
  home_repair:         { category: "HOME REPAIR",    subtitle: "URGENT FIX", icon: "🔧", neonHsl: "25 90% 55%" },
  traffic_fine:        { category: "TRAFFIC FINE",   subtitle: "CHALLAN",    icon: "🚦", neonHsl: "0 90% 60%" },
  credit_card_bill:    { category: "CC BILL",        subtitle: "DUE",        icon: "💳", neonHsl: "0 80% 50%" },
  school_fees:         { category: "SCHOOL FEES",    subtitle: "TERM PAY",   icon: "🎒", neonHsl: "210 90% 58%" },
  festival_expense:    { category: "FESTIVAL",       subtitle: "CELEBRATE -₹", icon: "🪔", neonHsl: "40 100% 58%" },
  electricity_bill:    { category: "ELECTRICITY",    subtitle: "BILL",       icon: "⚡", neonHsl: "50 95% 55%" },
  rent_hike:           { category: "RENT HIKE",      subtitle: "+RENT",      icon: "🏠", neonHsl: "0 70% 45%" },
  vehicle_breakdown:   { category: "VEHICLE",        subtitle: "REPAIR",     icon: "🚗", neonHsl: "210 5% 55%" },
  loan_interest_spike: { category: "INTEREST",       subtitle: "SPIKE",      icon: "🏦", neonHsl: "20 60% 35%" },
  society_maintenance: { category: "SOCIETY",        subtitle: "MAINT.",     icon: "🏢", neonHsl: "205 70% 40%" },
  gold_loan_offer:     { category: "GOLD LOAN",      subtitle: "PAWN",       icon: "🪙", neonHsl: "45 95% 55%" },
  wedding_in_family:   { category: "WEDDING",        subtitle: "BIG SPEND",  icon: "💍", neonHsl: "0 75% 55%" },
  subscription_creep:  { category: "SUBSCRIPTION",   subtitle: "AUTO-DEBIT TRAP", icon: "📺", neonHsl: "280 60% 55%" },
  fuel_price_hike:     { category: "FUEL HIKE",      subtitle: "PUMP PAIN",  icon: "⛽", neonHsl: "10 80% 45%" },
  parents_medical:     { category: "PARENTS",        subtitle: "CARE",       icon: "👴", neonHsl: "210 15% 55%" },
  gst_notice:          { category: "GST NOTICE",     subtitle: "COMPLIANCE", icon: "🧾", neonHsl: "210 70% 45%" },
  bonus:               { category: "BONUS",          subtitle: "+CASH",      icon: "🎉", neonHsl: "140 90% 55%" },
  tax_refund:          { category: "TAX REFUND",     subtitle: "+CASH",      icon: "💸", neonHsl: "165 80% 50%" },
  bnpl_trap:           { category: "BNPL TRAP",      subtitle: "AUTO-DEBIT", icon: "🛍️", neonHsl: "330 75% 55%" },
  solar_install:       { category: "GO SOLAR",       subtitle: "ROOFTOP",    icon: "☀️", neonHsl: "45 100% 55%" },
  ev_switch:           { category: "GO EV",          subtitle: "SWAP CAR",   icon: "🔋", neonHsl: "150 75% 50%" },
  streaming_audit:     { category: "OTT AUDIT",      subtitle: "CUT BILLS",  icon: "✂️", neonHsl: "180 70% 55%" },
  pet_adoption:        { category: "PET ADOPT",      subtitle: "+CARE",      icon: "🐶", neonHsl: "30 85% 60%" },
  elderly_care_hire:   { category: "ELDER CARE",     subtitle: "CAREGIVER",  icon: "🧓", neonHsl: "260 50% 60%" },
  payday_loan:         { category: "PAYDAY LOAN",    subtitle: "HIGH RATE",  icon: "💸", neonHsl: "350 85% 55%" },
  margin_call:         { category: "MARGIN CALL",    subtitle: "+DEBT",      icon: "📞", neonHsl: "0 90% 50%" },
  tax_arrears:         { category: "TAX ARREARS",    subtitle: "+DEBT",      icon: "🧾", neonHsl: "15 70% 45%" },
};

// "Career start" corner — only for tile id 0 (PAY DAY) we mark as the start corner.
export const START_TILE_ID = 0;

export const getTileMeta = (type: TileType): TileMeta => TILE_META[type];