# Multi-Tenant Auth & Role-Based Access for KaliPOS

Build a secure, multi-tenant authentication system with 5 roles, RLS-backed tenant isolation, and role-based routing. Since this is a big change, I'll ship it in clearly-scoped phases so you can validate as we go.

## Phase 1 — Backend foundation (Lovable Cloud)

Enable Lovable Cloud (managed Postgres + Auth). Then create the schema:

**Tables**
- `restaurants` — id, name, phone, currency, created_at, owner_id
- `profiles` — id (= auth.users.id), restaurant_id, full_name, email, phone, pin_hash, status ('active'|'suspended'|'invited'), last_login_at, last_login_ip, last_login_device
- `user_roles` — id, user_id, restaurant_id, role (enum: owner|manager|cashier|kitchen|waiter). Separate table (never on profiles) to prevent privilege escalation.
- `staff_invites` — id, restaurant_id, phone, role, temp_pin_hash, expires_at, used_at
- `audit_logs` — id, restaurant_id, user_id, action, entity, metadata jsonb, ip, device, created_at

**Security**
- RLS ON for all tables, scoped by `restaurant_id = current_user_restaurant()` (SECURITY DEFINER helper).
- `has_role(_user, _role)` SECURITY DEFINER function (per user-roles knowledge) — prevents recursive RLS.
- Trigger on `auth.users` insert → create profile row.
- GRANTs to `authenticated` / `service_role` per public-schema policy.

## Phase 2 — Auth flows

- **Owner signup** (`/signup`): email + password + restaurant name → creates restaurant, profile, assigns `owner` role.
- **Email/password login** (`/auth`) — owners & managers.
- **Phone + 4-digit PIN login** (`/staff-login`) — cashiers, waiters, kitchen. Implemented via server function that looks up profile by phone+restaurant, verifies PIN hash, then mints a Supabase session using service role (custom flow with signInWithPassword against an internal synthetic email like `<uuid>@staff.kalipos.local`). PIN stored as bcrypt hash.
- **Biometric** (Android): after first successful PIN login, store credential via WebAuthn (`navigator.credentials`) tied to that device; subsequent logins verify locally then unlock cached session. Falls back to PIN if unavailable.

## Phase 3 — Role-based routing

Auth-gate everything under `_authenticated/`. After login, redirect by role:

| Role | Landing |
|---|---|
| Owner | `/owner-dashboard` |
| Manager | `/operations` |
| Cashier | `/pos` |
| Kitchen | `/kitchen` |
| Waiter | `/tables` |

Nested role guards (`_authenticated/_owner`, `_authenticated/_manager`, etc.) enforce access. Sidebar nav filtered per role. Unauthorized access → `/unauthorized`.

## Phase 4 — Staff management (Owner only)

`/staff` page: list employees, create (name/phone/role → generates 4-digit temp PIN, shown once), reset PIN, suspend/activate, view login history (from audit_logs), delete.

## Phase 5 — Audit logging

Server-side helper `logAudit(action, entity, metadata)` called from every mutation server fn. Captures IP (from request headers), user-agent as device.

## Technical notes

- Supabase Auth is used for owners/managers directly. Staff (PIN users) get synthetic auth.users rows keyed by phone; PIN verified server-side, then session issued.
- Existing routes (`/dashboard`, `/pos`, `/inventory`, etc.) get moved under `_authenticated/` with role guards.
- `/` becomes marketing/landing with sign-in CTAs; current login form moves to `/auth` and `/staff-login`.
- All mock-data-driven pages stay functional but data reads switch to per-restaurant Supabase queries in a follow-up (this plan wires auth + shell; migrating each page's data to DB is out of scope for this phase unless you want it included).

## What's NOT in this plan (flag if you want it)

- Migrating menu/inventory/sales mock data into DB tables (large, separate effort).
- SMS delivery of temp PINs (would need Twilio/Africa's Talking integration).
- Subscription/billing.

## Deliverable order

1. Enable Cloud + migrations (schema, RLS, triggers, helpers).
2. Auth pages: `/signup`, `/auth`, `/staff-login`, `/unauthorized`.
3. Role-based route restructure + guards + redirect-by-role.
4. Staff management page.
5. Audit logging wired into staff actions.

Approve and I'll start with Phase 1.
