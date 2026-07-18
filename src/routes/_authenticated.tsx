import { createFileRoute, Outlet, redirect, useRouterState, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useMyContext, rolesAllowedByPath, roleLandingPath } from "@/hooks/use-my-context";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Gate,
});

function Gate() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { data, isLoading, error } = useMyContext();

  useEffect(() => {
    if (!data?.role) return;
    // if unassigned role hitting protected page, punt to their landing
    const allowed = rolesAllowedByPath[path];
    if (allowed && !allowed.includes(data.role)) {
      navigate({ to: roleLandingPath[data.role], replace: true });
    }
  }, [data?.role, path, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-sm text-muted-foreground">Loading your workspace…</div>
      </div>
    );
  }
  if (error || !data?.role) {
    return (
      <div className="min-h-screen grid place-items-center bg-background p-6">
        <div className="max-w-sm text-center space-y-3">
          <h2 className="text-lg font-semibold">Account not set up</h2>
          <p className="text-sm text-muted-foreground">
            Your user has no role assigned yet. Ask the restaurant owner to add you as staff.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth", replace: true });
            }}
            className="text-sm text-primary hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }
  return <AppLayout />;
}
