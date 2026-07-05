import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { GameState } from "@/types/game";
import {
  calculateMonthlyCashFlow,
  calculateNetWorth,
  calculateEffectiveSalary,
  calculateEffectivePassiveIncome,
  calculateTotalExpenses,
  calculateTotalEMI,
} from "@/lib/gameLogic";
import { TakeLoanDialog, RepayLoanDialog, PayOffDebtsDialog } from "./LoanDialogs";

const fmt = (n: number) => `₹${Math.round(n).toLocaleString()}`;

const InfoLabel = ({ label, tip }: { label: string; tip: string }) => (
  <TooltipProvider delayDuration={150}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help">
          {label}
          <Info className="w-3 h-3 text-muted-foreground" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{tip}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const prettyKey = (k: string) =>
  k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

interface GameDashboardProps {
  gameState: GameState;
  onRollDice: () => void;
  onSellAsset: (assetId: string) => void;
  onTakeLoan: (amount: number) => void;
  onRepayLoan: (amount: number) => void;
  onPayOffDebt: (key: string) => void;
}

export const GameDashboard = ({
  gameState, onRollDice, onSellAsset, onTakeLoan, onRepayLoan, onPayOffDebt,
}: GameDashboardProps) => {
  const [takeOpen, setTakeOpen] = useState(false);
  const [repayOpen, setRepayOpen] = useState(false);
  const [payoffOpen, setPayoffOpen] = useState(false);

  const effSalary  = calculateEffectiveSalary(gameState);
  const effPassive = calculateEffectivePassiveIncome(gameState);
  const totalEMI   = calculateTotalEMI(gameState);
  const totalExp   = calculateTotalExpenses(gameState);
  const totalIncome = effSalary + effPassive;
  const cashFlow   = calculateMonthlyCashFlow(gameState);
  const netWorth   = calculateNetWorth(gameState);

  const bank = gameState.liabilities.bankLoan;
  const otherDebts = Object.entries(gameState.liabilities).some(
    ([k, v]) => k !== "bankLoan" && v.principal > 0,
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-card to-accent border-border">
        {gameState.marketHint && (
          <div className={`mb-4 p-3 rounded-lg border text-sm font-medium ${
            gameState.marketHint.sentiment === "bullish"
              ? "bg-green-500/10 border-green-500/40 text-green-300"
              : gameState.marketHint.sentiment === "bearish"
              ? "bg-red-500/10 border-red-500/40 text-red-300"
              : "bg-yellow-500/10 border-yellow-500/40 text-yellow-300"
          }`}>
            {gameState.marketHint.headline}
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-primary">
            {gameState.onFastTrack ? "The Fast Track" : "The Rat Race"}
          </h1>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Cycle</p>
            <p className="text-lg font-semibold">{gameState.marketCycle}</p>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">Cash on Hand</p>
          <p className="text-5xl font-bold text-success tracking-wider">{fmt(gameState.cash)}</p>
          {gameState.charityUsed && (
            <p className="text-xs text-purple-400 mt-1">Charity active — next roll = 2 dice</p>
          )}
        </div>

        {gameState.diceValue && (
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center border-2 border-border">
              <span className="text-4xl font-bold">{gameState.diceValue}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onRollDice}
            disabled={gameState.isRolling || gameState.isOut}
            size="lg"
            className="col-span-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            Roll Dice
          </Button>
          <Button variant="outline" onClick={() => setTakeOpen(true)}>Take Loan</Button>
          <Button variant="outline" disabled={!bank || bank.principal <= 0 || gameState.cash <= 0} onClick={() => setRepayOpen(true)}>Repay Loan</Button>
          <Button variant="outline" className="col-span-2" disabled={!otherDebts || gameState.cash <= 0} onClick={() => setPayoffOpen(true)}>Pay Off Debts</Button>
        </div>
      </Card>

      {/* Financials */}
      <Card className="p-6 bg-card border-border space-y-4">
        <h2 className="text-xl font-bold border-b border-primary pb-2">
          {gameState.playerName} · {gameState.profession}
          {gameState.efficiency > 1 && (
            <span className="ml-2 text-sm text-green-400">({Math.round(gameState.efficiency * 100)}% Eff.)</span>
          )}
        </h2>

        <div>
          <h3 className="text-success font-bold mb-2">Income</h3>
          <div className="space-y-1 text-sm">
            <Row label="Salary" value={fmt(effSalary)} />
            <Row label={<InfoLabel label="Passive Income" tip="Total monthly income from your assets." />} value={fmt(effPassive)} />
            <Separator className="my-1" />
            <Row bold label="Total Income" value={fmt(totalIncome)} />
          </div>
        </div>

        <div>
          <h3 className="text-destructive font-bold mb-2">Expenses</h3>
          <div className="space-y-1 text-sm">
            {Object.entries(gameState.expenses).filter(([, v]) => v > 0).map(([k, v]) => (
              <Row key={k} label={prettyKey(k)} value={fmt(v)} />
            ))}
            {Object.entries(gameState.liabilities).filter(([, v]) => v.principal > 0).map(([k, v]) => (
              <Row key={k + "-emi"} label={`${prettyKey(k)} EMI`} value={fmt(v.emi)} />
            ))}
            <Separator className="my-1" />
            <Row bold label="Total Expenses" value={fmt(totalExp)} />
          </div>
        </div>

        <div className="bg-accent p-3 rounded-lg">
          <h3 className="font-bold mb-1"><InfoLabel label="Monthly Cash Flow" tip="Income − expenses & EMIs. This is your Pay Day amount." /></h3>
          <p className={`text-2xl font-bold ${cashFlow >= 0 ? "text-success" : "text-destructive"}`}>{fmt(cashFlow)}</p>
        </div>

        {gameState.assets.length > 0 && (
          <div>
            <h3 className="text-info font-bold mb-2">Assets</h3>
            <div className="space-y-2 text-sm">
              {gameState.assets.map((a) => (
                <div key={a.id} className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${a.risk === "low" ? "bg-green-500" : a.risk === "medium" ? "bg-yellow-500" : "bg-red-500"}`} />
                    <span className="truncate">{a.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`${a.income < 0 ? "text-destructive" : "text-success"} text-right`}>
                      {fmt(a.cost)}
                      {a.income !== 0 && <span className="text-xs ml-1">{a.income > 0 ? "+" : ""}{fmt(a.income)}/mo</span>}
                    </span>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => onSellAsset(a.id)}>Sell</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.entries(gameState.liabilities).filter(([, v]) => v.principal > 0).length > 0 && (
          <div>
            <h3 className="text-yellow-500 font-bold mb-2">Liabilities</h3>
            <div className="space-y-1 text-sm">
              {Object.entries(gameState.liabilities).filter(([, v]) => v.principal > 0).map(([k, v]) => (
                <Row key={k} label={`${prettyKey(k)} @${v.interestRate}%`} value={fmt(v.principal)} />
              ))}
            </div>
          </div>
        )}

        <div className="bg-primary/10 p-3 rounded-lg border border-primary flex justify-between items-center">
          <span className="font-bold"><InfoLabel label="Net Worth" tip="Cash + assets − liabilities." /></span>
          <span className={`text-xl font-bold ${netWorth >= 0 ? "text-success" : "text-destructive"}`}>{fmt(netWorth)}</span>
        </div>
      </Card>

      {/* Game log */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold mb-4 border-b border-primary pb-2">Game Log</h3>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {gameState.gameLog.map((log, i) => (
              <p key={i} className="text-sm">
                <span className="text-primary font-bold">→</span> {log}
              </p>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <TakeLoanDialog open={takeOpen} gameState={gameState} onClose={() => setTakeOpen(false)} onConfirm={onTakeLoan} />
      <RepayLoanDialog open={repayOpen} gameState={gameState} onClose={() => setRepayOpen(false)} onConfirm={onRepayLoan} />
      <PayOffDebtsDialog open={payoffOpen} gameState={gameState} onClose={() => setPayoffOpen(false)} onConfirm={onPayOffDebt} />
    </div>
  );
};

const Row = ({ label, value, bold }: { label: React.ReactNode; value: string; bold?: boolean }) => (
  <div className={`flex justify-between ${bold ? "font-bold" : ""}`}>
    <span>{label}</span>
    <span className="font-mono">{value}</span>
  </div>
);
