import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, KeyRound, Pause, Play } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createStaff, listStaff, resetStaffPin, suspendStaff } from "@/lib/auth.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/staff")({
  head: () => ({ meta: [{ title: "Staff — KaliPOS" }] }),
  component: StaffPage,
});

function StaffPage() {
  const qc = useQueryClient();
  const list = useServerFn(listStaff);
  const create = useServerFn(createStaff);
  const reset = useServerFn(resetStaffPin);
  const suspend = useServerFn(suspendStaff);
  const { data = [], isLoading } = useQuery({ queryKey: ["staff"], queryFn: () => list() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ fullName: string; phone: string; pin: string; role: "manager" | "cashier" | "kitchen" | "waiter" }>({
    fullName: "", phone: "", pin: "", role: "cashier",
  });

  const createMut = useMutation({
    mutationFn: () => create({ data: form }),
    onSuccess: () => { toast.success("Staff added"); setOpen(false); setForm({ fullName: "", phone: "", pin: "", role: "cashier" }); qc.invalidateQueries({ queryKey: ["staff"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  async function onResetPin(userId: string) {
    const pin = prompt("New 4-digit PIN?");
    if (!pin) return;
    try { await reset({ data: { userId, pin } }); toast.success("PIN reset"); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  async function onToggleStatus(userId: string, current: string) {
    try {
      await suspend({ data: { userId, suspend: current !== "suspended" } });
      qc.invalidateQueries({ queryKey: ["staff"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <PageHeader
        title="Staff"
        subtitle="Add employees and assign roles. They sign in with phone + PIN."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary border-0"><UserPlus className="h-4 w-4 mr-2" /> Add staff</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add staff member</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5"><Label>Full name</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254…" /></div>
                <div className="space-y-1.5"><Label>4-digit PIN</Label><Input value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} maxLength={6} inputMode="numeric" /></div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                      <SelectItem value="kitchen">Kitchen</SelectItem>
                      <SelectItem value="waiter">Waiter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" disabled={createMut.isPending} onClick={() => createMut.mutate()}>
                  {createMut.isPending ? "Creating…" : "Create staff"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      <Card className="divide-y">
        {isLoading && <div className="p-6 text-sm text-muted-foreground">Loading…</div>}
        {!isLoading && data.length === 0 && <div className="p-6 text-sm text-muted-foreground">No staff yet.</div>}
        {data.map((p: any) => {
          const role = p.user_roles?.[0]?.role ?? "—";
          return (
            <div key={p.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-medium">{p.full_name ?? "Unnamed"}</div>
                <div className="text-xs text-muted-foreground">{p.phone ?? "no phone"} · <span className="capitalize">{role}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={p.status === "active" ? "secondary" : "destructive"} className="capitalize">{p.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => onResetPin(p.id)}><KeyRound className="h-3 w-3 mr-1" /> Reset PIN</Button>
                <Button size="sm" variant="outline" onClick={() => onToggleStatus(p.id, p.status)}>
                  {p.status === "suspended" ? <><Play className="h-3 w-3 mr-1" /> Activate</> : <><Pause className="h-3 w-3 mr-1" /> Suspend</>}
                </Button>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
