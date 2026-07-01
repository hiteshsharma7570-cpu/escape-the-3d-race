import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  GraduationCap,
  Wrench,
  Stethoscope,
  Scale,
  Briefcase,
  Sparkles,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { playerSchema } from "@/lib/validationSchemas";
import heroImage from "@/assets/hero-rat-race.jpg";

interface PlayerSetupProps {
  sessionName: string;
  onPlayerCreate: (playerName: string, profession: string) => void;
}

const professions = [
  { name: "Teacher", icon: GraduationCap },
  { name: "Engineer", icon: Wrench },
  { name: "Doctor", icon: Stethoscope },
  { name: "Lawyer", icon: Scale },
  { name: "Business Owner", icon: Briefcase },
] as const;

export const PlayerSetup = ({ sessionName, onPlayerCreate }: PlayerSetupProps) => {
  const [playerName, setPlayerName] = useState("");
  const [profession, setProfession] = useState<string>("Teacher");
  const [errors, setErrors] = useState<{ playerName?: string; profession?: string }>({});

  const handleSubmit = () => {
    const result = playerSchema.safeParse({ playerName, profession });
    if (!result.success) {
      const fieldErrors: { playerName?: string; profession?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'playerName') fieldErrors.playerName = err.message;
        if (err.path[0] === 'profession') fieldErrors.profession = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onPlayerCreate(result.data.playerName, result.data.profession);
  };

  const handleNameChange = (value: string) => {
    setPlayerName(value);
    if (errors.playerName) {
      const result = playerSchema.shape.playerName.safeParse(value);
      if (result.success) {
        setErrors((prev) => ({ ...prev, playerName: undefined }));
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Ambient radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 15% 20%, hsla(225,65%,18%,0.7) 0%, transparent 55%), radial-gradient(ellipse at 85% 90%, hsla(42,90%,55%,0.12) 0%, transparent 55%)",
        }}
      />

      {/* Twinkling particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 26 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-yellow-300/40 animate-pulse"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Faint ₹ pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] text-gold"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "42px 42px",
        }}
      />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:p-10 items-center">
        {/* HERO */}
        <section className="relative flex flex-col justify-center">
          <div className="relative overflow-hidden rounded-3xl gold-border glass-card">
            <img
              src={heroImage}
              alt="A hamster stuck in a maze on a treadmill while a figure walks toward a golden city skyline — escape the rat race"
              width={1920}
              height={1088}
              className="h-56 w-full object-cover sm:h-72 lg:h-[26rem]"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, hsla(224,60%,6%,0.15) 0%, hsla(224,60%,6%,0.55) 60%, hsla(224,60%,6%,0.92) 100%)",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-300 backdrop-blur">
                <Sparkles className="h-3 w-3" />
                Financial Freedom Game
              </div>
              <h1 className="font-display text-3xl font-black leading-tight text-gold sm:text-4xl lg:text-5xl neon-text">
                Escape The Rat Race
              </h1>
              <p className="mt-2 max-w-lg text-sm text-yellow-50/85 sm:text-base">
                Escape the grind. Build passive income.{" "}
                <span className="text-gold">Win the game of money.</span>
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-yellow-100/70">
                <span className="inline-flex items-center gap-1">
                  <IndianRupee className="h-3.5 w-3.5 text-gold animate-pulse" />
                  Cashflow Simulator
                </span>
                <span className="opacity-40">•</span>
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-gold" />
                  Reach ₹5 Crore
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SETUP CARD */}
        <section className="relative">
          <div className="glass-card gold-border rounded-3xl p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold/80">
                Session · {sessionName}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Enter the Board
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose your identity. Your profession sets your starting salary,
                expenses, and debts.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="playerName" className="text-yellow-100/90">
                  Your Name
                </Label>
                <Input
                  id="playerName"
                  placeholder="e.g. Aarav, Priya, Kabir…"
                  value={playerName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                  maxLength={30}
                  className="rounded-xl border-yellow-500/20 bg-black/30 py-6 text-base backdrop-blur focus-visible:ring-yellow-400/60"
                />
                {errors.playerName && (
                  <p className="text-sm text-destructive">{errors.playerName}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-yellow-100/90">Choose Profession</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {professions.map(({ name, icon: Icon }) => {
                    const selected = profession === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setProfession(name)}
                        className={`group relative flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all ${
                          selected
                            ? "border-yellow-400/70 bg-yellow-400/10 shadow-[0_0_20px_hsla(45,95%,55%,0.25)]"
                            : "border-yellow-500/15 bg-black/25 hover:border-yellow-400/40 hover:bg-yellow-400/5"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 transition-colors ${
                            selected ? "text-gold" : "text-yellow-100/70 group-hover:text-gold"
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold leading-tight ${
                            selected ? "text-gold" : "text-yellow-50/85"
                          }`}
                        >
                          {name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.profession && (
                  <p className="text-sm text-destructive">{errors.profession}</p>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!playerName.trim()}
                size="lg"
                className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 py-6 text-base font-bold text-background shadow-[0_0_28px_hsla(45,95%,55%,0.45)] transition-all hover:from-yellow-400 hover:to-amber-300 hover:shadow-[0_0_36px_hsla(45,95%,55%,0.65)] disabled:opacity-50 disabled:shadow-none"
              >
                Start Playing 🚀
              </Button>

              <Link to="/leagues" className="block">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full gap-2 rounded-xl border-yellow-500/30 bg-black/20 py-6 text-yellow-100 backdrop-blur hover:bg-yellow-400/10 hover:text-gold"
                >
                  <Users className="h-5 w-5" />
                  Multiplayer Leagues
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
