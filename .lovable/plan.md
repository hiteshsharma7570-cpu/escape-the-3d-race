
## Goal

Right now everything that costs money each month is jammed into a single `liabilities` array — actual debts (Home Loan with ₹20L principal) sit next to pure recurring bills (Mobile EMI ₹0 principal, Insurance Premium, Electricity). That conflates two different things and makes the financial dashboard wrong (e.g. "Liabilities count" includes utilities, net worth treats utilities as zero-balance debts, the "payOffDebts" action can't tell the difference).

This plan restructures the model cleanly and seeds richer, more interesting Indian-context bills and debts.

## New data model

Two distinct arrays on `GameState`:

1. `liabilities: Liability[]` — true debts with outstanding principal
   ```
   { id, name, category, principal, monthlyEMI, interestRate }
   ```
   Categories: `home_loan | vehicle_loan | education_loan | personal_loan | credit_card | business_loan | medical_debt | gold_loan`

2. `expenses: Expense[]` — recurring monthly outflows, no principal
   ```
   { id, name, category, monthlyAmount, essential }
   ```
   Categories: `rent | utilities | insurance | subscription | childcare | lifestyle | professional | maintenance | transport | food`

Monthly cash-flow becomes:
`salary + passiveIncome − Σ(liability.monthlyEMI) − Σ(expense.monthlyAmount)`

Net worth uses only `liability.principal` (not expenses) — fixes the silent bug today.

## New liabilities (debts) added to the catalog

- Gold Loan (low principal, high EMI, cultural staple)
- Wedding Loan (one-shot, large, triggered by life event)
- Business Working-Capital Loan (Business Owner only)
- Health-Crisis EMI (created on `medical_emergency` when underinsured)
- BNPL Trap (created on multiple `lifestyle` tile hits — high interest)

## New recurring expenses added to the catalog

- DTH / OTT Bundle (Netflix + Hotstar + Prime)
- Mobile + Broadband
- Domestic Help / Cook
- Petrol & Fuel
- Gym / Fitness Membership
- Parents' Allowance (cultural)
- Cloud / Software Subscriptions (Engineer, Business Owner)
- Clinic Consumables (Doctor)
- Office Internet & Telephony (Lawyer, Business Owner)

## New tile events (added to the existing board)

- `gold_loan_offer` — pawn gold for fast cash, adds Gold Loan liability
- `wedding_in_family` — large one-shot cost; partial loan if cash short
- `subscription_creep` — silently adds a new ₹500–₹2,000 subscription
- `fuel_price_hike` — bumps all `transport` expenses 10–25%
- `parents_medical` — one-shot OR adds Parents' Medical Insurance expense
- `gst_notice` — Business Owner / Lawyer specific cash hit
- `bonus` — one-time positive (balances the new pain)
- `tax_refund` — small positive cash event

## Rewritten profession defaults

Each profession gets a realistic mix split across the two buckets. Example shape (Engineer):

```text
Liabilities:
  Home Loan         principal 35L  EMI 32,000  rate 8.5%
  Car Loan          principal  6L  EMI 12,000  rate 9.0%
  Education Loan    principal  4L  EMI  8,000  rate 7.5%
  Credit Card       principal 50k  EMI  5,000  rate 36%

Expenses:
  Rent              18,000  rent
  Society Maint.     4,000  maintenance
  Electricity        3,500  utilities
  Mobile + Net       2,500  utilities
  OTT Bundle         1,200  subscription
  Cloud / SaaS       3,000  subscription
  Fuel               6,000  transport
  Gym                2,000  lifestyle
  Parents' Allow.   10,000  lifestyle
```

Teacher, Doctor, Lawyer, Business Owner each get a similarly honest split.

## Affected files

- `src/types/game.ts` — new `Expense` type, `LiabilityCategory`, `ExpenseCategory`, `Liability` gains `category`/`principal`/`interestRate`, `GameState.expenses`, `ProfessionProfile` updated, `PROFESSION_PROFILES` rewritten.
- `src/lib/gameLogic.ts` — `calculateMonthlyCashFlow` / `calculateTotalExpenses` use both arrays; every existing tile case that pushes into `liabilities` is routed to the correct array; new tile types + cases added; `BOARD_TILES` extended (no removals); `G` gradient/icon entries added; `payOffDebts` only touches real liabilities.
- `src/lib/tileMeta.ts` — meta entries for each new tile type.
- `src/components/game/CashFlowSheet.tsx` (and any portfolio/dashboard panel that lists liabilities) — render two sections: "Debts" and "Recurring Expenses", show category badges. (I'll grep for every consumer of `state.liabilities` and update.)
- `src/components/game/GameBoard2D.tsx` — dashboard `liabilities.length` becomes `liabilities.length + expenses.length` (or shown as `D/E` split).
- `src/lib/reportCard.ts` — end-of-game stats include debts cleared vs expenses cut.

## Migration safety

`createInitialGameState` will populate both arrays so no existing screen breaks. Any place that still reads `liabilities[i].monthlyPayment` will be updated in the same pass — I'll do a repo-wide grep before shipping so nothing is missed.

## Out of scope

- No changes to win conditions, Supabase schema, achievements, multiplayer, or the 36-tile loop structure.
- No visual redesign of the board itself.
