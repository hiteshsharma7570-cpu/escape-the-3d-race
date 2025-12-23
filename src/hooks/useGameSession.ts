import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { sessionSchema } from "@/lib/validationSchemas";
import { toast } from "sonner";

type GameSession = Tables<"game_sessions">;

export const useGameSession = () => {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchActiveSessions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("game_sessions_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_sessions",
        },
        () => {
          fetchActiveSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActiveSessions = async () => {
    const { data, error } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSessions(data);
    }
  };

  const createSession = async (name: string) => {
    // Validate input
    const result = sessionSchema.safeParse({ name });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return null;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to create a session");
      return null;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from("game_sessions")
      .insert({ name: result.data.name, user_id: user.id })
      .select()
      .single();

    setIsLoading(false);
    if (error) {
      toast.error("Failed to create session");
      return null;
    }
    if (data) {
      setCurrentSession(data);
      return data;
    }
    return null;
  };

  const joinSession = async (sessionId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    setIsLoading(false);
    if (!error && data) {
      setCurrentSession(data);
      return data;
    }
    return null;
  };

  const endSession = async (sessionId: string) => {
    await supabase
      .from("game_sessions")
      .update({ is_active: false })
      .eq("id", sessionId);
    setCurrentSession(null);
  };

  return {
    sessions,
    currentSession,
    isLoading,
    createSession,
    joinSession,
    endSession,
  };
};
