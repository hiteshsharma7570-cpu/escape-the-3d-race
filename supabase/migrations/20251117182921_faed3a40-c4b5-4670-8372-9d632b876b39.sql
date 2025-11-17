-- Create game sessions table
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create game players table
CREATE TABLE public.game_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  profession TEXT NOT NULL,
  cash BIGINT NOT NULL DEFAULT 0,
  salary BIGINT NOT NULL DEFAULT 0,
  passive_income BIGINT NOT NULL DEFAULT 0,
  net_worth BIGINT NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  has_escaped_rat_race BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

-- Policies for game_sessions (everyone can read and create)
CREATE POLICY "Anyone can view game sessions"
  ON public.game_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create game sessions"
  ON public.game_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update game sessions"
  ON public.game_sessions
  FOR UPDATE
  USING (true);

-- Policies for game_players (everyone can read and create)
CREATE POLICY "Anyone can view game players"
  ON public.game_players
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create game players"
  ON public.game_players
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update game players"
  ON public.game_players
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete game players"
  ON public.game_players
  FOR DELETE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_game_players_updated_at
  BEFORE UPDATE ON public.game_players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;