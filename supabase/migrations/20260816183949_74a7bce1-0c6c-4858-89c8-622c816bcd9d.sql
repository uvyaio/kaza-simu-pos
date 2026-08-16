-- Enums
CREATE TYPE public.order_status AS ENUM ('incoming', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE public.order_channel AS ENUM ('walk_in', 'whatsapp', 'phone', 'delivery', 'online');
CREATE TYPE public.payment_method AS ENUM ('mpesa', 'cash', 'split');
CREATE TYPE public.payment_state AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =========================
-- MENU ITEMS
-- =========================
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  emoji text,
  category text NOT NULL DEFAULT 'Main',
  price numeric(12,2) NOT NULL DEFAULT 0,
  cost numeric(12,2) NOT NULL DEFAULT 0,
  sku text,
  days text[] NOT NULL DEFAULT ARRAY['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX menu_items_restaurant_idx ON public.menu_items(restaurant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read menu" ON public.menu_items FOR SELECT TO authenticated
  USING (restaurant_id = private.current_restaurant_id());
CREATE POLICY "Members insert menu" ON public.menu_items FOR INSERT TO authenticated
  WITH CHECK (restaurant_id = private.current_restaurant_id());
CREATE POLICY "Members update menu" ON public.menu_items FOR UPDATE TO authenticated
  USING (restaurant_id = private.current_restaurant_id())
  WITH CHECK (restaurant_id = private.current_restaurant_id());
CREATE POLICY "Managers delete menu" ON public.menu_items FOR DELETE TO authenticated
  USING (restaurant_id = private.current_restaurant_id()
    AND (private.has_role(auth.uid(), 'owner'::app_role) OR private.has_role(auth.uid(), 'manager'::app_role)));
CREATE TRIGGER menu_items_updated_at BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- INGREDIENTS (inventory)
-- =========================
CREATE TABLE public.ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  unit text NOT NULL DEFAULT 'kg',
  quantity numeric(12,2) NOT NULL DEFAULT 0,
  reorder_level numeric(12,2) NOT NULL DEFAULT 0,
  unit_cost numeric(12,2) NOT NULL DEFAULT 0,
  supplier text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ingredients_restaurant_idx ON public.ingredients(restaurant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ingredients TO authenticated;
GRANT ALL ON public.ingredients TO service_role;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read ingredients" ON public.ingredients FOR SELECT TO authenticated
  USING (restaurant_id = private.current_restaurant_id());
CREATE POLICY "Members insert ingredients" ON public.ingredients FOR INSERT TO authenticated
  WITH CHECK (restaurant_id = private.current_restaurant_id());
CREATE POLICY "Members update ingredients" ON public.ingredients FOR UPDATE TO authenticated
  USING (restaurant_id = private.current_restaurant_id())
  WITH CHECK (restaurant_id = private.current_restaurant_id());
CREATE POLICY "Managers delete ingredients" ON public.ingredients FOR DELETE TO authenticated
  USING (restaurant_id = private.current_restaurant_id()
    AND (private.has_role(auth.uid(), 'owner'::app_role) OR private.has_role(auth.uid(), 'manager'::app_role)));
CREATE TRIGGER ingredients_updated_at BEFORE UPDATE ON public.ingredients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- CUSTOMERS
-- =========================
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  loyalty_points integer NOT NULL DEFAULT 0,
  total_spend numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX customers_restaurant_idx ON public.customers(restaurant_id);
CREATE UNIQUE INDEX customers_restaurant_phone_key ON public.customers(restaurant_id, phone) WHERE phone IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read customers" ON public.customers FOR SELECT TO authenticated
  USING (restaurant_id = private.current_restaurant_id());
CREATE POLICY "Members insert customers" ON public.customers FOR INSERT TO authenticated
  WITH CHECK (restaurant_id = private.current_restaurant_id());
CREATE POLICY "Members update customers" ON public.customers FOR UPDATE TO authenticated
  USING (restaurant_id = private.current_restaurant_id())
  WITH CHECK (restaurant_id = private.current_restaurant_id());
CREATE POLICY "Managers delete customers" ON public.customers FOR DELETE TO authenticated
  USING (restaurant_id = private.current_restaurant_id()
    AND (private.has_role(auth.uid(), 'owner'::app_role) OR private.has_role(auth.uid(), 'manager'::app_role)));
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- ORDERS
-- =========================
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  order_number text NOT NULL,
  status order_status NOT NULL DEFAULT 'incoming',
  channel order_channel NOT NULL DEFAULT 'walk_in',
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name text,
  customer_phone text,
  notes text,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  tax numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  payment_status payment_state NOT NULL DEFAULT 'pending',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_restaurant_created_idx ON public.orders(restaurant_id, created_at DESC);
CREATE UNIQUE INDEX orders_restaurant_number_key ON public.orders(restaurant_id, order_number);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read orders" ON public.orders FOR SELECT TO authenticated
  USING (restaurant_id = private.current_restaurant_id());
CREATE POLICY "Members insert orders" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (restaurant_id = private.current_restaurant_id());
CREATE POLICY "Members update orders" ON public.orders FOR UPDATE TO authenticated
  USING (restaurant_id = private.current_restaurant_id())
  WITH CHECK (restaurant_id = private.current_restaurant_id());
CREATE POLICY "Managers delete orders" ON public.orders FOR DELETE TO authenticated
  USING (restaurant_id = private.current_restaurant_id()
    AND (private.has_role(auth.uid(), 'owner'::app_role) OR private.has_role(auth.uid(), 'manager'::app_role)));
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- ORDER ITEMS
-- =========================
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name text NOT NULL,
  emoji text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  unit_cost numeric(12,2) NOT NULL DEFAULT 0,
  line_total numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_items_order_idx ON public.order_items(order_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read order items" ON public.order_items FOR SELECT TO authenticated
  USING (restaurant_id = private.current_restaurant_id());
CREATE POLICY "Members insert order items" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (restaurant_id = private.current_restaurant_id());
CREATE POLICY "Members update order items" ON public.order_items FOR UPDATE TO authenticated
  USING (restaurant_id = private.current_restaurant_id())
  WITH CHECK (restaurant_id = private.current_restaurant_id());
CREATE POLICY "Members delete order items" ON public.order_items FOR DELETE TO authenticated
  USING (restaurant_id = private.current_restaurant_id());

-- =========================
-- PAYMENTS (checkout)
-- =========================
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  method payment_method NOT NULL DEFAULT 'mpesa',
  status payment_state NOT NULL DEFAULT 'paid',
  till_name text,
  till_number text,
  mpesa_phone text,
  mpesa_receipt text,
  amount_mpesa numeric(12,2) NOT NULL DEFAULT 0,
  amount_cash numeric(12,2) NOT NULL DEFAULT 0,
  change_given numeric(12,2) NOT NULL DEFAULT 0,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_restaurant_created_idx ON public.payments(restaurant_id, created_at DESC);
CREATE INDEX payments_order_idx ON public.payments(order_id);
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read payments" ON public.payments FOR SELECT TO authenticated
  USING (restaurant_id = private.current_restaurant_id());
CREATE POLICY "Members insert payments" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (restaurant_id = private.current_restaurant_id() AND (created_by IS NULL OR created_by = auth.uid()));