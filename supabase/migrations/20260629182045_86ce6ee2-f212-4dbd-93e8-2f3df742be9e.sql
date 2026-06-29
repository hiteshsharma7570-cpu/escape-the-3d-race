DROP POLICY IF EXISTS "Authenticated users can view daily results" ON public.daily_results;
CREATE POLICY "Users can view their own daily results" ON public.daily_results FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can view tournament queue" ON public.tournament_queue;
CREATE POLICY "Users can view their own tournament queue entry" ON public.tournament_queue FOR SELECT TO authenticated USING (auth.uid() = user_id);