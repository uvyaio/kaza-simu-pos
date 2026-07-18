
-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
CREATE TYPE public.app_role AS ENUM ('owner','manager','cashier','kitchen','waiter');
CREATE TYPE public.user_status AS ENUM ('active','suspended','invited');

-- Restaurants
CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  currency text NOT NULL DEFAULT 'KES',
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurants TO authenticated;
GRANT ALL ON public.restaurants TO service_role;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text UNIQUE,
  pin_hash text,
  status public.user_status NOT NULL DEFAULT 'active',
  last_login_at timestamptz,
  last_login_ip text,
  last_login_device text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.profiles(restaurant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles (separate from profiles to prevent privilege escalation)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, restaurant_id)
);
CREATE INDEX ON public.user_roles(user_id);
CREATE INDEX ON public.user_roles(restaurant_id);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Staff credentials (server-only; stores internal Supabase auth password used to mint sessions after PIN verification)
CREATE TABLE public.staff_credentials (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  auth_email text NOT NULL UNIQUE,
  auth_password text NOT NULL
);
-- No grants to authenticated / anon: only service_role via supabaseAdmin.
GRANT ALL ON public.staff_credentials TO service_role;
ALTER TABLE public.staff_credentials ENABLE ROW LEVEL SECURITY;

-- Audit logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text,
  metadata jsonb,
  ip text,
  device text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.audit_logs(restaurant_id, created_at DESC);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============ Helper security-definer functions ============

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.current_restaurant_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT restaurant_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ============ RLS policies ============

-- restaurants: members see their own restaurant; only owner may update.
CREATE POLICY "Members read own restaurant" ON public.restaurants FOR SELECT TO authenticated
  USING (id = public.current_restaurant_id());
CREATE POLICY "Owner updates restaurant" ON public.restaurants FOR UPDATE TO authenticated
  USING (id = public.current_restaurant_id() AND public.has_role(auth.uid(),'owner'))
  WITH CHECK (id = public.current_restaurant_id() AND public.has_role(auth.uid(),'owner'));

-- profiles: user reads self; anyone in restaurant reads teammates; owner/manager can update; owner can insert new staff row.
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR restaurant_id = public.current_restaurant_id());
CREATE POLICY "Update own profile basic" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Owner manages profiles" ON public.profiles FOR ALL TO authenticated
  USING (restaurant_id = public.current_restaurant_id() AND public.has_role(auth.uid(),'owner'))
  WITH CHECK (restaurant_id = public.current_restaurant_id() AND public.has_role(auth.uid(),'owner'));

-- user_roles: members can read their restaurant's roles (needed for UI); mutations only via service_role (server fn).
CREATE POLICY "Read restaurant roles" ON public.user_roles FOR SELECT TO authenticated
  USING (restaurant_id = public.current_restaurant_id());

-- audit_logs: members read own restaurant logs; inserts allowed for members of the same restaurant.
CREATE POLICY "Read restaurant audits" ON public.audit_logs FOR SELECT TO authenticated
  USING (restaurant_id = public.current_restaurant_id());
CREATE POLICY "Insert own audits" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (restaurant_id = public.current_restaurant_id() AND user_id = auth.uid());
