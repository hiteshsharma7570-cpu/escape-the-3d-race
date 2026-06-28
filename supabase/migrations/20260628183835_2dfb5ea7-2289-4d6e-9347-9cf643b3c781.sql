
-- 1) Extend game_sessions with multiplayer fields (additive, nullable so existing solo sessions are unaffected)
ALTER TABLE public.game_sessions
  ADD COLUMN IF NOT EXISTS room_code text,
  ADD COLUMN IF NOT EXISTS host_name text,
  ADD COLUMN IF NOT EXISTS mode text DEFAULT 'solo',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'waiting',
  ADD COLUMN IF NOT EXISTS max_players int DEFAULT 4,
  ADD COLUMN IF NOT EXISTS turn_limit int DEFAULT 50,
  ADD COLUMN IF NOT EXISTS seed bigint,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS ended_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_game_sessions_room_code_unique
  ON public.game_sessions(room_code)
  WHERE room_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_game_sessions_mode_status
  ON public.game_sessions(mode, status);

-- Allow anonymous/public read access to sessions for multiplayer room lookup
DROP POLICY IF EXISTS "Anyone can view multiplayer sessions" ON public.game_sessions;
CREATE POLICY "Anyone can view multiplayer sessions"
  ON public.game_sessions
  FOR SELECT
  TO anon, authenticated
  USING (mode IS NULL OR mode <> 'solo');

-- Allow anyone to create a multiplayer session
DROP POLICY IF EXISTS "Anyone can create multiplayer sessions" ON public.game_sessions;
CREATE POLICY "Anyone can create multiplayer sessions"
  ON public.game_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (mode IN ('friends', 'daily', 'weekly', 'tournament'));

-- Allow anyone to update a multiplayer session's status timestamps (host actions, e.g. start/end)
DROP POLICY IF EXISTS "Anyone can update multiplayer sessions" ON public.game_sessions;
CREATE POLICY "Anyone can update multiplayer sessions"
  ON public.game_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (mode IN ('friends', 'daily', 'weekly', 'tournament'));

GRANT SELECT ON public.game_sessions TO anon;

-- 2) session_players — multiplayer player rows, no auth required
CREATE TABLE IF NOT EXISTS public.session_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  player_name text NOT NULL,
  profession text NOT NULL,
  cash bigint NOT NULL DEFAULT 0,
  net_worth bigint NOT NULL DEFAULT 0,
  passive_income int NOT NULL DEFAULT 0,
  turn_count int NOT NULL DEFAULT 0,
  position int NOT NULL DEFAULT 0,
  has_won boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  is_host boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_updated timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, player_name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_players TO anon, authenticated;
GRANT ALL ON public.session_players TO service_role;

ALTER TABLE public.session_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view session players"
  ON public.session_players FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Anyone can join a session"
  ON public.session_players FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can update session player rows"
  ON public.session_players FOR UPDATE
  TO anon, authenticated USING (true);

CREATE POLICY "Anyone can leave a session"
  ON public.session_players FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_session_players_session ON public.session_players(session_id);

-- 3) weekly_leaderboard
CREATE TABLE IF NOT EXISTS public.weekly_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  profession text NOT NULL,
  final_cash bigint NOT NULL,
  net_worth bigint NOT NULL,
  turns_taken int NOT NULL,
  week_start date NOT NULL,
  achieved_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (player_name, week_start)
);

GRANT SELECT, INSERT, UPDATE ON public.weekly_leaderboard TO anon, authenticated;
GRANT ALL ON public.weekly_leaderboard TO service_role;

ALTER TABLE public.weekly_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view weekly leaderboard"
  ON public.weekly_leaderboard FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Anyone can submit weekly scores"
  ON public.weekly_leaderboard FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Updates allowed so a player's best score for the week can be replaced when they beat it.
CREATE POLICY "Anyone can update weekly scores"
  ON public.weekly_leaderboard FOR UPDATE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_weekly_leaderboard_week
  ON public.weekly_leaderboard(week_start, final_cash DESC);

-- 4) daily_results
CREATE TABLE IF NOT EXISTS public.daily_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  profession text NOT NULL,
  final_cash bigint NOT NULL,
  turns_taken int NOT NULL,
  challenge_date date NOT NULL,
  achieved_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (player_name, challenge_date)
);

GRANT SELECT, INSERT ON public.daily_results TO anon, authenticated;
GRANT ALL ON public.daily_results TO service_role;

ALTER TABLE public.daily_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily results"
  ON public.daily_results FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Anyone can submit a daily score"
  ON public.daily_results FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_daily_results_date
  ON public.daily_results(challenge_date, final_cash DESC);

-- 5) tournament_queue
CREATE TABLE IF NOT EXISTS public.tournament_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  profession text NOT NULL,
  status text NOT NULL DEFAULT 'waiting', -- waiting | matched | eliminated | champion
  bracket_session_id uuid REFERENCES public.game_sessions(id) ON DELETE SET NULL,
  joined_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tournament_queue TO anon, authenticated;
GRANT ALL ON public.tournament_queue TO service_role;

ALTER TABLE public.tournament_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournament queue"
  ON public.tournament_queue FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Anyone can join tournament queue"
  ON public.tournament_queue FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can update tournament queue rows"
  ON public.tournament_queue FOR UPDATE
  TO anon, authenticated USING (true);

CREATE POLICY "Anyone can leave tournament queue"
  ON public.tournament_queue FOR DELETE
  TO anon, authenticated USING (true);

-- 6) Realtime publication — multiplayer needs live updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'session_players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.session_players;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'game_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'weekly_leaderboard'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_leaderboard;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'daily_results'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_results;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tournament_queue'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_queue;
  END IF;
END$$;

-- 7) Ensure last_updated stays fresh on session_players for sync ordering
CREATE OR REPLACE FUNCTION public.touch_session_player_last_updated()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_session_players_touch ON public.session_players;
CREATE TRIGGER trg_session_players_touch
  BEFORE UPDATE ON public.session_players
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_session_player_last_updated();
