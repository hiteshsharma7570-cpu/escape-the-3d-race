import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    const uniqueChannelName =
      channelName || `${table}_changes_${event}${filter ? `_${btoa(filter)}` : ""}`;

    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filter, channelName, onChange]);
};
