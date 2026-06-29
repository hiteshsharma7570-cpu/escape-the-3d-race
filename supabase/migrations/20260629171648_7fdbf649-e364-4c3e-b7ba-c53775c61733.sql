
-- game_sessions: remove open update policy
DROP POLICY IF EXISTS "Anyone can update multiplayer sessions" ON public.game_sessions;

-- session_players: replace open write policies with participant-scoped ones
DROP POLICY IF EXISTS "Anyone can join a session" ON public.session_players;
DROP POLICY IF EXISTS "Anyone can leave a session" ON public.session_players;
DROP POLICY IF EXISTS "Anyone can update session player rows" ON public.session_players;

CREATE POLICY "Authenticated users can join a session"
ON public.session_players FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Participants can update session player rows"
ON public.session_players FOR UPDATE TO authenticated
USING (public.is_session_participant(session_id, auth.uid()))
WITH CHECK (public.is_session_participant(session_id, auth.uid()));

CREATE POLICY "Participants can delete session player rows"
ON public.session_players FOR DELETE TO authenticated
USING (public.is_session_participant(session_id, auth.uid()));

-- tournament_queue: lock down writes to the authenticated owner (by player_name match against their game_players record)
DROP POLICY IF EXISTS "Anyone can join tournament queue" ON public.tournament_queue;
DROP POLICY IF EXISTS "Anyone can leave tournament queue" ON public.tournament_queue;
DROP POLICY IF EXISTS "Anyone can update tournament queue rows" ON public.tournament_queue;

CREATE POLICY "Authenticated users can join tournament queue"
ON public.tournament_queue FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can update own queue entry"
ON public.tournament_queue FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.game_players gp
  WHERE gp.user_id = auth.uid() AND gp.player_name = tournament_queue.player_name
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.game_players gp
  WHERE gp.user_id = auth.uid() AND gp.player_name = tournament_queue.player_name
));

CREATE POLICY "Owners can delete own queue entry"
ON public.tournament_queue FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.game_players gp
  WHERE gp.user_id = auth.uid() AND gp.player_name = tournament_queue.player_name
));

-- weekly_leaderboard: drop open update, require auth for insert, no updates allowed
DROP POLICY IF EXISTS "Anyone can submit weekly scores" ON public.weekly_leaderboard;
DROP POLICY IF EXISTS "Anyone can update weekly scores" ON public.weekly_leaderboard;

CREATE POLICY "Authenticated users can submit weekly scores"
ON public.weekly_leaderboard FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- daily_results: require auth to submit
DROP POLICY IF EXISTS "Anyone can submit a daily score" ON public.daily_results;

CREATE POLICY "Authenticated users can submit a daily score"
ON public.daily_results FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
