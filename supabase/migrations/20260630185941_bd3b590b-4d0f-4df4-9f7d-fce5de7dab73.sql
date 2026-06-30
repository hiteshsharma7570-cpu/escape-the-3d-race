
CREATE TABLE public.ai_maintenance_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  error_type TEXT NOT NULL,
  error_message TEXT,
  stack TEXT,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  game_state JSONB,
  ai_diagnosis TEXT,
  ai_suggested_fix TEXT,
  diagnosed_at TIMESTAMPTZ
);

GRANT SELECT ON public.ai_maintenance_log TO authenticated;
GRANT INSERT ON public.ai_maintenance_log TO anon, authenticated;
GRANT UPDATE (ai_diagnosis, ai_suggested_fix, diagnosed_at) ON public.ai_maintenance_log TO anon, authenticated;
GRANT ALL ON public.ai_maintenance_log TO service_role;

ALTER TABLE public.ai_maintenance_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert error reports"
  ON public.ai_maintenance_log FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read error reports"
  ON public.ai_maintenance_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can update diagnosis fields"
  ON public.ai_maintenance_log FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX ai_maintenance_log_created_at_idx
  ON public.ai_maintenance_log (created_at DESC);
