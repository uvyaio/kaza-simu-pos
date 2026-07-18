import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — KaliPOS" }] }),
  component: OwnerLogin,
});

function OwnerLogin() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["me"] });
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl gradient-primary grid place-items-center">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">KaliPOS</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Owner / Manager sign in</h2>
          <p className="text-muted-foreground text-sm mt-1">Use your email and password.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 font-semibold gradient-primary border-0 shadow-soft">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <div className="flex justify-between text-xs text-muted-foreground">
          <Link to="/staff-login" className="hover:text-foreground">Staff PIN login →</Link>
          <Link to="/signup" className="hover:text-foreground">Create restaurant →</Link>
        </div>
      </div>
    </div>
  );
}
