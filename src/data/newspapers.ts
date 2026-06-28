export type TileHint =
  | 'market_boom'
  | 'market_crash'
  | 'opportunity_high'
  | 'opportunity_low'
  | 'tax_incoming'
  | 'salary_up'
  | 'expense_incoming'
  | 'windfall'
  | 'neutral';

export interface NewspaperHeadline {
  id: string;
  headline: string;
  subheadline: string;
  hint: TileHint;
  sentiment: 'positive' | 'negative' | 'neutral' | 'warning';
  paperName: string;
  section: string;
}

export const NEWSPAPERS: NewspaperHeadline[] = [
  { id: 'n1', headline: 'RBI Slashes Repo Rate to 4-Year Low', subheadline: 'Experts predict property prices to surge. Time to invest?', hint: 'market_boom', sentiment: 'positive', paperName: 'The Financial Express', section: 'Economy' },
  { id: 'n2', headline: 'Sensex Tanks 2,400 Points in Single Session', subheadline: 'FIIs pull out ₹18,000 crore. Panic selling grips Dalal Street.', hint: 'market_crash', sentiment: 'negative', paperName: 'Business Standard', section: 'Markets' },
  { id: 'n3', headline: 'Startup Funding Hits Record ₹92,000 Crore This Quarter', subheadline: 'Angel investors hunt for the next unicorn across Tier-2 cities.', hint: 'opportunity_high', sentiment: 'positive', paperName: 'The Economic Times', section: 'Startups' },
  { id: 'n4', headline: 'IT Layoffs Sweep Bengaluru — 40,000 Jobs Cut', subheadline: 'Major tech firms downsize amid global slowdown. Job market shaky.', hint: 'expense_incoming', sentiment: 'negative', paperName: 'Deccan Herald', section: 'Jobs' },
  { id: 'n5', headline: 'Income Tax Department Launches Operation Clean Slate', subheadline: 'Random audits to target salaried class. Keep your documents ready.', hint: 'tax_incoming', sentiment: 'warning', paperName: 'Hindustan Times', section: 'Tax' },
  { id: 'n6', headline: 'Real Estate Boom: Mumbai Flat Prices Up 28% This Year', subheadline: 'Tier-1 city properties deliver best returns in a decade.', hint: 'market_boom', sentiment: 'positive', paperName: 'Times of India', section: 'Real Estate' },
  { id: 'n7', headline: 'Crypto Bloodbath: Bitcoin Loses 35% in 48 Hours', subheadline: 'Altcoins devastated. Experts warn of further correction ahead.', hint: 'market_crash', sentiment: 'negative', paperName: 'CryptoIndia', section: 'Crypto' },
  { id: 'n8', headline: '7th Pay Commission Revision: Govt Employees Get 18% Hike', subheadline: 'DA arrears to be paid in lump sum. Spending surge expected.', hint: 'salary_up', sentiment: 'positive', paperName: 'The Hindu', section: 'Policy' },
  { id: 'n9', headline: 'GST Council Hikes Tax on Luxury Goods to 32%', subheadline: 'Dining out, holidays, and premium cars to cost significantly more.', hint: 'expense_incoming', sentiment: 'negative', paperName: 'Business Today', section: 'Tax' },
  { id: 'n10', headline: 'Gold Hits All-Time High of ₹72,000 Per 10g', subheadline: 'Safe haven demand surges as global uncertainty mounts.', hint: 'opportunity_high', sentiment: 'positive', paperName: 'The Mint', section: 'Commodities' },
  { id: 'n11', headline: 'Insurance Regulator IRDAI Mandates New Health Cover Rules', subheadline: 'All employers must offer minimum ₹5L health cover by next year.', hint: 'neutral', sentiment: 'neutral', paperName: 'Financial Express', section: 'Insurance' },
  { id: 'n12', headline: 'Monsoon Deficit at 34%: Rural Economy Under Severe Stress', subheadline: 'Farm incomes collapse. FMCG companies brace for demand drop.', hint: 'market_crash', sentiment: 'negative', paperName: 'Deccan Chronicle', section: 'Economy' },
  { id: 'n13', headline: 'Mutual Fund SIP Inflows Cross ₹20,000 Crore Monthly First Time', subheadline: 'Retail investors show maturity. Long-term wealth creation on track.', hint: 'opportunity_high', sentiment: 'positive', paperName: 'Value Research', section: 'Mutual Funds' },
  { id: 'n14', headline: 'RBI Warns of Rising Household Debt in Urban India', subheadline: 'Personal loan defaults up 22%. Credit card dues at record high.', hint: 'expense_incoming', sentiment: 'warning', paperName: 'Business Standard', section: 'Banking' },
  { id: 'n15', headline: 'Budget 2025: Standard Deduction Raised to ₹1 Lakh', subheadline: 'Middle class gets tax relief. Disposable income set to rise.', hint: 'windfall', sentiment: 'positive', paperName: 'The Economic Times', section: 'Budget' },
  { id: 'n16', headline: 'Infra Push: Govt to Spend ₹11 Lakh Crore on Roads, Ports, Rail', subheadline: 'Construction and cement stocks surge on announcement.', hint: 'market_boom', sentiment: 'positive', paperName: 'The Hindu BusinessLine', section: 'Infrastructure' },
  { id: 'n17', headline: 'SEBI Cracks Down on Finfluencers — 47 Accounts Banned', subheadline: 'Investors warned against unregistered investment advice online.', hint: 'neutral', sentiment: 'warning', paperName: 'Mint', section: 'Regulation' },
  { id: 'n18', headline: 'Diwali Bonus Season: Corporates Roll Out Record Payouts', subheadline: 'Average bonus up 24% this year. Consumer spending to spike.', hint: 'windfall', sentiment: 'positive', paperName: 'Times of India', section: 'Corporate' },
  { id: 'n19', headline: 'Fuel Prices Hiked ₹8 Per Litre — Third Revision This Year', subheadline: 'Transport costs to rise. Inflation fears return to market.', hint: 'expense_incoming', sentiment: 'negative', paperName: 'NDTV Profit', section: 'Energy' },
  { id: 'n20', headline: 'Angel Tax Abolished: Startups Cheer, Investors Return', subheadline: 'Early stage funding expected to double in next 12 months.', hint: 'opportunity_high', sentiment: 'positive', paperName: 'Inc42', section: 'Startups' },
  { id: 'n21', headline: 'Recession Fears: IMF Cuts India Growth Forecast to 5.1%', subheadline: 'Global headwinds intensify. Export sectors brace for impact.', hint: 'market_crash', sentiment: 'negative', paperName: 'Financial Times India', section: 'Global' },
  { id: 'n22', headline: 'Health Insurance Claims Surge 60% Post Pandemic', subheadline: 'Premiums expected to rise 20% at next renewal cycle.', hint: 'expense_incoming', sentiment: 'warning', paperName: 'Insurance Watch', section: 'Health' },
  { id: 'n23', headline: 'Nifty 50 at All-Time High — Bull Run Enters Third Year', subheadline: 'Analysts divided: Is this the peak or just the beginning?', hint: 'market_boom', sentiment: 'positive', paperName: 'Moneycontrol', section: 'Markets' },
  { id: 'n24', headline: 'Income Tax Raids Uncover ₹400 Crore Unaccounted Cash', subheadline: 'IT dept intensifies scrutiny on high-income individuals.', hint: 'tax_incoming', sentiment: 'warning', paperName: 'Times of India', section: 'Tax' },
  { id: 'n25', headline: 'UPI Transactions Hit 15 Billion Monthly — Digital India Surges', subheadline: 'Fintech sector booms. New investment apps see record signups.', hint: 'opportunity_high', sentiment: 'positive', paperName: 'Tech in Asia', section: 'Fintech' },
];

