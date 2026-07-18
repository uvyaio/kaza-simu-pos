
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_restaurant_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_user_role() FROM PUBLIC, anon, authenticated;
-- staff_credentials: deny-all policy (no client access; service_role bypasses RLS)
CREATE POLICY "Deny all staff creds" ON public.staff_credentials FOR ALL TO authenticated USING (false) WITH CHECK (false);
