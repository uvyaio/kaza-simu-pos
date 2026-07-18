import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ownerSignup } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create restaurant — KaliPOS" }] }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const signup = useServerFn(ownerSignup);
  const [form, setForm] = useState({ restaurantName: "", fullName: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signup({ data: form });
      const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Restaurant created 🎉");
      navigate({ to: "/owner" });
    } catch (err: any) {
      toast.error(err?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
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
          <h2 className="text-2xl font-bold">Start your restaurant workspace</h2>
          <p className="text-muted-foreground text-sm mt-1">You'll be the owner. You can add staff later.</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Restaurant name</Label>
            <Input value={form.restaurantName} required onChange={(e) => setForm({ ...form, restaurantName: e.target.value })} placeholder="Kato's Kitchen" className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label>Your name</Label>
            <Input value={form.fullName} required onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="h-11" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254…" className="h-11" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-11" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 font-semibold gradient-primary border-0 shadow-soft">
            {loading ? "Creating…" : "Create restaurant"}
          </Button>
        </form>
        <div className="text-center text-xs text-muted-foreground">
          Already have an account? <Link to="/auth" className="text-primary font-medium">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
