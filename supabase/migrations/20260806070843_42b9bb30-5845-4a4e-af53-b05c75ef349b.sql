-- 1. profiles: restrict broad restaurant-wide read to own row only (owners keep ALL policy)
DROP POLICY IF EXISTS "Read own profile" ON public.profiles;
CREATE POLICY "Read own profile" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

-- Column-level hardening: no client role may read the PIN hash
REVOKE ALL (pin_hash) ON public.profiles FROM authenticated;
REVOKE ALL (last_login_ip, last_login_device) ON public.profiles FROM authenticated;
GRANT SELECT (last_login_ip, last_login_device) ON public.profiles TO authenticated;

-- 2. user_roles: keep writes fail-closed and explicit at the privilege level
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- 3. SECURITY DEFINER functions: revoke execute from client roles where not needed by RLS
REVOKE ALL ON FUNCTION public.hash_pin(text) FROM authenticated, anon, PUBLIC;
REVOKE ALL ON FUNCTION public.verify_staff_pin(text, text) FROM authenticated, anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.hash_pin(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_staff_pin(text, text) TO service_role;

DROP FUNCTION IF EXISTS public.current_user_role();
