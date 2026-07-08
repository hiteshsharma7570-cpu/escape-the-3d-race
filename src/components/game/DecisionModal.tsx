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
import { Button } from "@/components/ui/button";
import { PendingDecision, MarketCard } from "@/types/game";
import { MARKET_CARDS } from "@/lib/gameLogic";
import { Heart, TrendingUp, Landmark, Building2, Sparkles } from "lucide-react";

interface DecisionModalProps {
  pendingDecision: PendingDecision | null;
  cash: number;
  onAccept: (extra?: { decisionChoiceIndex?: number }) => void;
  onDecline: () => void;
}

const fmt = (n: number) => `₹${n.toLocaleString()}`;

export const DecisionModal = ({ pendingDecision, cash, onAccept, onDecline }: DecisionModalProps) => {
  if (!pendingDecision) return null;

  // --- CHARITY -------------------------------------------------------------
  if (pendingDecision.type === "charity") {
    const donation = pendingDecision.donation;
    const canAfford = cash >= donation;
    return (
      <AlertDialog open>
        <AlertDialogContent className="border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <Heart className="w-6 h-6 text-purple-500" />
              Charity
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-2">
              <p>Donate {fmt(donation)} (10% of total income) to use <b>2 dice</b> on your next roll?</p>
              <p className="text-sm text-muted-foreground">Your cash: {fmt(cash)}</p>
              {!canAfford && <p className="text-destructive text-sm">⚠️ Not enough cash.</p>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onDecline}>No Thanks</AlertDialogCancel>
            <AlertDialogAction disabled={!canAfford} onClick={() => onAccept()} className="bg-purple-600 hover:bg-purple-700 text-white">
              Donate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // --- MARKET CARD --------------------------------------------------------
  if (pendingDecision.type === "market_card") {
    const card = MARKET_CARDS.find((c) => c.id === pendingDecision.cardId) as MarketCard;
    return (
      <AlertDialog open>
        <AlertDialogContent className="border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle>📊 Market Event</AlertDialogTitle>
            <AlertDialogDescription className="text-base">{card?.text}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => onAccept()}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // --- DOODAD -------------------------------------------------------------
  if (pendingDecision.type === "doodad") {
    return (
      <AlertDialog open>
        <AlertDialogContent className="border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle>🛍️ {pendingDecision.label}</AlertDialogTitle>
            <AlertDialogDescription>You spent {fmt(pendingDecision.cost)}.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => onAccept()}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // --- LOAN FOR ASSET -----------------------------------------------------
  if (pendingDecision.type === "loan_for_asset") {
    const { totalCost, shortfall, loanAmount, newEMI, card } = pendingDecision;
    return (
      <AlertDialog open>
        <AlertDialogContent className="border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Landmark className="w-5 h-5" /> Take a Loan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-2">
              <p>You need <b>{fmt(shortfall)}</b> more to buy <b>{card.name}</b> (total {fmt(totalCost)}).</p>
              <div className="bg-accent p-3 rounded-lg text-sm space-y-1">
                <p>Loan amount: <b>{fmt(loanAmount)}</b> @ 12% APR</p>
                <p>New monthly EMI: <b>{fmt(newEMI)}</b></p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onDecline}>Pass</AlertDialogCancel>
            <AlertDialogAction onClick={() => onAccept()} className="bg-green-600 hover:bg-green-700 text-white">
              Take Loan &amp; Buy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // --- OPPORTUNITY --------------------------------------------------------
  if (pendingDecision.type === "opportunity") {
    const { card, costAfterCycle } = pendingDecision;
    return (
      <AlertDialog open>
        <AlertDialogContent className="border-primary max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              Opportunity: {card.name}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-3">
              <p>{card.description}</p>
              <p className="text-sm text-muted-foreground">Your cash: {fmt(cash)}</p>

              {card.cardType === "simple" && (
                <div className="bg-accent p-3 rounded-lg text-sm">
                  <p>Cost: <b className="text-destructive">{fmt(costAfterCycle)}</b></p>
                  <p>Monthly income: <b className="text-success">+{fmt(card.income)}</b></p>
                </div>
              )}

              {card.cardType === "stock" && (
                <div className="bg-accent p-3 rounded-lg text-sm">
                  <p>{card.shares} shares × {fmt(card.pricePerShare)} = <b>{fmt(card.pricePerShare * card.shares)}</b></p>
                </div>
              )}

              {card.cardType === "decision" && (
                <div className="space-y-2">
                  {card.choices.map((choice, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => onAccept({ decisionChoiceIndex: i })}
                    >
                      <span>{choice.text}</span>
                      <span>{fmt(choice.cost)} → +{fmt(choice.reward)}/mo ({Math.round(choice.successChance * 100)}%)</span>
                    </Button>
                  ))}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onDecline}>Pass</AlertDialogCancel>
            {card.cardType !== "decision" && (
              <AlertDialogAction onClick={() => onAccept()} className="bg-blue-600 hover:bg-blue-700 text-white">
                Buy
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // --- FAST TRACK BUY (Business / Dream) ---------------------------------
  if (pendingDecision.type === "fast_track_buy") {
    const { tileType, label, cost, income } = pendingDecision;
    const canAfford = cash >= cost;
    const isBusiness = tileType === "ft_business";
    return (
      <AlertDialog open>
        <AlertDialogContent className="border-primary max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              {isBusiness ? <Building2 className="w-6 h-6 text-cyan-500" /> : <Sparkles className="w-6 h-6 text-amber-500" />}
              {isBusiness ? "Big Business Deal" : "Live the Dream"}: {label}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-3">
              <p>
                {isBusiness
                  ? `A Fast Track business opportunity has landed on your table.`
                  : `A once-in-a-lifetime dream is within reach.`}
              </p>
              <div className="bg-accent p-3 rounded-lg text-sm space-y-1">
                <p>Cost: <b className="text-destructive">{fmt(cost)}</b></p>
                {isBusiness && (
                  <p>Monthly income: <b className="text-success">+{fmt(income)}</b></p>
                )}
                <p className="text-muted-foreground">Your cash: {fmt(cash)}</p>
              </div>
              {!canAfford && <p className="text-destructive text-sm">⚠️ Not enough cash to buy this.</p>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onDecline}>Skip</AlertDialogCancel>
            <AlertDialogAction
              disabled={!canAfford}
              onClick={() => onAccept()}
              className={isBusiness ? "bg-cyan-600 hover:bg-cyan-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"}
            >
              {isBusiness ? "Buy Business" : "Buy Dream"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return null;
};
