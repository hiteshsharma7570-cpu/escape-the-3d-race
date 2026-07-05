import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Copy,
  Crown,
  Loader2,
  LogOut,
  Share2,
  Users,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  clearLocalIdentity,
  loadLocalIdentity,
  normalizeRoomCode,
} from "@/lib/roomCode";

interface SessionRow {
  id: string;
  room_code: string | null;
  host_name: string | null;
  status: string | null;
  max_players: number | null;
  mode: string | null;
}

interface PlayerRow {
  id: string;
  session_id: string;
  player_name: string;
  profession: string;
  is_host: boolean;
  is_ready: boolean;
  joined_at: string;
}

export default function FriendsRoom() {
  const params = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const roomCode = normalizeRoomCode(params.roomCode ?? "");

  const [session, setSession] = useState<SessionRow | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const identity = loadLocalIdentity(roomCode);
  const me = identity ? players.find((p) => p.id === identity.playerId) : null;

  // Initial fetch
  useEffect(() => {
    if (!roomCode || roomCode.length !== 6) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: s } = await supabase
        .from("game_sessions")
        .select("id, room_code, host_name, status, max_players, mode")
        .eq("room_code", roomCode)
        .eq("mode", "friends")
        .maybeSingle();
      if (cancelled) return;
      if (!s) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setSession(s as SessionRow);
      const { data: ps } = await supabase
        .from("session_players")
        .select("id, session_id, player_name, profession, is_host, is_ready, joined_at")
        .eq("session_id", s.id)
        .order("joined_at", { ascending: true });
      if (cancelled) return;
      setPlayers((ps as PlayerRow[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [roomCode]);

  // Realtime subscriptions
  useEffect(() => {
    if (!session?.id) return;
    const channel = supabase
      .channel(`friends-room-${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_players",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          setPlayers((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as PlayerRow;
              if (prev.some((p) => p.id === row.id)) return prev;
              return [...prev, row].sort((a, b) =>
                a.joined_at.localeCompare(b.joined_at),
              );
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as PlayerRow;
              return prev.map((p) => (p.id === row.id ? { ...p, ...row } : p));
            }
            if (payload.eventType === "DELETE") {
              const row = payload.old as PlayerRow;
              return prev.filter((p) => p.id !== row.id);
            }
            return prev;
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_sessions",
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          setSession((prev) =>
            prev ? { ...prev, ...(payload.new as SessionRow) } : prev,
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/leagues/room/${roomCode}`
      : "";

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      toast.success("Code copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const shareRoom = async () => {
    const text = `Join my Escape the Rat Race room! Code: ${roomCode}\n${shareUrl}`;
    const nav = navigator as Navigator & {
      share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
    };
    if (typeof navigator !== "undefined" && nav.share) {
      try {
        await nav.share({
          title: "Escape the Rat Race",
          text,
          url: shareUrl,
        });
        return;
      } catch {
        /* fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Invite copied to clipboard");
    } catch {
      toast.error("Could not share");
    }
  };

  const toggleReady = async (next: boolean) => {
    if (!me) return;
    // Optimistic
    setPlayers((prev) =>
      prev.map((p) => (p.id === me.id ? { ...p, is_ready: next } : p)),
    );
    const { error } = await supabase
      .from("session_players")
      .update({ is_ready: next })
      .eq("id", me.id);
    if (error) {
      toast.error("Could not update ready state");
      setPlayers((prev) =>
        prev.map((p) => (p.id === me.id ? { ...p, is_ready: !next } : p)),
      );
    }
  };

  const leaveRoom = async () => {
    if (me) {
      await supabase.from("session_players").delete().eq("id", me.id);
      // If host leaves and is the only one, mark session inactive
      if (me.is_host && players.length <= 1) {
        await supabase
          .from("game_sessions")
          .update({ is_active: false, status: "abandoned" })
          .eq("id", session!.id);
      }
    }
    clearLocalIdentity(roomCode);
    navigate("/leagues");
  };

  if (loading) {
    return (
      <CenterShell>
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading room…</p>
      </CenterShell>
    );
  }

  if (notFound || !session) {
    return (
      <CenterShell>
        <h2 className="text-xl font-bold">Room not found</h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          The code <span className="font-mono font-bold">{roomCode}</span> doesn't
          match an open room.
        </p>
        <Link to="/leagues">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Leagues
          </Button>
        </Link>
      </CenterShell>
    );
  }

  if (session.status !== "waiting") {
    return (
      <CenterShell>
        <h2 className="text-xl font-bold">This room has already started</h2>
        <Link to="/leagues">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Leagues
          </Button>
        </Link>
      </CenterShell>
    );
  }

  const max = session.max_players ?? 4;
  const allReady = players.length >= 2 && players.every((p) => p.is_ready);
  const iAmHost = !!me?.is_host;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-blue-500/5 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/leagues">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Leagues
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Friends Room
          </h1>
          <div className="w-[88px]" aria-hidden />
        </div>

        {/* Room code card */}
        <Card className="p-6 mb-4 ring-1 ring-blue-400/40 bg-gradient-to-br from-blue-500/10 to-card">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Share this code
            </p>
            <div className="font-mono text-4xl md:text-5xl font-black tracking-[0.3em] mb-4 select-all">
              {roomCode}
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={copyCode} className="gap-2">
                <Copy className="w-4 h-4" /> Copy code
              </Button>
              <Button variant="outline" size="sm" onClick={shareRoom} className="gap-2">
                <Share2 className="w-4 h-4" /> Share invite
              </Button>
            </div>
          </div>
        </Card>

        {/* Players list */}
        <Card className="p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold">
                Players ({players.length}/{max})
              </h2>
            </div>
            <Badge variant={allReady ? "default" : "secondary"}>
              {allReady ? "All ready" : "Waiting"}
            </Badge>
          </div>

          <ul className="space-y-2">
            {players.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-md border bg-card/60 px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {p.is_host && (
                    <Crown className="w-4 h-4 text-yellow-500 shrink-0" aria-label="Host" />
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {p.player_name}
                      {me?.id === p.id && (
                        <span className="text-xs text-muted-foreground font-normal ml-1">
                          (you)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {p.profession}
                    </div>
                  </div>
                </div>

                {me?.id === p.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Ready</span>
                    <Switch
                      checked={p.is_ready}
                      onCheckedChange={toggleReady}
                      aria-label="Toggle ready"
                    />
                  </div>
                ) : p.is_ready ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <Check className="w-3.5 h-3.5" /> Ready
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Not ready</span>
                )}
              </li>
            ))}

            {Array.from({ length: Math.max(0, max - players.length) }).map((_, i) => (
              <li
                key={`empty-${i}`}
                className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs italic text-muted-foreground"
              >
                Waiting for a friend to join…
              </li>
            ))}
          </ul>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="gap-2 sm:flex-none"
            onClick={leaveRoom}
          >
            <LogOut className="w-4 h-4" /> Leave Room
          </Button>
          <Button
            className="sm:flex-1"
            disabled={!iAmHost || !allReady}
            title={
              !iAmHost
                ? "Only the host can start"
                : !allReady
                  ? "All players need to be ready"
                  : undefined
            }
          >
            {iAmHost ? "Start Game (coming soon)" : "Waiting for host to start…"}
          </Button>
        </div>

        {!identity && (
          <p className="text-xs text-muted-foreground italic mt-3 text-center">
            You're viewing this room as a spectator. Join from the Leagues page to
            participate.
          </p>
        )}
      </div>
    </div>
  );
}

function CenterShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6">
      {children}
    </div>
  );
}