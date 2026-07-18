
CREATE OR REPLACE FUNCTION public.hash_pin(_pin text)
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public, extensions AS $$
  SELECT extensions.crypt(_pin, extensions.gen_salt('bf'));
$$;
REVOKE EXECUTE ON FUNCTION public.hash_pin(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hash_pin(text) TO service_role;
