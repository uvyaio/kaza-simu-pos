import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared";
import { Clock, Smartphone, Bike, CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KES } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Kato's Kitchen" },
      { name: "description", content: "Online orders coming in, being prepared and out for delivery — tracked with M-Pesa payments." },
      { property: "og:title", content: "Orders — Kato's Kitchen" },
      { property: "og:description", content: "Autonomous online order tracking with M-Pesa payment confirmation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersView,
});

type Status = "new" | "preparing" | "ready";

type Order = {
  id: string;
  customer: string;
  channel: "WhatsApp" | "Website" | "Phone call";
  items: string[];
  total: number;
  mpesaRef: string;
  paid: boolean;
  mins: number;
  status: Status;
};

const seed: Order[] = [
  { id: "KK-1042", customer: "Mercy Akinyi", channel: "WhatsApp", items: ["Nyama Choma ½ kg", "Brown Ugali x2", "Kachumbari"], total: 1130, mpesaRef: "SJ42KD9L1M", paid: true, mins: 3, status: "new" },
  { id: "KK-1043", customer: "Brian Otieno", channel: "Website", items: ["Beef Wet Fry", "Chapati (2 pcs)"], total: 560, mpesaRef: "SJ42MN7P0Q", paid: true, mins: 6, status: "preparing" },
  { id: "KK-1044", customer: "Faith Wanjiru", channel: "WhatsApp", items: ["Pilau ya Kuku x2", "Fresh Passion Juice"], total: 1080, mpesaRef: "—", paid: false, mins: 2, status: "new" },
  { id: "KK-1045", customer: "Sam Kiprotich", channel: "Phone call", items: ["Samaki wa Kupaka", "Rice (Plain)"], total: 930, mpesaRef: "SJ41ZZ3K8T", paid: true, mins: 11, status: "preparing" },
  { id: "KK-1046", customer: "Njeri Kamau", channel: "Website", items: ["Mbuzi Choma ¼ kg", "White Ugali"], total: 700, mpesaRef: "SJ41QW2E5R", paid: true, mins: 14, status: "ready" },
];

const columns: { key: Status; label: string; hint: string }[] = [
  { key: "new", label: "Coming in", hint: "Awaiting kitchen pickup" },
  { key: "preparing", label: "Being prepared", hint: "On the fire now" },
  { key: "ready", label: "Ready for delivery", hint: "Rider collection" },
];

function OrdersView() {
  const [orders, setOrders] = useState(seed);

  const advance = (id: string) =>
    setOrders((prev) =>
      prev.flatMap((o) => {
        if (o.id !== id) return [o];
        if (o.status === "new") return [{ ...o, status: "preparing" as Status }];
        if (o.status === "preparing") return [{ ...o, status: "ready" as Status }];
        return [];
      }),
    );

  const paidToday = orders.filter((o) => o.paid).reduce((s, o) => s + o.total, 0);

  return (
    <div className="p-4 md:p-6 space-y-5">
      <PageHeader
        title="Orders"
        subtitle="Online orders flow in automatically — the platform runs itself, you only act if something stalls."
        action={
          <Badge variant="outline" className="gap-1.5 py-1 px-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            Auto-syncing
          </Badge>
        }
      />

      <Card className="p-4 shadow-soft border-primary/30">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg gradient-primary grid place-items-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="text-sm">
            <div className="font-semibold">Evening AI report scheduled — 9:00 PM</div>
            <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
              No need to watch this screen. After close of business you'll get one summary: all M-Pesa payments reconciled,
              unpaid orders flagged, best-selling dishes and tomorrow's shopping list. {KES(paidToday)} confirmed on M-Pesa so far.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((col) => {
          const list = orders.filter((o) => o.status === col.key);
          return (
            <div key={col.key} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="font-semibold text-sm">{col.label}</h3>
                  <p className="text-[11px] text-muted-foreground">{col.hint}</p>
                </div>
                <Badge variant="secondary">{list.length}</Badge>
              </div>

              {list.map((o) => (
                <Card key={o.id} className="p-4 border-l-4 border-l-primary">
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{o.customer}</div>
                      <div className="text-xs text-muted-foreground">
                        #{o.id} · {o.channel}
                      </div>
                    </div>
                    <Badge variant={o.mins > 10 ? "destructive" : "secondary"}>
                      <Clock className="h-3 w-3 mr-1" /> {o.mins} min
                    </Badge>
                  </div>

                  <ul className="space-y-1 text-sm mb-3">
                    {o.items.map((i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {i}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-semibold">{KES(o.total)}</span>
                    <span className={`flex items-center gap-1.5 ${o.paid ? "text-success" : "text-warning"}`}>
                      <Smartphone className="h-3.5 w-3.5" />
                      {o.paid ? `M-Pesa ${o.mpesaRef}` : "Awaiting M-Pesa"}
                    </span>
                  </div>

                  <Button size="sm" variant={col.key === "ready" ? "default" : "outline"} className="w-full" onClick={() => advance(o.id)}>
                    {col.key === "new" && "Start preparing"}
                    {col.key === "preparing" && (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1.5" /> Mark ready
                      </>
                    )}
                    {col.key === "ready" && (
                      <>
                        <Bike className="h-4 w-4 mr-1.5" /> Handed to rider
                      </>
                    )}
                  </Button>
                </Card>
              ))}

              {list.length === 0 && (
                <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">Nothing here ✅</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
