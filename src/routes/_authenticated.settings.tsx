import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Store, Bell, Globe, Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — KaliPOS" }, { name: "description", content: "Shop, M-Pesa, branches and preferences." }] }),
  component: Settings,
});

function Settings() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <PageHeader title="Settings" subtitle="Shop preferences and integrations." />

      <Card className="p-5 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary grid place-items-center"><Store className="h-5 w-5" /></div>
          <div><h3 className="font-semibold">Shop details</h3><p className="text-xs text-muted-foreground">Visible on receipts</p></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Restaurant name</Label><Input defaultValue="Kato's Kitchen" /></div>
          <div className="space-y-1.5"><Label>KRA PIN</Label><Input defaultValue="P051234567X" /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Address</Label><Input defaultValue="Ngong Road, Nairobi" /></div>
        </div>
      </Card>

      <Card className="p-5 shadow-soft border-mpesa/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-mpesa/15 text-mpesa grid place-items-center"><Smartphone className="h-5 w-5" /></div>
          <div className="flex-1"><h3 className="font-semibold">M-Pesa integration</h3><p className="text-xs text-muted-foreground">Connected to Till 5247891</p></div>
          <Badge tone="success" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Till number</Label><Input defaultValue="5247891" /></div>
          <div className="space-y-1.5"><Label>Paybill (optional)</Label><Input placeholder="247247" /></div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div><div className="text-sm font-medium">Auto reconcile transactions</div><div className="text-xs text-muted-foreground">Match M-Pesa SMS to receipts</div></div>
          <Switch defaultChecked />
        </div>
      </Card>

      <Card className="p-5 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary grid place-items-center"><Bell className="h-5 w-5" /></div>
          <div><h3 className="font-semibold">Notifications</h3><p className="text-xs text-muted-foreground">What we ping you about</p></div>
        </div>
        {[
          ["Live sales notifications", true],
          ["Low stock alerts", true],
          ["Daily profit summary (8 PM)", true],
          ["Refund approval requests", true],
          ["Marketing tips from KaliPOS", false],
        ].map(([label, on]) => (
          <div key={label as string} className="flex items-center justify-between py-2.5 border-b last:border-0">
            <span className="text-sm">{label}</span>
            <Switch defaultChecked={on as boolean} />
          </div>
        ))}
      </Card>

      <Card className="p-5 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary grid place-items-center"><Globe className="h-5 w-5" /></div>
          <div><h3 className="font-semibold">Language & region</h3><p className="text-xs text-muted-foreground">Kenya 🇰🇪 · KES · English / Kiswahili</p></div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">English</Button>
          <Button variant="outline" size="sm" className="flex-1">Kiswahili</Button>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button className="gradient-primary border-0"><Shield className="h-4 w-4 mr-1.5" />Save changes</Button>
      </div>
    </div>
  );
}

function Badge({ tone }: { tone: "success" }) {
  return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success">Connected</span>;
}
