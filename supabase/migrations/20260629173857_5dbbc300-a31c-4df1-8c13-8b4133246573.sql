
-- =========================================================
-- session_players: add user_id, scope writes + reads to owner / participants
-- =========================================================
ALTER TABLE public.session_players
  ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

-- Backfill from game_players where possible (same session + same player_name)
UPDATE public.session_players sp
SET user_id = gp.user_id
FROM public.game_players gp
WHERE sp.user_id IS NULL
  AND gp.session_id = sp.session_id
  AND gp.player_name = sp.player_name
  AND gp.user_id IS NOT NULL;

-- Membership helper that reads session_players (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_session_member(_session_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.session_players
    WHERE session_id = _session_id AND user_id = _user_id
  );
$$;

DROP POLICY IF EXISTS "Anyone can view session players" ON public.session_players;
DROP POLICY IF EXISTS "Authenticated users can join a session" ON public.session_players;
DROP POLICY IF EXISTS "Participants can update session player rows" ON public.session_players;
DROP POLICY IF EXISTS "Participants can delete session player rows" ON public.session_players;

CREATE POLICY "Members can view session players"
ON public.session_players FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_session_member(session_id, auth.uid())
);

CREATE POLICY "Authenticated users can join a session"
ON public.session_players FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Owners can update their own session player row"
ON public.session_players FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete their own session player row"
ON public.session_players FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =========================================================
-- game_sessions: remove anon insert + public read for multiplayer sessions
-- =========================================================
DROP POLICY IF EXISTS "Anyone can create multiplayer sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Anyone can view multiplayer sessions" ON public.game_sessions;

-- =========================================================
-- daily_results: tie inserts to owning user
-- =========================================================
ALTER TABLE public.daily_results
  ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

DROP POLICY IF EXISTS "Authenticated users can submit a daily score" ON public.daily_results;

CREATE POLICY "Users can submit their own daily score"
ON public.daily_results FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- =========================================================
-- weekly_leaderboard: tie inserts to owning user
-- =========================================================
ALTER TABLE public.weekly_leaderboard
  ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

DROP POLICY IF EXISTS "Authenticated users can submit weekly scores" ON public.weekly_leaderboard;

CREATE POLICY "Users can submit their own weekly score"
ON public.weekly_leaderboard FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- =========================================================
-- tournament_queue: ownership by user_id, not player_name
-- =========================================================
ALTER TABLE public.tournament_queue
  ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

UPDATE public.tournament_queue tq
SET user_id = gp.user_id
FROM public.game_players gp
WHERE tq.user_id IS NULL
  AND gp.player_name = tq.player_name
  AND gp.user_id IS NOT NULL;

DROP POLICY IF EXISTS "Authenticated users can join tournament queue" ON public.tournament_queue;
DROP POLICY IF EXISTS "Owners can update own queue entry" ON public.tournament_queue;
DROP POLICY IF EXISTS "Owners can delete own queue entry" ON public.tournament_queue;

CREATE POLICY "Users can join tournament queue"
ON public.tournament_queue FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Owners can update own queue entry"
ON public.tournament_queue FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete own queue entry"
ON public.tournament_queue FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
