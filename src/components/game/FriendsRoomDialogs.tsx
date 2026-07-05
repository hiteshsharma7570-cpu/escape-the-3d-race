import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PROFESSION_PROFILES } from "@/types/game";
import {
  generateRoomCode,
  normalizeRoomCode,
  saveLocalIdentity,
} from "@/lib/roomCode";

const PROFESSIONS = Object.keys(PROFESSION_PROFILES);

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "join";
}

export function FriendsRoomDialog({ open, onOpenChange, mode }: Props) {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [profession, setProfession] = useState<string>(PROFESSIONS[0]);
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setPlayerName("");
    setProfession(PROFESSIONS[0]);
    setRoomCode("");
  };

  const handleCreate = async () => {
    const name = playerName.trim();
    if (!name) return toast.error("Enter your name");
    if (name.length > 20) return toast.error("Name too long (max 20)");

    setLoading(true);
    try {
      // Generate a unique room code (retry on collision)
      let code = "";
      let sessionId = "";
      for (let attempt = 0; attempt < 5; attempt++) {
        code = generateRoomCode();
        const { data, error } = await supabase
          .from("game_sessions")
          .insert({
            name: `${name}'s Room`,
            host_name: name,
            mode: "friends",
            status: "waiting",
            room_code: code,
            max_players: 4,
          })
          .select("id")
          .single();
        if (!error && data) {
          sessionId = data.id;
          break;
        }
        if (error && !`${error.message}`.toLowerCase().includes("room_code")) {
          throw error;
        }
      }
      if (!sessionId) throw new Error("Could not allocate a room code, try again");

      const profile = PROFESSION_PROFILES[profession];
      const { data: player, error: pErr } = await supabase
        .from("session_players")
        .insert({
          session_id: sessionId,
          player_name: name,
          profession,
          cash: profile.cash,
          net_worth: profile.cash,
          passive_income: 0,
          turn_count: 0,
          position: 0,
          is_host: true,
          is_ready: false,
        })
        .select("id")
        .single();
      if (pErr || !player) throw pErr ?? new Error("Failed to add host player");

      saveLocalIdentity(code, {
        sessionId,
        playerId: player.id,
        playerName: name,
        isHost: true,
      });

      toast.success(`Room ${code} created`);
      reset();
      onOpenChange(false);
      navigate(`/leagues/room/${code}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : undefined;
      toast.error(msg ?? "Could not create room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    const name = playerName.trim();
    const code = normalizeRoomCode(roomCode);
    if (!name) return toast.error("Enter your name");
    if (code.length !== 6) return toast.error("Room code must be 6 characters");

    setLoading(true);
    try {
      const { data: session, error: sErr } = await supabase
        .from("game_sessions")
        .select("id, status, max_players")
        .eq("room_code", code)
        .eq("mode", "friends")
        .maybeSingle();
      if (sErr) throw sErr;
      if (!session) return toast.error("Room not found");
      if (session.status !== "waiting")
        return toast.error("This room has already started");

      const { count } = await supabase
        .from("session_players")
        .select("id", { count: "exact", head: true })
        .eq("session_id", session.id);
      if ((count ?? 0) >= (session.max_players ?? 4))
        return toast.error("Room is full");

      const profile = PROFESSION_PROFILES[profession];
      const { data: player, error: pErr } = await supabase
        .from("session_players")
        .insert({
          session_id: session.id,
          player_name: name,
          profession,
          cash: profile.cash,
          net_worth: profile.cash,
          passive_income: 0,
          turn_count: 0,
          position: 0,
          is_host: false,
          is_ready: false,
        })
        .select("id")
        .single();
      if (pErr) {
        if (`${pErr.message}`.toLowerCase().includes("unique") || pErr.code === "23505") {
          return toast.error("That name is already taken in this room");
        }
        throw pErr;
      }

      saveLocalIdentity(code, {
        sessionId: session.id,
        playerId: player!.id,
        playerName: name,
        isHost: false,
      });

      toast.success(`Joined ${code}`);
      reset();
      onOpenChange(false);
      navigate(`/leagues/room/${code}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : undefined;
      toast.error(msg ?? "Could not join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create a Friends Room" : "Join a Friends Room"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "You'll get a 6-character code to share with friends."
              : "Enter the room code your friend shared with you."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="player-name">Your name</Label>
            <Input
              id="player-name"
              value={playerName}
              maxLength={20}
              placeholder="e.g. Priya"
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profession">Profession</Label>
            <Select
              value={profession}
              onValueChange={setProfession}
              disabled={loading}
            >
              <SelectTrigger id="profession">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROFESSIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p} — ₹{PROFESSION_PROFILES[p].salary.toLocaleString("en-IN")}/mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mode === "join" && (
            <div className="space-y-1.5">
              <Label htmlFor="room-code">Room code</Label>
              <Input
                id="room-code"
                value={roomCode}
                maxLength={8}
                placeholder="ABC123"
                className="font-mono tracking-[0.3em] uppercase text-center text-lg"
                onChange={(e) => setRoomCode(normalizeRoomCode(e.target.value))}
                disabled={loading}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={mode === "create" ? handleCreate : handleJoin}
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {mode === "create" ? "Create Room" : "Join Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}