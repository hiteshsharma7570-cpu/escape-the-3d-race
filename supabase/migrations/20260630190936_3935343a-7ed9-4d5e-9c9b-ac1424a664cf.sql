
DROP POLICY IF EXISTS "Anyone can insert error reports" ON public.ai_maintenance_log;

CREATE POLICY "Anyone can submit validated error reports"
  ON public.ai_maintenance_log FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    error_type IN (
      'render_crash','tile_effect','periodic_mechanics',
      'ai_request_failed','ai_validation_failed','decision_apply','unknown'
    )
    AND ai_diagnosis IS NULL
    AND ai_suggested_fix IS NULL
    AND diagnosed_at IS NULL
  );
