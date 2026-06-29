import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GameState, Liability } from "@/types/game";

interface RepayLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameState: GameState;
  onRepay: (liabilityId: string, amount: number) => void;
}

export const RepayLoanDialog = ({ open, onOpenChange, gameState, onRepay }: RepayLoanDialogProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amountStr, setAmountStr] = useState("");

  const liabilities = gameState.liabilities;
  const selected: Liability | undefined = useMemo(
    () => liabilities.find(l => l.id === selectedId),
    [liabilities, selectedId]
  );

  const amountNum = Number(amountStr.replace(/[^0-9]/g, "")) || 0;
  const canAfford = amountNum > 0 && amountNum <= gameState.cash && selected && amountNum <= selected.principal;

  const handleSelect = (l: Liability) => {
    setSelectedId(l.id);
    const max = Math.min(l.principal, gameState.cash);
    setAmountStr(String(max));
  };

  const handleConfirm = () => {
    if (!selected || !canAfford) return;
    onRepay(selected.id, amountNum);
    setSelectedId(null);
    setAmountStr("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Repay a Loan</DialogTitle>
          <DialogDescription>
            Pick any outstanding debt and choose how much principal to pay down.
            Cash available: <span className="font-semibold text-success">₹{gameState.cash.toLocaleString()}</span>
          </DialogDescription>
        </DialogHeader>

        {liabilities.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            You're debt-free. Nothing to repay!
          </p>
        ) : (
          <>
            <ScrollArea className="max-h-[280px] pr-2">
              <div className="space-y-2">
                {liabilities.map((l) => {
                  const isSel = l.id === selectedId;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => handleSelect(l)}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${
                        isSel
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-accent"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{l.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {(l.category ?? "loan").replace(/_/g, " ")} · {l.interestRate}% p.a. · EMI ₹{l.monthlyEMI.toLocaleString()}/mo
                          </p>
                        </div>
                        <span className="text-destructive font-bold whitespace-nowrap">
                          ₹{l.principal.toLocaleString()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            {selected && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div>
                  <label className="text-sm font-medium">Amount to repay (₹)</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="0"
                    className="mt-1"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAmountStr(String(Math.min(selected.principal, gameState.cash)))}
                    >
                      Max payable
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAmountStr(String(Math.floor(Math.min(selected.principal, gameState.cash) / 2)))}
                    >
                      Half
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAmountStr(String(selected.principal))}
                    >
                      Full ₹{selected.principal.toLocaleString()}
                    </Button>
                  </div>
                  {amountNum > gameState.cash && (
                    <p className="text-xs text-destructive mt-1">Not enough cash.</p>
                  )}
                  {selected && amountNum > selected.principal && (
                    <p className="text-xs text-destructive mt-1">Amount exceeds remaining principal.</p>
                  )}
                </div>
                <Button
                  className="w-full"
                  disabled={!canAfford}
                  onClick={handleConfirm}
                >
                  Repay ₹{amountNum.toLocaleString()} of {selected.name}
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};