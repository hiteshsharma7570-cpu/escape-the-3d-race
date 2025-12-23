import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PendingDecision } from "@/types/game";
import { Heart, TrendingUp } from "lucide-react";

interface DecisionModalProps {
  pendingDecision: PendingDecision | null;
  cash: number;
  onAccept: () => void;
  onDecline: () => void;
}

export const DecisionModal = ({
  pendingDecision,
  cash,
  onAccept,
  onDecline,
}: DecisionModalProps) => {
  if (!pendingDecision) return null;

  const isCharity = pendingDecision.type === "charity";
  const isOpportunity = pendingDecision.type === "opportunity";

  const canAfford = isCharity
    ? cash >= (pendingDecision.charityAmount || 0)
    : cash >= (pendingDecision.opportunity?.cost || 0);

  return (
    <AlertDialog open={!!pendingDecision}>
      <AlertDialogContent className="border-primary">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            {isCharity && (
              <>
                <Heart className="w-6 h-6 text-purple-500" />
                Charity Opportunity
              </>
            )}
            {isOpportunity && (
              <>
                <TrendingUp className="w-6 h-6 text-blue-500" />
                Investment Opportunity
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base space-y-3">
            {isCharity && (
              <div className="space-y-2">
                <p>Would you like to donate to charity?</p>
                <div className="bg-accent p-4 rounded-lg">
                  <p className="text-lg font-semibold text-foreground">
                    Donation Amount: ₹{pendingDecision.charityAmount?.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your current cash: ₹{cash.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            {isOpportunity && pendingDecision.opportunity && (
              <div className="space-y-2">
                <p>Would you like to invest in this opportunity?</p>
                <div className="bg-accent p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-foreground">
                      {pendingDecision.opportunity.name}
                    </p>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        pendingDecision.opportunity.risk === "low"
                          ? "bg-green-500/20 text-green-400"
                          : pendingDecision.opportunity.risk === "medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {pendingDecision.opportunity.risk.toUpperCase()} RISK
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pendingDecision.opportunity.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="ml-2 font-medium text-destructive">
                        ₹{pendingDecision.opportunity.cost.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Monthly Income:</span>
                      <span className="ml-2 font-medium text-success">
                        +₹{pendingDecision.opportunity.income.toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">ROI:</span>
                      <span className="ml-2 font-medium text-info">
                        {((pendingDecision.opportunity.income * 12 / pendingDecision.opportunity.cost) * 100).toFixed(1)}% per year
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your current cash: ₹{cash.toLocaleString()}
                  </p>
                  {!canAfford && (
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ Insufficient funds
                    </p>
                  )}
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDecline} className="bg-muted">
            No, Skip
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onAccept}
            disabled={!canAfford}
            className={`${
              isCharity
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {isCharity ? "Yes, Donate" : "Yes, Invest"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
