import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  CalendarDays,
  Trophy,
  Zap,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { FriendsRoomDialog } from "@/components/game/FriendsRoomDialogs";

interface DailyRow {
  player_name: string;
  profession: string;
  final_cash: number;
}

interface WeeklyRow {
  player_name: string;
  profession: string;
  net_worth: number;
}

const todayDateString = () => new Date().toISOString().slice(0, 10);

const currentWeekStart = () => {
  // ISO week start (Monday) in user's local TZ
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

const formatINR = (n: number) =>
  "₹" + (n ?? 0).toLocaleString("en-IN");

export default function LeagueHub() {
  const [dailyTop, setDailyTop] = useState<DailyRow[]>([]);
  const [weeklyTop, setWeeklyTop] = useState<WeeklyRow[]>([]);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<"create" | "join" | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const today = todayDateString();
      const weekStart = currentWeekStart();

      const [daily, weekly, queue] = await Promise.all([
        supabase
          .from("daily_results")
          .select("player_name, profession, final_cash")
          .eq("challenge_date", today)
          .order("final_cash", { ascending: false })
          .limit(3),
        supabase
          .from("weekly_leaderboard")
          .select("player_name, profession, net_worth")
          .eq("week_start", weekStart)
          .order("net_worth", { ascending: false })
          .limit(3),
        supabase
          .from("tournament_queue")
          .select("id", { count: "exact", head: true })
          .eq("status", "waiting"),
      ]);

      if (cancelled) return;
      setDailyTop((daily.data as DailyRow[]) ?? []);
      setWeeklyTop((weekly.data as WeeklyRow[]) ?? []);
      setQueueCount(queue.count ?? 0);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Solo
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Multiplayer Leagues
          </h1>
          <div className="w-[100px]" aria-hidden />
        </div>

        <p className="text-sm text-muted-foreground mb-6 text-center max-w-2xl mx-auto">
          Pick your battlefield. Play head-to-head with friends, take on the global
          daily challenge, climb the weekly ladder, or fight through an 8-player tournament.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Friends Room */}
          <ModeCard
            theme="blue"
            icon={<Users className="w-7 h-7" />}
            title="Play with Friends"
            description="Create a private room. Share the 6-digit code. Up to 4 players, same board, real-time competition."
          >
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setDialogMode("create")}>
                Create Room
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDialogMode("join")}
              >
                Join Room
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 italic">
              Up to 4 players · share a 6-character code.
            </p>
          </ModeCard>

          {/* Daily Challenge */}
          <ModeCard
            theme="amber"
            icon={<CalendarDays className="w-7 h-7" />}
            title="Daily Challenge"
            description="Everyone gets the same dice sequence today. Pure strategy, zero luck. Resets at midnight."
          >
            <div className="text-xs text-muted-foreground mb-2">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </div>
            <TopThree
              rows={dailyTop.map((d) => ({
                name: d.player_name,
                sub: d.profession,
                value: formatINR(d.final_cash),
              }))}
              loading={loading}
              emptyLabel="No one has played today yet."
            />
            <Button className="w-full mt-3" disabled>
              Play Today's Challenge
            </Button>
          </ModeCard>

          {/* Weekly League */}
          <ModeCard
            theme="gold"
            icon={<Trophy className="w-7 h-7" />}
            title="Weekly League"
            description="Compete all week. Highest net worth by Sunday wins. Top 10 on the leaderboard."
          >
            <TopThree
              rows={weeklyTop.map((w) => ({
                name: w.player_name,
                sub: w.profession,
                value: formatINR(w.net_worth),
              }))}
              loading={loading}
              emptyLabel="Be the first on this week's board."
            />
            <Button className="w-full mt-3" disabled>
              Enter This Week's League
            </Button>
          </ModeCard>

          {/* Tournament */}
          <ModeCard
            theme="purple"
            icon={<Zap className="w-7 h-7" />}
            title="Tournament"
            description="8-player bracket. Two play simultaneously. Higher cash after 30 turns advances. Champion gets a special certificate."
          >
            <div className="text-xs text-muted-foreground mb-2">
              {loading ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading queue…
                </span>
              ) : (
                <>
                  <span className="font-bold text-foreground">{queueCount}</span>{" "}
                  / 8 players waiting
                </>
              )}
            </div>
            <Button className="w-full" disabled>
              Join Tournament Queue
            </Button>
          </ModeCard>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Backend is live. Gameplay wiring for each mode lands in upcoming phases.
        </p>
      </div>
      <FriendsRoomDialog
        open={dialogMode !== null}
        onOpenChange={(open) => !open && setDialogMode(null)}
        mode={dialogMode ?? "create"}
      />
    </div>
  );
}

const THEME_CLASSES: Record<string, { ring: string; iconBg: string; accent: string }> = {
  blue:   { ring: "ring-blue-400/40",   iconBg: "bg-blue-500/15 text-blue-500",     accent: "from-blue-500/10" },
  amber:  { ring: "ring-amber-400/40",  iconBg: "bg-amber-500/15 text-amber-600",   accent: "from-amber-500/10" },
  gold:   { ring: "ring-yellow-400/40", iconBg: "bg-yellow-500/15 text-yellow-600", accent: "from-yellow-500/10" },
  purple: { ring: "ring-purple-400/40", iconBg: "bg-purple-500/15 text-purple-500", accent: "from-purple-500/10" },
};

function ModeCard({
  theme,
  icon,
  title,
  description,
  children,
}: {
  theme: keyof typeof THEME_CLASSES;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const t = THEME_CLASSES[theme];
  return (
    <Card
      className={cn(
        "p-5 ring-1 bg-gradient-to-br to-card transition-shadow hover:shadow-lg",
        t.ring,
        t.accent,
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={cn("rounded-lg p-2", t.iconBg)}>{icon}</div>
        <div className="flex-1">
          <h2 className="text-lg font-bold leading-tight">{title}</h2>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">
            {description}
          </p>
        </div>
      </div>
      <div>{children}</div>
    </Card>
  );
}

function TopThree({
  rows,
  loading,
  emptyLabel,
}: {
  rows: { name: string; sub: string; value: string }[];
  loading: boolean;
  emptyLabel: string;
}) {
  if (loading) {
    return (
      <div className="text-xs text-muted-foreground py-2 inline-flex items-center gap-1">
        <Loader2 className="w-3 h-3 animate-spin" /> Loading…
      </div>
    );
  }
  if (rows.length === 0) {
    return <div className="text-xs italic text-muted-foreground py-2">{emptyLabel}</div>;
  }
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <ol className="space-y-1">
      {rows.map((r, i) => (
        <li
          key={`${r.name}-${i}`}
          className="flex items-center justify-between text-xs bg-card/60 rounded px-2 py-1"
        >
          <span className="flex items-center gap-2 min-w-0">
            <span aria-hidden>{medals[i]}</span>
            <span className="font-semibold truncate">{r.name}</span>
            <span className="text-muted-foreground truncate">· {r.sub}</span>
          </span>
          <span className="font-bold whitespace-nowrap">{r.value}</span>
        </li>
      ))}
    </ol>
  );
}