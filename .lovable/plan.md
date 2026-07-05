# Full Game Restructure — Rat Race + Fast Track

Rebuilding the game to match the uploaded reference (`pasted-2026-07-05T10-13-35-496Z.txt`, 1825 lines) inside the current React + R3F stack. This reintroduces recurring expenses, liabilities, and loans that were previously removed — as explicitly confirmed.

## Scope

- Keep React + React Three Fiber (no switch to raw three.js).
- Two boards: 20-tile Rat Race ring, 12-tile Fast Track ring, with animated 3D pawn.
- Professions with cash / salary / expenses (taxes + other) / liabilities (mortgage, car loan, credit card, +student loan for Doctor).
- Opportunity deck (18 cards: 8 stocks, 5 real estate, 4 businesses, 1 decision-tree startup), Beginner deck (2 cards for turns 1–5), Market deck (10+ event cards), Doodad tiles (fixed cost).
- Market cycles: Normal / Boom / Recession with `turnsUntilCycleChange` counter; affects opportunity cost multipliers (Boom ×1.5, Recession ×0.7).
- Loans: bank loan up to `salary × 20`, 12% APR, EMI over 60 months; take/repay UI; loan-for-down-payment modal on opportunity when short.
- Pay off debts (mortgage, car loan, credit card, student loan) — full-principal payoff only.
- Bankruptcy: if `cash < 0` on payday, forced asset sale at 80% of cost, else player is out.
- Charity: donate 10% of total income → next roll uses 2 dice.
- Baby: adds recurring `children` expense = `(salary/10) × childrenCount`.
- Downsized: skip 2 turns + pay one month's shortfall in cash.
- TBS Financial Course (turn 31): ₹50,000 as 5×₹10k EMI → permanent +20% efficiency on salary + passive.
- Escape Rat Race when `passiveIncome > totalExpenses` → move to Fast Track.
- Fast Track: Cash Flow Day (`passiveIncome × 10`), Business (buy income asset), Dream (win condition, only after turn 40), Divorce/Lawsuit/Charity Ball (event tiles).
- Win = buy any Dream on Fast Track. Certificates: Fast Track escape, Win (appreciation), Game Over (participation).

## File-by-file changes

### New / rewritten
```
src/types/game.ts                       — new schema (see below)
src/lib/gameData.ts                     — professions, boards, card decks, market cards
src/lib/gameLogic.ts                    — full rewrite: EMI, loans, tile handlers, cycles, bankruptcy
src/components/game/GameBoard3D.tsx     — new R3F Rat Race + Fast Track boards, pawn animation
src/components/game/GameDashboard.tsx   — rewritten HUD: cash, salary, passive, cash flow, assets, expenses, liabilities
src/components/game/OpportunityModal.tsx — stock / simple / decision variants + loan-for-shortfall
src/components/game/CharityModal.tsx    — donate for 2-dice bonus
src/components/game/LoanDialogs.tsx     — take / repay / pay off debts
src/components/game/BankruptcyDialog.tsx — sell assets at 80%
src/components/game/FinancialCourseModal.tsx — turn-31 offer
src/components/game/WinScreen.tsx       — rewritten: Fast Track / Win / Participation certificates
src/pages/Index.tsx                     — new game loop wiring
```

### Removed / retired
- `GameBoard2D.tsx` (replaced by 3D)
- `HudPanels.tsx` (folded into GameDashboard)
- Achievement badges tied to old model — reconciled to new events
- Old `aiSchema.ts` opportunity generator — the new deck is deterministic; keep file as a thin type export

### Kept as-is
- Routing, PlayerSetup name entry, Leaderboard/LocalLeaderboard, room/friends dialogs, Maintenance page.

## Data model (types/game.ts)

