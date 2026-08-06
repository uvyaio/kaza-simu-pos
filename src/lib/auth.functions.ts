import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type Role = "owner" | "manager" | "cashier" | "kitchen" | "waiter";

function serverPublic() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function randomPassword() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- Owner signup: creates restaurant + owner user + profile + role ----------
export const ownerSignup = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        restaurantName: z.string().trim().min(2).max(80),
        fullName: z.string().trim().min(2).max(80),
        email: z.string().trim().email().max(255),
        phone: z.string().trim().min(7).max(20).optional(),
        password: z.string().min(8).max(128),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const created = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (created.error || !created.data.user) {
      throw new Error(created.error?.message ?? "Could not create account");
    }
    const userId = created.data.user.id;

    const restaurant = await supabaseAdmin
      .from("restaurants")
      .insert({ name: data.restaurantName, phone: data.phone ?? null, owner_id: userId })
      .select("id")
      .single();
    if (restaurant.error || !restaurant.data) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(restaurant.error?.message ?? "Could not create restaurant");
    }
    const restaurantId = restaurant.data.id;

    await supabaseAdmin.from("profiles").insert({
      id: userId,
      restaurant_id: restaurantId,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone ?? null,
      status: "active",
    });
    await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, restaurant_id: restaurantId, role: "owner" });

    return { ok: true };
  });

// ---------- Staff login (public): phone + PIN -> returns session tokens ----------
export const staffLogin = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ phone: z.string().trim().min(7).max(20), pin: z.string().trim().min(4).max(8) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const verified = await supabaseAdmin.rpc("verify_staff_pin", { _phone: data.phone, _pin: data.pin });
    if (verified.error || !verified.data) throw new Error("Invalid phone or PIN");
    const userId = verified.data as string;

    const creds = await supabaseAdmin
      .from("staff_credentials")
      .select("auth_email, auth_password")
      .eq("user_id", userId)
      .single();
    if (creds.error || !creds.data) throw new Error("Staff account not activated");

    const pub = serverPublic();
    const signIn = await pub.auth.signInWithPassword({
      email: creds.data.auth_email,
      password: creds.data.auth_password,
    });
    if (signIn.error || !signIn.data.session) throw new Error("Could not start session");

    await supabaseAdmin
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", userId);

    return {
      access_token: signIn.data.session.access_token,
      refresh_token: signIn.data.session.refresh_token,
    };
  });

// ---------- Current user context ----------
export const getMyContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profile, roleRow] = await Promise.all([
      context.supabase
        .from("profiles")
        .select("id, restaurant_id, full_name, email, phone, status, last_login_at, created_at")
        .eq("id", context.userId)
        .maybeSingle(),
      context.supabase.from("user_roles").select("role, restaurant_id").eq("user_id", context.userId).maybeSingle(),
    ]);
    return {
      userId: context.userId,
      profile: profile.data,
      role: (roleRow.data?.role ?? null) as Role | null,
      restaurantId:
        (roleRow.data?.restaurant_id as string | undefined) ??
        (profile.data?.restaurant_id as string | undefined) ??
        null,
    };
  });

// ---------- Owner-only: create staff member ----------
async function assertOwner(userId: string, supabase: any) {
  const r = await supabase.from("user_roles").select("role, restaurant_id").eq("user_id", userId).maybeSingle();
  if (r.error || r.data?.role !== "owner") throw new Error("Only the owner can perform this action");
  return r.data.restaurant_id as string;
}

export const createStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        fullName: z.string().trim().min(2).max(80),
        phone: z.string().trim().min(7).max(20),
        pin: z.string().trim().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
        role: z.enum(["manager", "cashier", "kitchen", "waiter"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const restaurantId = await assertOwner(context.userId, context.supabase);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = `staff-${crypto.randomUUID()}@staff.kalipos.local`;
    const password = randomPassword();
    const created = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName, phone: data.phone },
    });
    if (created.error || !created.data.user) throw new Error(created.error?.message ?? "Could not create staff");
    const userId = created.data.user.id;

    const pinHash = await supabaseAdmin.rpc("hash_pin", { _pin: data.pin });
    if (pinHash.error || !pinHash.data) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error("Could not hash PIN");
    }

    const prof = await supabaseAdmin.from("profiles").insert({
      id: userId,
      restaurant_id: restaurantId,
      full_name: data.fullName,
      phone: data.phone,
      pin_hash: pinHash.data as string,
      status: "active",
    });
    if (prof.error) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(prof.error.message);
    }
    await supabaseAdmin.from("staff_credentials").insert({ user_id: userId, auth_email: email, auth_password: password });
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, restaurant_id: restaurantId, role: data.role });
    await context.supabase.from("audit_logs").insert({
      restaurant_id: restaurantId,
      user_id: context.userId,
      action: "staff.create",
      entity: userId,
      metadata: { role: data.role, phone: data.phone },
    });
    return { ok: true, userId };
  });

export const listStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [rows, roles] = await Promise.all([
      context.supabase
        .from("profiles")
        .select("id, full_name, phone, status, last_login_at")
        .order("created_at", { ascending: false }),
      context.supabase.from("user_roles").select("user_id, role"),
    ]);
    if (rows.error) throw new Error(rows.error.message);
    if (roles.error) throw new Error(roles.error.message);
    const roleByUser = new Map((roles.data ?? []).map((r) => [r.user_id, r.role]));
    return (rows.data ?? []).map((p) => ({
      ...p,
      user_roles: roleByUser.has(p.id) ? [{ role: roleByUser.get(p.id)! }] : [],
    }));
  });

export const resetStaffPin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ userId: z.string().uuid(), pin: z.string().trim().regex(/^\d{4,6}$/) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const restaurantId = await assertOwner(context.userId, context.supabase);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const hash = await supabaseAdmin.rpc("hash_pin", { _pin: data.pin });
    if (hash.error || !hash.data) throw new Error("Could not hash PIN");
    const up = await supabaseAdmin.from("profiles").update({ pin_hash: hash.data as string }).eq("id", data.userId).eq("restaurant_id", restaurantId);
    if (up.error) throw new Error(up.error.message);
    await context.supabase.from("audit_logs").insert({
      restaurant_id: restaurantId,
      user_id: context.userId,
      action: "staff.reset_pin",
      entity: data.userId,
    });
    return { ok: true };
  });

export const suspendStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), suspend: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const restaurantId = await assertOwner(context.userId, context.supabase);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const up = await supabaseAdmin
      .from("profiles")
      .update({ status: data.suspend ? "suspended" : "active" })
      .eq("id", data.userId)
      .eq("restaurant_id", restaurantId);
    if (up.error) throw new Error(up.error.message);
    await context.supabase.from("audit_logs").insert({
      restaurant_id: restaurantId,
      user_id: context.userId,
      action: data.suspend ? "staff.suspend" : "staff.reactivate",
      entity: data.userId,
    });
    return { ok: true };
  });
