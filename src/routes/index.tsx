import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Store, Sparkles, Smartphone, Shield, KeyRound, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KaliPOS — Smart Retail OS for African SMEs" },
      { name: "description", content: "AI-powered POS, inventory, M-Pesa & analytics for Kenyan restaurants and shops." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
  }, []);
  if (hasSession) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-10 gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary-glow/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-glow/10 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur grid place-items-center">
            <Store className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold">KaliPOS</span>
        </div>
        <div className="relative space-y-6">
          <h1 className="text-5xl font-bold leading-tight text-balance">
            The retail operating system <span className="text-primary-glow">built for Africa.</span>
          </h1>
          <p className="text-lg opacity-80 max-w-md">
            Sell faster, track stock, accept M-Pesa, and run your shop from your phone — powered by AI.
          </p>
          <div className="grid gap-3 max-w-sm pt-4">
            {[
              { i: Sparkles, t: "AI insights tuned for Kenyan retail" },
              { i: Smartphone, t: "Mobile-first, works on any Android" },
              { i: Shield, t: "Multi-tenant, secure by default" },
            ].map(({ i: I, t }) => (
              <div key={t} className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-white/10 grid place-items-center"><I className="h-4 w-4" /></div>
                <span className="opacity-90">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs opacity-70">Trusted by 1,200+ shops across Kenya 🇰🇪</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl gradient-primary grid place-items-center">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">KaliPOS</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Karibu 👋</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">How do you sign in?</p>
          </div>

          <div className="space-y-3">
            <Link to="/auth" className="block">
              <Button className="w-full h-12 justify-start gradient-primary border-0 shadow-soft">
                <Mail className="h-4 w-4 mr-2" /> Owner / Manager · Email login
              </Button>
            </Link>
            <Link to="/staff-login" className="block">
              <Button variant="secondary" className="w-full h-12 justify-start">
                <KeyRound className="h-4 w-4 mr-2" /> Staff · Phone + PIN
              </Button>
            </Link>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            New restaurant? <Link to="/signup" className="text-primary font-medium">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
