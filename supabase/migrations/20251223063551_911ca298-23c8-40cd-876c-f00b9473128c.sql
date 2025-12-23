-- Add user_id columns to game_sessions and game_players
ALTER TABLE public.game_sessions 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.game_players 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view game sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Anyone can create game sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Anyone can update game sessions" ON public.game_sessions;

DROP POLICY IF EXISTS "Anyone can view game players" ON public.game_players;
DROP POLICY IF EXISTS "Anyone can create game players" ON public.game_players;
DROP POLICY IF EXISTS "Anyone can update game players" ON public.game_players;
DROP POLICY IF EXISTS "Anyone can delete game players" ON public.game_players;

DROP POLICY IF EXISTS "Anyone can view player achievements" ON public.player_achievements;
DROP POLICY IF EXISTS "Anyone can create player achievements" ON public.player_achievements;

-- Create secure RLS policies for game_sessions
CREATE POLICY "Users can view active sessions"
ON public.game_sessions
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Users can create own sessions"
ON public.game_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
ON public.game_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
ON public.game_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create secure RLS policies for game_players
CREATE POLICY "Users can view players in active sessions"
ON public.game_players
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions 
    WHERE id = session_id AND is_active = true
  )
);

CREATE POLICY "Users can create own players"
ON public.game_players
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own players"
ON public.game_players
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own players"
ON public.game_players
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create secure RLS policies for player_achievements
CREATE POLICY "Users can view own achievements"
ON public.player_achievements
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.game_players 
    WHERE id = player_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own achievements"
ON public.player_achievements
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.game_players 
    WHERE id = player_id AND user_id = auth.uid()
  )
);