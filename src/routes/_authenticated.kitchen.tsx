import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared";
import { ChefHat, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/kitchen")({
  head: () => ({ meta: [{ title: "Kitchen Display — KaliPOS" }] }),
  component: KitchenDisplay,
});

const seed = [
  { id: "T-104", table: "Table 5", items: ["Nyama Choma 1kg", "Ugali x2", "Kachumbari"], time: 4 },
  { id: "T-105", table: "Table 2", items: ["Wet Fry Beef", "Chapati x3"], time: 2 },
  { id: "T-106", table: "Takeaway", items: ["Pilau x2", "Soda x2"], time: 7 },
];

function KitchenDisplay() {
  const [orders, setOrders] = useState(seed);
  return (
    <div className="p-4 md:p-6 space-y-4">
      <PageHeader title="Kitchen Display" subtitle="Live tickets — mark ready when the plate leaves the pass." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {orders.map((o) => (
          <Card key={o.id} className="p-4 border-l-4 border-l-primary">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold">{o.table}</div>
                <div className="text-xs text-muted-foreground">Ticket #{o.id}</div>
              </div>
              <Badge variant={o.time > 5 ? "destructive" : "secondary"}>
                <Clock className="h-3 w-3 mr-1" /> {o.time} min
              </Badge>
            </div>
            <ul className="space-y-1 text-sm mb-4">
              {o.items.map((i) => <li key={i} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{i}</li>)}
            </ul>
            <Button size="sm" className="w-full" onClick={() => setOrders(orders.filter((x) => x.id !== o.id))}>
              Mark ready
            </Button>
          </Card>
        ))}
        {orders.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-12">All caught up ✅</div>
        )}
      </div>
    </div>
  );
}
