-- Create achievements table to store achievement definitions
CREATE TABLE public.achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'net_worth', 'assets', 'games_won', 'passive_income'
  threshold BIGINT NOT NULL,
  icon TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player_achievements table to track unlocked achievements
CREATE TABLE public.player_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.game_players(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(player_id, achievement_id)
);

-- Enable Row Level Security
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for achievements (read-only for everyone)
CREATE POLICY "Anyone can view achievements"
  ON public.achievements
  FOR SELECT
  USING (true);

-- Policies for player_achievements
CREATE POLICY "Anyone can view player achievements"
  ON public.player_achievements
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create player achievements"
  ON public.player_achievements
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_player_achievements_player_id ON public.player_achievements(player_id);
CREATE INDEX idx_achievements_type ON public.achievements(type);

-- Insert achievement definitions
INSERT INTO public.achievements (id, name, description, type, threshold, icon, tier) VALUES
  -- Net Worth Achievements
  ('net_worth_100k', 'Getting Started', 'Reach ₹100,000 net worth', 'net_worth', 100000, 'TrendingUp', 'bronze'),
  ('net_worth_500k', 'Building Wealth', 'Reach ₹500,000 net worth', 'net_worth', 500000, 'TrendingUp', 'silver'),
  ('net_worth_1m', 'Millionaire', 'Reach ₹1,000,000 net worth', 'net_worth', 1000000, 'Crown', 'gold'),
  ('net_worth_5m', 'Multi-Millionaire', 'Reach ₹5,000,000 net worth', 'net_worth', 5000000, 'Crown', 'platinum'),
  
  -- Assets Achievements
  ('assets_1', 'First Investment', 'Purchase your first asset', 'assets', 1, 'Home', 'bronze'),
  ('assets_3', 'Diversified Portfolio', 'Own 3 different assets', 'assets', 3, 'Briefcase', 'silver'),
  ('assets_5', 'Asset Collector', 'Own 5 different assets', 'assets', 5, 'Building2', 'gold'),
  ('assets_10', 'Empire Builder', 'Own 10 different assets', 'assets', 10, 'Landmark', 'platinum'),
  
  -- Passive Income Achievements
  ('passive_10k', 'Passive Income Starter', 'Generate ₹10,000 passive income', 'passive_income', 10000, 'DollarSign', 'bronze'),
  ('passive_50k', 'Cash Flow Master', 'Generate ₹50,000 passive income', 'passive_income', 50000, 'Coins', 'silver'),
  ('passive_100k', 'Financial Freedom', 'Generate ₹100,000 passive income', 'passive_income', 100000, 'Gem', 'gold'),
  ('passive_500k', 'Passive Income Legend', 'Generate ₹500,000 passive income', 'passive_income', 500000, 'Sparkles', 'platinum'),
  
  -- Games Won Achievements
  ('escape_first', 'Rat Race Escapee', 'Escape the rat race once', 'games_won', 1, 'Trophy', 'bronze'),
  ('escape_5', 'Consistent Winner', 'Escape the rat race 5 times', 'games_won', 5, 'Trophy', 'silver'),
  ('escape_10', 'Champion', 'Escape the rat race 10 times', 'games_won', 10, 'Award', 'gold'),
  ('escape_25', 'Legend', 'Escape the rat race 25 times', 'games_won', 25, 'Medal', 'platinum');

-- Enable realtime for player_achievements
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_achievements;