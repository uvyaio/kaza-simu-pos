-- Table-level SELECT overrides column grants; replace it with explicit column grants excluding pin_hash
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT (id, restaurant_id, full_name, email, phone, status, last_login_at, last_login_ip, last_login_device, created_at)
  ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
