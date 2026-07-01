-- has_role is used inside RLS policies (e.g. public.has_role(auth.uid(), 'admin')).
-- Policy expressions execute as the querying role, so 'authenticated' must retain EXECUTE.
-- Anonymous users never have a role, so revoke EXECUTE from anon and PUBLIC.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;