// Map tile types (from BOARD_TILES) to the hints they correspond to.
export const TILE_TYPE_TO_HINTS: Record<string, TileHint[]> = {
  payday: ['salary_up'],
  opportunity: ['opportunity_high', 'opportunity_low'],
  market: ['market_boom', 'market_crash'],
  charity: ['neutral'],
  baby: ['expense_incoming'],
  vacation: ['expense_incoming'],
  dinner: ['expense_incoming'],
  downsized: ['expense_incoming'],
  tax_audit: ['tax_incoming'],
  medical_emergency: ['expense_incoming'],
  side_hustle: ['windfall'],
  inheritance: ['windfall'],
  real_estate_boom: ['market_boom', 'opportunity_high'],
  stock_market_crash: ['market_crash'],
};

/**
 * Pick a newspaper to display before a dice roll.
 * 70% chance: pick a headline whose hint matches one of the next 1..6 tiles.
 * 30% chance: pick a completely random headline (red herring).
 */
export const pickNewspaperForRoll = (
  currentPosition: number,
  boardSize: number,
  tileTypes: string[],
): NewspaperHeadline => {
  const random = Math.random();
  if (random < 0.7) {
    const candidateHints = new Set<TileHint>();
    for (let step = 1; step <= 6; step++) {
      const pos = (currentPosition + step) % boardSize;
      const type = tileTypes[pos];
      (TILE_TYPE_TO_HINTS[type] || []).forEach((h) => candidateHints.add(h));
    }
    const matches = NEWSPAPERS.filter((n) => candidateHints.has(n.hint));
    if (matches.length > 0) {
      return matches[Math.floor(Math.random() * matches.length)];
    }
  }
  return NEWSPAPERS[Math.floor(Math.random() * NEWSPAPERS.length)];
};