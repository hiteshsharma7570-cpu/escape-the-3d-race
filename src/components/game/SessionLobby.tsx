import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Plus, LogIn } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { sessionSchema } from "@/lib/validationSchemas";

type GameSession = Tables<"game_sessions">;

interface SessionLobbyProps {
  sessions: GameSession[];
  isLoading: boolean;
  onCreateSession: (name: string) => void;
  onJoinSession: (sessionId: string) => void;
}

export const SessionLobby = ({
  sessions,
  isLoading,
  onCreateSession,
  onJoinSession,
}: SessionLobbyProps) => {
  const [sessionName, setSessionName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    const result = sessionSchema.safeParse({ name: sessionName });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    setError(null);
    onCreateSession(result.data.name);
    setSessionName("");
  };

  const handleInputChange = (value: string) => {
    setSessionName(value);
    if (error) {
      const result = sessionSchema.safeParse({ name: value });
      if (result.success) {
        setError(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">Multiplayer Lobby</h1>
        </div>

        <div className="space-y-6">
          {/* Create Session */}
          <div className="space-y-3">
            <Label htmlFor="sessionName" className="text-lg font-semibold">
              Create New Session
            </Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="sessionName"
                  placeholder="Enter session name..."
                  value={sessionName}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCreate()}
                  disabled={isLoading}
                  maxLength={50}
                />
                {error && <p className="text-sm text-destructive mt-1">{error}</p>}
              </div>
              <Button
                onClick={handleCreate}
                disabled={isLoading || !sessionName.trim()}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create
              </Button>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Active Sessions</Label>
            <ScrollArea className="h-[300px] rounded-md border border-border p-4">
              {sessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No active sessions. Create one to get started!
                </p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <Card
                      key={session.id}
                      className="p-4 flex justify-between items-center hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold">{session.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(session.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onJoinSession(session.id)}
                        disabled={isLoading}
                        className="gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        Join
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </Card>
    </div>
  );
};
