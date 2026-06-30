export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          threshold: number
          tier: string
          type: string
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id: string
          name: string
          threshold: number
          tier?: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          threshold?: number
          tier?: string
          type?: string
        }
        Relationships: []
      }
      ai_maintenance_log: {
        Row: {
          ai_diagnosis: string | null
          ai_suggested_fix: string | null
          context: Json
          created_at: string
          diagnosed_at: string | null
          error_message: string | null
          error_type: string
          game_state: Json | null
          id: string
          stack: string | null
        }
        Insert: {
          ai_diagnosis?: string | null
          ai_suggested_fix?: string | null
          context?: Json
          created_at?: string
          diagnosed_at?: string | null
          error_message?: string | null
          error_type: string
          game_state?: Json | null
          id?: string
          stack?: string | null
        }
        Update: {
          ai_diagnosis?: string | null
          ai_suggested_fix?: string | null
          context?: Json
          created_at?: string
          diagnosed_at?: string | null
          error_message?: string | null
          error_type?: string
          game_state?: Json | null
          id?: string
          stack?: string | null
        }
        Relationships: []
      }
      daily_results: {
        Row: {
          achieved_at: string
          challenge_date: string
          final_cash: number
          id: string
          player_name: string
          profession: string
          turns_taken: number
          user_id: string | null
        }
        Insert: {
          achieved_at?: string
          challenge_date: string
          final_cash: number
          id?: string
          player_name: string
          profession: string
          turns_taken: number
          user_id?: string | null
        }
        Update: {
          achieved_at?: string
          challenge_date?: string
          final_cash?: number
          id?: string
          player_name?: string
          profession?: string
          turns_taken?: number
          user_id?: string | null
        }
        Relationships: []
      }
      game_players: {
        Row: {
          cash: number
          created_at: string
          has_escaped_rat_race: boolean
          id: string
          net_worth: number
          passive_income: number
          player_name: string
          position: number
          profession: string
          salary: number
          session_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cash?: number
          created_at?: string
          has_escaped_rat_race?: boolean
          id?: string
          net_worth?: number
          passive_income?: number
          player_name: string
          position?: number
          profession: string
          salary?: number
          session_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cash?: number
          created_at?: string
          has_escaped_rat_race?: boolean
          id?: string
          net_worth?: number
          passive_income?: number
          player_name?: string
          position?: number
          profession?: string
          salary?: number
          session_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          host_name: string | null
          id: string
          is_active: boolean
          max_players: number | null
          mode: string | null
          name: string
          room_code: string | null
          seed: number | null
          started_at: string | null
          status: string | null
          turn_limit: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          host_name?: string | null
          id?: string
          is_active?: boolean
          max_players?: number | null
          mode?: string | null
          name: string
          room_code?: string | null
          seed?: number | null
          started_at?: string | null
          status?: string | null
          turn_limit?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          host_name?: string | null
          id?: string
          is_active?: boolean
          max_players?: number | null
          mode?: string | null
          name?: string
          room_code?: string | null
          seed?: number | null
          started_at?: string | null
          status?: string | null
          turn_limit?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      player_achievements: {
        Row: {
          achievement_id: string
          id: string
          player_id: string
          unlocked_at: string
        }
        Insert: {
          achievement_id: string
          id?: string
          player_id: string
          unlocked_at?: string
        }
        Update: {
          achievement_id?: string
          id?: string
          player_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_achievements_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
        ]
      }
      session_players: {
        Row: {
          cash: number
          has_won: boolean
          id: string
          is_active: boolean
          is_host: boolean
          is_ready: boolean
          joined_at: string
          last_updated: string
          net_worth: number
          passive_income: number
          player_name: string
          position: number
          profession: string
          session_id: string
          turn_count: number
          user_id: string | null
        }
        Insert: {
          cash?: number
          has_won?: boolean
          id?: string
          is_active?: boolean
          is_host?: boolean
          is_ready?: boolean
          joined_at?: string
          last_updated?: string
          net_worth?: number
          passive_income?: number
          player_name: string
          position?: number
          profession: string
          session_id: string
          turn_count?: number
          user_id?: string | null
        }
        Update: {
          cash?: number
          has_won?: boolean
          id?: string
          is_active?: boolean
          is_host?: boolean
          is_ready?: boolean
          joined_at?: string
          last_updated?: string
          net_worth?: number
          passive_income?: number
          player_name?: string
          position?: number
          profession?: string
          session_id?: string
          turn_count?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_queue: {
        Row: {
          bracket_session_id: string | null
          id: string
          joined_at: string
          player_name: string
          profession: string
          status: string
          user_id: string | null
        }
        Insert: {
          bracket_session_id?: string | null
          id?: string
          joined_at?: string
          player_name: string
          profession: string
          status?: string
          user_id?: string | null
        }
        Update: {
          bracket_session_id?: string | null
          id?: string
          joined_at?: string
          player_name?: string
          profession?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_queue_bracket_session_id_fkey"
            columns: ["bracket_session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_leaderboard: {
        Row: {
          achieved_at: string
          final_cash: number
          id: string
          net_worth: number
          player_name: string
          profession: string
          turns_taken: number
          user_id: string | null
          week_start: string
        }
        Insert: {
          achieved_at?: string
          final_cash: number
          id?: string
          net_worth: number
          player_name: string
          profession: string
          turns_taken: number
          user_id?: string | null
          week_start: string
        }
        Update: {
          achieved_at?: string
          final_cash?: number
          id?: string
          net_worth?: number
          player_name?: string
          profession?: string
          turns_taken?: number
          user_id?: string | null
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
