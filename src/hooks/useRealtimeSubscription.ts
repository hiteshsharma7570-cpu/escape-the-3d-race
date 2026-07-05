import { useEffect } from "react";
import type { RealtimePostgresChangesFilter } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RealtimeConfig {
  table: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  channelName?: string;
  onChange: () => void;
}

export const useRealtimeSubscription = ({
  table,
  event = "*",
  filter,
  channelName,
  onChange,
}: RealtimeConfig) => {
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      const uniqueChannelName =
        channelName || `${table}_changes_${event}${filter ? `_${btoa(filter)}` : ""}`;

      const changesFilter = {
        event,
        schema: "public",
        table,
        ...(filter ? { filter } : {}),
      } as RealtimePostgresChangesFilter<"*">;

      channel = supabase
        .channel(uniqueChannelName)
        .on(
          "postgres_changes",
          changesFilter,
          (payload) => {
            try {
              onChange();
            } catch (err) {
              console.error(`[realtime:${table}] callback error`, err, payload);
              toast.error("Failed to process realtime update");
            }
          }
        )
        .subscribe((status, err) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error(`[realtime:${table}] subscription status: ${status}`, err);
            toast.error("Realtime connection issue. Live updates may be delayed.");
          }
        });
    } catch (err) {
      console.error(`[realtime:${table}] failed to setup channel`, err);
      toast.error("Failed to enable realtime updates");
    }

    return () => {
      if (!channel) return;
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.error(`[realtime:${table}] cleanup error`, err);
      }
    };
  }, [table, event, filter, channelName, onChange]);
};
