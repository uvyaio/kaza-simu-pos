import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Sparkles, Smartphone, Shield } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KaliPOS — Sign in" },
      { name: "description", content: "Sign in to your KaliPOS retail dashboard." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-10 gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary-glow/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-glow/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur grid place-items-center">
              <Store className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold">KaliPOS</span>
          </div>
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
              { i: Shield, t: "Offline mode + auto sync" },
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
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl gradient-primary grid place-items-center">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">KaliPOS</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Karibu tena 👋</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">Sign in to your shop dashboard.</p>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/dashboard" }); }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" placeholder="+254 712 345 678" defaultValue="+254 712 345 678" className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pin">PIN</Label>
              <Input id="pin" type="password" defaultValue="••••" className="h-11 tracking-[0.5em]" />
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold gradient-primary border-0 shadow-soft">
              Sign in to KaliPOS
            </Button>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <button type="button" className="hover:text-foreground">Forgot PIN?</button>
              <Link to="/dashboard" className="hover:text-foreground">Skip demo →</Link>
            </div>
          </form>
          <div className="text-center text-xs text-muted-foreground">
            New to KaliPOS? <span className="text-primary font-medium cursor-pointer">Start free trial</span>
          </div>
        </div>
      </div>
    </div>
  );
}
