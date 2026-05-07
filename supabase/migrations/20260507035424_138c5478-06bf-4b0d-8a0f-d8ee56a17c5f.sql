
-- Enable RLS on realtime.messages (channel authorization)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to subscribe/broadcast only on topics
-- matching a session id they own or participate in.
CREATE POLICY "Authenticated can access own session topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions s
    WHERE s.id::text = realtime.topic()
      AND (s.user_id = auth.uid() OR public.is_session_participant(s.id, auth.uid()))
  )
  OR realtime.topic() IN ('game_sessions_changes', 'game_players_changes')
);
