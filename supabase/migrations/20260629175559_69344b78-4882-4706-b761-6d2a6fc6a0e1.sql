
-- 1) Move SECURITY DEFINER helpers out of the exposed public schema
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

-- Drop existing public-schema policies that reference the helpers
DROP POLICY IF EXISTS "Users can view own or co-session players" ON public.game_players;
DROP POLICY IF EXISTS "Users can view own or joined sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Members can view session players" ON public.session_players;

-- Recreate helpers in the private schema
CREATE OR REPLACE FUNCTION private.is_session_participant(_session_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.game_players
    WHERE session_id = _session_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION private.is_session_member(_session_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.session_players
    WHERE session_id = _session_id AND user_id = _user_id
  );
$$;

-- Drop the old public-schema helpers (no longer referenced)
DROP FUNCTION IF EXISTS public.is_session_participant(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_session_member(uuid, uuid);

-- Ensure only the postgres/service role can execute the private helpers
REVOKE ALL ON FUNCTION private.is_session_participant(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.is_session_member(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- Recreate policies using the private helpers; add is_active guard on game_players
CREATE POLICY "Users can view own or co-session players"
ON public.game_players
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id)
  OR (
    private.is_session_participant(session_id, auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.game_sessions gs
      WHERE gs.id = game_players.session_id AND gs.is_active = true
    )
  )
);

CREATE POLICY "Users can view own or joined sessions"
ON public.game_sessions
FOR SELECT
TO authenticated
USING (
  (is_active = true)
  AND ((auth.uid() = user_id) OR private.is_session_participant(id, auth.uid()))
);

CREATE POLICY "Members can view session players"
ON public.session_players
FOR SELECT
TO authenticated
USING (
  (user_id = auth.uid()) OR private.is_session_member(session_id, auth.uid())
);

-- 2) Restrict public-leaderboard tables to authenticated users only
DROP POLICY IF EXISTS "Anyone can view daily results" ON public.daily_results;
CREATE POLICY "Authenticated users can view daily results"
ON public.daily_results
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can view weekly leaderboard" ON public.weekly_leaderboard;
CREATE POLICY "Authenticated users can view weekly leaderboard"
ON public.weekly_leaderboard
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can view tournament queue" ON public.tournament_queue;
CREATE POLICY "Authenticated users can view tournament queue"
ON public.tournament_queue
FOR SELECT
TO authenticated
USING (true);

-- Revoke anon SELECT grants if any
REVOKE SELECT ON public.daily_results FROM anon;
REVOKE SELECT ON public.weekly_leaderboard FROM anon;
REVOKE SELECT ON public.tournament_queue FROM anon;
