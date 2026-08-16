import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const itemSchema = z.object({
  menuItemId: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(1).max(120),
  emoji: z.string().max(8).optional().nullable(),
  quantity: z.number().int().min(1).max(999),
  unitPrice: z.number().min(0).max(1_000_000),
  unitCost: z.number().min(0).max(1_000_000).optional(),
});

async function myRestaurantId(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase
    .from("profiles")
    .select("restaurant_id")
    .eq("id", ctx.userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.restaurant_id) throw new Error("No restaurant linked to this account");
  return data.restaurant_id as string;
}

// ---------- Checkout: order + items + payment in one call ----------
export const recordCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        items: z.array(itemSchema).min(1).max(200),
        method: z.enum(["mpesa", "cash", "split"]),
        channel: z.enum(["walk_in", "whatsapp", "phone", "delivery", "online"]).default("walk_in"),
        taxRate: z.number().min(0).max(1).default(0.16),
        customerName: z.string().trim().max(120).optional(),
        customerPhone: z.string().trim().max(20).optional(),
        mpesaPhone: z.string().trim().max(20).optional(),
        tillName: z.string().trim().max(120).optional(),
        tillNumber: z.string().trim().max(60).optional(),
        amountMpesa: z.number().min(0).optional(),
        amountCash: z.number().min(0).optional(),
        changeGiven: z.number().min(0).optional(),
        notes: z.string().trim().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const restaurantId = await myRestaurantId({ supabase, userId });

    const subtotal = data.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const tax = Math.round(subtotal * data.taxRate * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const orderNumber = `KK-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.floor(
      Math.random() * 9000 + 1000,
    )}`;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        restaurant_id: restaurantId,
        order_number: orderNumber,
        status: "completed",
        channel: data.channel,
        customer_name: data.customerName ?? null,
        customer_phone: data.customerPhone ?? null,
        notes: data.notes ?? null,
        subtotal,
        tax,
        total,
        payment_status: "paid",
        created_by: userId,
        completed_at: new Date().toISOString(),
      })
      .select("id, order_number, total")
      .single();
    if (orderErr) throw new Error(orderErr.message);

    const { error: itemsErr } = await supabase.from("order_items").insert(
      data.items.map((i) => ({
        restaurant_id: restaurantId,
        order_id: order.id,
        menu_item_id: i.menuItemId ?? null,
        name: i.name,
        emoji: i.emoji ?? null,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        unit_cost: i.unitCost ?? 0,
        line_total: Math.round(i.unitPrice * i.quantity * 100) / 100,
      })),
    );
    if (itemsErr) throw new Error(itemsErr.message);

    const amountMpesa = data.method === "cash" ? 0 : (data.amountMpesa ?? total);
    const amountCash = data.method === "mpesa" ? 0 : (data.amountCash ?? total - amountMpesa);

    const { error: payErr } = await supabase.from("payments").insert({
      restaurant_id: restaurantId,
      order_id: order.id,
      method: data.method,
      status: "paid",
      till_name: data.tillName ?? null,
      till_number: data.tillNumber ?? null,
      mpesa_phone: data.mpesaPhone ?? null,
      amount_mpesa: amountMpesa,
      amount_cash: amountCash,
      change_given: data.changeGiven ?? 0,
      amount: total,
      created_by: userId,
    });
    if (payErr) throw new Error(payErr.message);

    return { orderId: order.id as string, orderNumber: order.order_number as string, total, subtotal, tax };
  });

// ---------- Orders board ----------
export const listOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, order_number, status, channel, customer_name, customer_phone, total, payment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    const ids = (orders ?? []).map((o: { id: string }) => o.id);
    const { data: items } = ids.length
      ? await supabase.from("order_items").select("order_id, name, emoji, quantity").in("order_id", ids)
      : { data: [] as Array<{ order_id: string; name: string; emoji: string | null; quantity: number }> };
    const byOrder = new Map<string, Array<{ name: string; emoji: string | null; quantity: number }>>();
    for (const it of items ?? []) {
      const list = byOrder.get(it.order_id) ?? [];
      list.push({ name: it.name, emoji: it.emoji, quantity: it.quantity });
      byOrder.set(it.order_id, list);
    }
    return (orders ?? []).map((o: { id: string }) => ({ ...o, items: byOrder.get(o.id) ?? [] }));
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        orderId: z.string().uuid(),
        status: z.enum(["incoming", "preparing", "ready", "completed", "cancelled"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("orders")
      .update({
        status: data.status,
        completed_at: data.status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", data.orderId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Menu ----------
export const listMenuItems = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("menu_items")
      .select("id, name, emoji, category, price, cost, sku, days, is_active")
      .order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveMenuItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().trim().min(1).max(120),
        emoji: z.string().max(8).optional(),
        category: z.string().trim().max(60).default("Main"),
        price: z.number().min(0).max(1_000_000),
        cost: z.number().min(0).max(1_000_000).default(0),
        sku: z.string().trim().max(60).optional(),
        days: z.array(z.string().max(4)).min(1).max(7),
        isActive: z.boolean().default(true),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const restaurantId = await myRestaurantId({ supabase, userId });
    const row = {
      restaurant_id: restaurantId,
      name: data.name,
      emoji: data.emoji ?? null,
      category: data.category,
      price: data.price,
      cost: data.cost,
      sku: data.sku ?? null,
      days: data.days,
      is_active: data.isActive,
    };
    const q = data.id
      ? supabase.from("menu_items").update(row).eq("id", data.id).select("id").single()
      : supabase.from("menu_items").insert(row).select("id").single();
    const { data: saved, error } = await q;
    if (error) throw new Error(error.message);
    return { id: saved.id as string };
  });

// ---------- Inventory ----------
export const listIngredients = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("ingredients")
      .select("id, name, unit, quantity, reorder_level, unit_cost, supplier")
      .order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveIngredient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().trim().min(1).max(120),
        unit: z.string().trim().max(20).default("kg"),
        quantity: z.number().min(0).max(1_000_000),
        reorderLevel: z.number().min(0).max(1_000_000).default(0),
        unitCost: z.number().min(0).max(1_000_000).default(0),
        supplier: z.string().trim().max(120).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const restaurantId = await myRestaurantId({ supabase, userId });
    const row = {
      restaurant_id: restaurantId,
      name: data.name,
      unit: data.unit,
      quantity: data.quantity,
      reorder_level: data.reorderLevel,
      unit_cost: data.unitCost,
      supplier: data.supplier ?? null,
    };
    const q = data.id
      ? supabase.from("ingredients").update(row).eq("id", data.id).select("id").single()
      : supabase.from("ingredients").insert(row).select("id").single();
    const { data: saved, error } = await q;
    if (error) throw new Error(error.message);
    return { id: saved.id as string };
  });
