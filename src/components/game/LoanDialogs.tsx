import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GameState } from "@/types/game";
import { availableBankLoan, calculateEMI, maxLoanLimit } from "@/lib/gameLogic";

const fmt = (n: number) => `₹${(Number.isFinite(n) ? Math.round(n) : 0).toLocaleString()}`;
const safeNum = (v: unknown, fallback = 0): number => {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
};

// ---------------------- TAKE LOAN ----------------------
export const TakeLoanDialog = ({
  open,
  gameState,
  onClose,
  onConfirm,
}: {
  open: boolean;
  gameState: GameState;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}) => {
  const avail = safeNum(availableBankLoan(gameState));
  const [amount, setAmount] = useState(safeNum(Math.min(10000, avail)));
  const bank = gameState.liabilities.bankLoan ?? { principal: 0, emi: 0, interestRate: 12 };
  const principal = safeNum(bank.principal);
  const rate = safeNum(bank.interestRate, 12);
  const newEMI = safeNum(calculateEMI(principal + safeNum(amount), rate));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Take a Bank Loan</DialogTitle>
          <DialogDescription>
            12% APR · Max loan cap: {fmt(maxLoanLimit(gameState))} · Available: <b>{fmt(avail)}</b>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Amount (multiples of 1000)</Label>
          <Input
            type="number"
            min={1000}
            max={avail}
            step={1000}
            value={Number.isFinite(amount) ? amount : 0}
            onChange={(e) => setAmount(Math.min(avail, Math.max(0, safeNum(e.target.value))))}
          />
          <p className="text-sm text-muted-foreground">
            New monthly EMI: <b>{fmt(newEMI)}</b>
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={amount <= 0 || amount > avail || amount % 1000 !== 0}
            onClick={() => { onConfirm(amount); onClose(); }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Confirm Loan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---------------------- REPAY LOAN ----------------------
export const RepayLoanDialog = ({
  open,
  gameState,
  onClose,
  onConfirm,
}: {
  open: boolean;
  gameState: GameState;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}) => {
  const bank = gameState.liabilities.bankLoan;
  const cash = safeNum(gameState.cash);
  const principal = safeNum(bank?.principal);
  const maxRepay = Math.max(0, Math.min(cash, principal));
  const [amount, setAmount] = useState(maxRepay);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Repay Bank Loan</DialogTitle>
          <DialogDescription>
            Current loan: <b>{fmt(bank?.principal ?? 0)}</b>. Max repay: {fmt(maxRepay)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Amount (multiples of 1000)</Label>
          <Input
            type="number"
            min={0}
            max={maxRepay}
            step={1000}
            value={Number.isFinite(amount) ? amount : 0}
            onChange={(e) => setAmount(Math.min(maxRepay, Math.max(0, safeNum(e.target.value))))}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={amount <= 0 || amount > maxRepay || amount % 1000 !== 0}
            onClick={() => { onConfirm(amount); onClose(); }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Repay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---------------------- PAY OFF DEBTS ----------------------
export const PayOffDebtsDialog = ({
  open,
  gameState,
  onClose,
  onConfirm,
}: {
  open: boolean;
  gameState: GameState;
  onClose: () => void;
  onConfirm: (key: string) => void;
}) => {
  const debts = Object.entries(gameState.liabilities)
    .filter(([k, v]) => k !== "bankLoan" && v.principal > 0);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay Off Debt</DialogTitle>
          <DialogDescription>You have {fmt(gameState.cash)}. You must pay the full principal.</DialogDescription>
        </DialogHeader>
        {debts.length === 0 && <p className="text-muted-foreground">No other debts to pay off.</p>}
        <div className="space-y-2">
          {debts.map(([k, v]) => (
            <Button
              key={k}
              variant="outline"
              disabled={gameState.cash < v.principal}
              className="w-full justify-between"
              onClick={() => { onConfirm(k); onClose(); }}
            >
              <span className="capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
              <span>{fmt(v.principal)}</span>
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
