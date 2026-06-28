-- 1) Replace realtime.messages SELECT policy to remove the global topic bypass
DROP POLICY IF EXISTS "Authenticated can access own session topics" ON realtime.messages;

CREATE POLICY "Authenticated can access own session topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.game_sessions s
    LEFT JOIN public.game_players p
      ON p.session_id = s.id AND p.user_id = auth.uid()
    WHERE (s.id)::text = realtime.topic()
      AND (s.user_id = auth.uid() OR p.user_id IS NOT NULL)
  )
);

-- 2) Lock down SECURITY DEFINER helper: revoke EXECUTE from exposed roles
REVOKE EXECUTE ON FUNCTION public.is_session_participant(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_session_participant(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_session_participant(uuid, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.is_session_participant(uuid, uuid) TO service_role;