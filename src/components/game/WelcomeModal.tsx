import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  playerName: string;
  profession: string;
  onStart: () => void;
  onChangeProfession: () => void;
}

export const WelcomeModal = ({
  open,
  playerName,
  profession,
  onStart,
  onChangeProfession,
}: WelcomeModalProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-xl border-2 p-0 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a1a 80%)",
          borderColor: "#FFD700",
        }}
      >
        {/* animated particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-yellow-300/40 animate-pulse"
              style={{
                width: `${4 + Math.random() * 6}px`,
                height: `${4 + Math.random() * 6}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative p-8 text-center text-yellow-50">
          <div className="flex justify-center mb-3">
            <Trophy className="w-12 h-12 text-yellow-400" />
          </div>
          <h1
            className="text-3xl font-extrabold mb-2"
            style={{ color: "#FFD700", textShadow: "0 0 12px rgba(255,215,0,0.5)" }}
          >
            🏆 Welcome to Escape the Rat Race!
          </h1>
          <p className="text-sm text-yellow-200/80 mb-4">
            {playerName} · {profession}
          </p>
          <p className="mb-4 text-yellow-50/90">
            Your mission: Build your wealth and reach{" "}
            <span className="text-yellow-300 font-bold">₹5,00,00,000</span> (₹5 Crore)
            in cash on hand.
          </p>
          <div className="text-left bg-black/30 border border-yellow-500/30 rounded-lg p-4 text-sm space-y-1 mb-4">
            <p>Along the way you'll face:</p>
            <ul className="list-disc list-inside text-yellow-100/90 space-y-1 pl-2">
              <li>Job losses and tax audits</li>
              <li>Medical emergencies and family expenses</li>
              <li>Market crashes and windfalls</li>
              <li>Investment opportunities that could make or break you</li>
            </ul>
          </div>
          <p className="text-xs italic text-yellow-200/80 mb-6">
            The player who reaches ₹5 Crore in hand earns the
            "Escape the Rat Race Financial Simulation" Certificate.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={onStart}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
            >
              Let's Go! 🚀
            </Button>
            <Button
              variant="outline"
              onClick={onChangeProfession}
              className="border-yellow-500/50 text-yellow-100 hover:bg-yellow-500/10"
            >
              Change Profession
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};