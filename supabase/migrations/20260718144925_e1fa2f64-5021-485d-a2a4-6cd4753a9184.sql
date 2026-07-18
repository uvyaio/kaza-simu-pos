
CREATE OR REPLACE FUNCTION public.verify_staff_pin(_phone text, _pin text)
RETURNS uuid LANGUAGE sql SECURITY DEFINER SET search_path = public, extensions AS $$
  SELECT id FROM public.profiles
  WHERE phone = _phone AND pin_hash IS NOT NULL AND pin_hash = extensions.crypt(_pin, pin_hash)
  LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.verify_staff_pin(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_staff_pin(text, text) TO service_role;
