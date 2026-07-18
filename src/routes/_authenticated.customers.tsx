import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared";
import { customers, KES } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Plus, Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({ meta: [{ title: "Customers — KaliPOS" }, { name: "description", content: "Customer profiles, loyalty points and WhatsApp promos." }] }),
  component: Customers,
});

function Customers() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <PageHeader title="Customers" subtitle="Loyalty, history and WhatsApp marketing." action={
        <Button className="gradient-primary border-0"><Plus className="h-4 w-4 mr-1.5" />Add customer</Button>
      } />

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5 shadow-soft">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total customers</div>
          <div className="text-3xl font-bold mt-1">1,284</div>
          <div className="text-xs text-success mt-1">+42 this week</div>
        </Card>
        <Card className="p-5 shadow-soft">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Repeat rate</div>
          <div className="text-3xl font-bold mt-1">68%</div>
          <div className="text-xs text-success mt-1">↑ 4% vs last month</div>
        </Card>
        <Card className="p-5 shadow-soft bg-mpesa/5 border-mpesa/30">
          <div className="text-xs uppercase tracking-wider text-mpesa font-semibold">WhatsApp promo ready</div>
          <div className="text-sm mt-2">Send 20% off bread voucher to 312 loyal customers.</div>
          <Button size="sm" className="mt-3 bg-mpesa text-mpesa-foreground hover:bg-mpesa/90">
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />Send via WhatsApp
          </Button>
        </Card>
      </div>

      <Card className="overflow-hidden shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-medium p-3">Customer</th>
              <th className="text-left font-medium p-3 hidden sm:table-cell">Phone</th>
              <th className="text-right font-medium p-3">Visits</th>
              <th className="text-right font-medium p-3">Spent</th>
              <th className="text-right font-medium p-3">Points</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full gradient-primary text-primary-foreground grid place-items-center text-xs font-semibold">
                      {c.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">{c.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 hidden sm:table-cell text-muted-foreground">{c.phone}</td>
                <td className="p-3 text-right">{c.visits}</td>
                <td className="p-3 text-right font-semibold">{KES(c.spent)}</td>
                <td className="p-3 text-right">
                  <Badge variant="secondary" className="gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{c.points}</Badge>
                </td>
                <td className="p-3 text-right">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-mpesa"><MessageCircle className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
