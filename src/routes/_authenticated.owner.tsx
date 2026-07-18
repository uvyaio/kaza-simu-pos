import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KES } from "@/lib/mock-data";
import { Bell, TrendingUp, Package, AlertTriangle, MessageCircle, MapPin, ChevronRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/owner")({
  head: () => ({ meta: [{ title: "Owner Mobile App — KaliPOS" }, { name: "description", content: "Run your shops from your phone." }] }),
  component: Owner,
});

function Owner() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1 rounded-full mb-3">
          <Sparkles className="h-3 w-3" /> Owner mobile experience
        </div>
        <h1 className="text-3xl font-bold">Run your shops from anywhere</h1>
        <p className="text-muted-foreground mt-2 text-sm">Live notifications, branch monitoring and AI alerts in your pocket.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start justify-items-center">
        {/* Phone 1 - Live notifications */}
        <Phone>
          <PhoneHeader title="Today" sub="Live across 3 branches" />
          <div className="p-3 space-y-2.5">
            <Card className="p-3 bg-primary text-primary-foreground border-0">
              <div className="text-[10px] uppercase tracking-wider opacity-80">Total sales today</div>
              <div className="text-2xl font-bold mt-0.5">{KES(184500)}</div>
              <div className="text-xs opacity-90 mt-1">↑ 12.4% vs yesterday</div>
            </Card>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1">Live feed</div>
            {[
              { i: TrendingUp, c: "text-success bg-success/15", t: "Westlands sale", d: KES(2340) + " · M-Pesa", time: "2s" },
              { i: AlertTriangle, c: "text-warning-foreground bg-warning/20", t: "Low stock: Sugar", d: "Eastleigh kiosk", time: "1m" },
              { i: Bell, c: "text-mpesa bg-mpesa/15", t: "Refund needs approval", d: "Mercy A. · KSh 480", time: "4m" },
              { i: TrendingUp, c: "text-success bg-success/15", t: "Thika Road sale", d: KES(890) + " · Cash", time: "6m" },
            ].map((n, i) => (
              <Card key={i} className="p-2.5 flex items-center gap-2.5">
                <div className={`h-8 w-8 rounded-lg grid place-items-center ${n.c}`}><n.i className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{n.t}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{n.d}</div>
                </div>
                <span className="text-[10px] text-muted-foreground">{n.time}</span>
              </Card>
            ))}
          </div>
        </Phone>

        {/* Phone 2 - Branches */}
        <Phone>
          <PhoneHeader title="My Branches" sub="Tap to monitor live" />
          <div className="p-3 space-y-2.5">
            {[
              { n: "Westlands Mart", s: 184500, g: 12, c: "🟢" },
              { n: "Eastleigh Kiosk", s: 96800, g: -4, c: "🟢" },
              { n: "Thika Road Mini", s: 142300, g: 8, c: "🟡" },
            ].map(b => (
              <Card key={b.n} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <div className="text-xs font-semibold">{b.n}</div>
                  </div>
                  <span className="text-[10px]">{b.c}</span>
                </div>
                <div className="text-lg font-bold mt-1">{KES(b.s)}</div>
                <div className={`text-[10px] font-medium ${b.g >= 0 ? "text-success" : "text-destructive"}`}>{b.g >= 0 ? "↑" : "↓"} {Math.abs(b.g)}% today</div>
              </Card>
            ))}
            <Card className="p-3 bg-primary-soft border-primary/20">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold">AI insight</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">Eastleigh sales dropped — fridge may be down. Call manager?</div>
                </div>
              </div>
            </Card>
          </div>
        </Phone>

        {/* Phone 3 - Daily report */}
        <Phone>
          <PhoneHeader title="Daily Report" sub="Ready to share" />
          <div className="p-3 space-y-2.5">
            <Card className="p-4 gradient-hero text-primary-foreground border-0">
              <div className="text-xs opacity-80">Net profit today</div>
              <div className="text-3xl font-bold mt-1">{KES(54320)}</div>
              <div className="flex gap-3 mt-3 text-xs">
                <div><div className="opacity-70 text-[10px]">Sales</div><div className="font-semibold">{KES(184500)}</div></div>
                <div><div className="opacity-70 text-[10px]">Items</div><div className="font-semibold">412</div></div>
                <div><div className="opacity-70 text-[10px]">Avg basket</div><div className="font-semibold">{KES(448)}</div></div>
              </div>
            </Card>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1">Pending approvals</div>
            <Card className="p-3">
              <div className="text-xs font-semibold">Refund · Mercy A.</div>
              <div className="text-[11px] text-muted-foreground">Coca-Cola · KSh 140</div>
              <div className="flex gap-1.5 mt-2">
                <Button size="sm" className="flex-1 h-7 text-xs">Approve</Button>
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">Decline</Button>
              </div>
            </Card>
            <Button className="w-full bg-mpesa text-mpesa-foreground hover:bg-mpesa/90 h-10">
              <MessageCircle className="h-4 w-4 mr-1.5" />Share via WhatsApp
            </Button>
          </div>
        </Phone>
      </div>
    </div>
  );
}

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[280px] rounded-[2.2rem] bg-foreground p-2 shadow-elevated">
      <div className="rounded-[1.8rem] bg-background overflow-hidden h-[560px] flex flex-col">
        <div className="h-6 bg-foreground/5 grid place-items-center">
          <div className="h-1 w-12 rounded-full bg-foreground/30" />
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}

function PhoneHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="px-4 py-3 border-b">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold text-sm">{title}</div>
          <div className="text-[10px] text-muted-foreground">{sub}</div>
        </div>
        <div className="h-7 w-7 rounded-full gradient-primary grid place-items-center text-primary-foreground text-[10px] font-bold">JK</div>
      </div>
    </div>
  );
}
