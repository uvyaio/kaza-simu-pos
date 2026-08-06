CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.current_restaurant_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT restaurant_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
      AND _user_id = auth.uid()
      AND ur.restaurant_id = (SELECT p.restaurant_id FROM public.profiles p WHERE p.id = auth.uid())
  );
$$;

REVOKE ALL ON FUNCTION private.current_restaurant_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.current_restaurant_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Owner manages profiles" ON public.profiles;
CREATE POLICY "Owner manages profiles" ON public.profiles FOR ALL TO authenticated
USING (restaurant_id = private.current_restaurant_id() AND private.has_role(auth.uid(), 'owner'))
WITH CHECK (restaurant_id = private.current_restaurant_id() AND private.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Owner updates restaurant" ON public.restaurants;
CREATE POLICY "Owner updates restaurant" ON public.restaurants FOR UPDATE TO authenticated
USING (id = private.current_restaurant_id() AND private.has_role(auth.uid(), 'owner'))
WITH CHECK (id = private.current_restaurant_id() AND private.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Members read own restaurant" ON public.restaurants;
CREATE POLICY "Members read own restaurant" ON public.restaurants FOR SELECT TO authenticated
USING (id = private.current_restaurant_id());

DROP POLICY IF EXISTS "Read restaurant roles" ON public.user_roles;
CREATE POLICY "Read restaurant roles" ON public.user_roles FOR SELECT TO authenticated
USING (restaurant_id = private.current_restaurant_id());

DROP POLICY IF EXISTS "Insert own audits" ON public.audit_logs;
CREATE POLICY "Insert own audits" ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (restaurant_id = private.current_restaurant_id() AND user_id = auth.uid());

DROP POLICY IF EXISTS "Read restaurant audits" ON public.audit_logs;
CREATE POLICY "Read restaurant audits" ON public.audit_logs FOR SELECT TO authenticated
USING (restaurant_id = private.current_restaurant_id());

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.current_restaurant_id();