-- Revoke public/anon/authenticated EXECUTE on trigger-only SECURITY DEFINER functions.
-- These are only invoked by triggers (running as table owner), never called directly by clients.
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_session_player_last_updated() FROM PUBLIC, anon, authenticated;