```ts
type ProfessionKey = 'engineer' | 'doctor' | 'teacher' | 'pilot';
interface Liability { principal: number; emi: number; interestRate: number; }
interface Asset {
  name: string; type: 'paper'|'real_estate'|'business'|'stock'|'land';
  cost: number; income: number; volatile?: boolean;
  shares?: number; company?: string;
}
interface PlayerState {
  name: string; color: string; professionName: string;
  cash: number; salary: number; passiveIncome: number; cashFlow: number;
  efficiency: number;                              // 1.0, or 1.2 after course
  expenses: Record<string, number>;                // taxes, other, children, ...
  liabilities: Record<string, Liability>;          // mortgage, carLoan, creditCard, bankLoan, courseLoan, ...
  assets: Asset[];
  position: number; ftPosition: number;
  onFastTrack: boolean; charityUsed: boolean;
  skipTurns: number; childrenCount: number;
  missedEMIs: number; bankruptcies: number;
  hasTakenCourse: boolean; isOut: boolean;
  decisionHistory: Array<{type:'buy'|'pass'|'loan'|'charity'; turn:number; [k:string]:any}>;
}
interface GameState {
  player: PlayerState | null;
  gamePhase: 'setup'|'rat_race'|'finished';
  opportunityCardIndex: number; marketCardIndex: number;
  marketCycle: 'Normal'|'Boom'|'Recession';
  turnsUntilCycleChange: number; turn: number;
}
```

## Board layouts

**Rat Race (20 tiles)** — matches uploaded `ratRaceLayout` exactly:
Pay Day → Opportunity → New Phone (₹50k) → Market → Opportunity → Charity → Pay Day → Baby! → Opportunity → Dinner Out (₹8k) → Market → Opportunity → Downsized! → Pay Day → Opportunity → Vacation (₹100k) → Market → Opportunity → Charity → Pay Day.

**Fast Track (12 tiles)** — matches uploaded `fastTrackLayout` exactly:
E-Commerce Store (₹20L/₹40k) → World Tour dream (₹50L) → Cash Flow Day → Apartment Complex (₹80L/₹1L) → Charity Ball → Dream Car (₹80L) → Cash Flow Day → Software Company (₹1.5Cr/₹2.5L) → Divorce → Yacht (₹1Cr) → Cash Flow Day → Lawsuit.

## Key formulas

- **EMI**: `P·r(1+r)^n / ((1+r)^n − 1)` where `r = APR/1200`, `n = 60`.
- **Total expenses**: `Σ expenses + Σ liability.emi`.
- **Cash flow**: `(salary + passiveIncome) × efficiency − totalExpenses`.
- **Payday**: `cash += cashFlow`.
- **Boom/Recession opportunity cost**: `cost × 1.5` / `× 0.7`.
- **Escape**: `passiveIncome × efficiency > totalExpenses`.
- **Bankruptcy sale**: `salePrice = asset.cost × 0.8`.
- **Cash Flow Day (FT)**: `passiveIncome × 10`.
- **Baby recurring**: `expenses.children = (salary/10) × childrenCount`.
- **Downsized**: `skipTurns = 2`, cash hit = `max(0, salary − cashFlow)`.
- **Market cycle**: decrement `turnsUntilCycleChange` each turn; on 0 pick new cycle randomly, reset counter to 5–9.

## Verification

- Typecheck after each major module.
- Playwright smoke: setup → engineer → roll → land on Pay Day, Opportunity (buy + pass + shortfall-loan), Doodad, Market, Charity, Baby, Downsized → verify HUD math and asset list update.

## What I need from you before I start

**Confirm the plan.** Two specific choices worth flagging:

1. **Persistence** — the uploaded file saves/loads from `erp.taxila.in/api/game/rat-race`. Should I (a) drop remote save entirely, (b) keep local-only via `localStorage`, or (c) wire it to Lovable Cloud (Supabase) with RLS? I recommend (b) — matches current app scope.
2. **Certificate downloads** — uploaded uses raw canvas + `toDataURL('image/png')`. Keep the existing `jsPDF`-based cert components (`CashCertificateModal`, `FiveCroreCertificate`) as-is for milestone/₹5Cr, and add a third R3F-style Fast Track cert? Or fully replace with the reference's canvas approach?

Reply "go" (with picks for #1 and #2) and I'll implement in this order:
types → gameData → gameLogic → OpportunityModal + LoanDialogs → GameBoard3D → GameDashboard → Index.tsx wiring → WinScreen → typecheck → smoke test.
