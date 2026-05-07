
-- Helper function to check session participation without RLS recursion
CREATE OR REPLACE FUNCTION public.is_session_participant(_session_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.game_players
    WHERE session_id = _session_id AND user_id = _user_id
  );
$$;

-- Restrict game_sessions SELECT
DROP POLICY IF EXISTS "Users can view active sessions" ON public.game_sessions;
CREATE POLICY "Users can view own or joined sessions"
ON public.game_sessions
FOR SELECT
TO authenticated
USING (
  is_active = true AND (
    auth.uid() = user_id
    OR public.is_session_participant(id, auth.uid())
  )
);

-- Restrict game_players SELECT
DROP POLICY IF EXISTS "Users can view players in active sessions" ON public.game_players;
CREATE POLICY "Users can view own or co-session players"
ON public.game_players
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR public.is_session_participant(session_id, auth.uid())
);
