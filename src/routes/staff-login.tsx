import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { staffLogin } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/staff-login")({
  head: () => ({ meta: [{ title: "Staff sign in — KaliPOS" }] }),
  component: StaffLogin,
});

function StaffLogin() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const login = useServerFn(staffLogin);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { access_token, refresh_token } = await login({ data: { phone: phone.trim(), pin: pin.trim() } });
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Karibu tena 👋");
      navigate({ to: "/dashboard" }); // gate will bounce to role landing
    } catch (err: any) {
      toast.error(err?.message ?? "Sign in failed");
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-2xl font-bold">Staff sign in</h2>
          <p className="text-muted-foreground text-sm mt-1">Enter your work phone and 4-digit PIN.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Phone number</Label>
            <Input value={phone} required onChange={(e) => setPhone(e.target.value)} placeholder="+254 712 345 678" className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label>PIN</Label>
            <Input value={pin} required type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} onChange={(e) => setPin(e.target.value)} className="h-11 tracking-[0.5em] text-center" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 font-semibold gradient-primary border-0 shadow-soft">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <div className="text-center text-xs text-muted-foreground">
          <Link to="/auth" className="hover:text-foreground">Owner / Manager? Use email →</Link>
        </div>
      </div>
    </div>
  );
}
