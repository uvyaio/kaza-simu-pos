import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KES, salesTrend, topProducts } from "@/lib/mock-data";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, Legend,
} from "recharts";
import { Download, TrendingUp, Clock, Package } from "lucide-react";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics — KaliPOS" }, { name: "description", content: "Sales, profit, top products and peak hours." }] }),
  component: Reports,
});

const hourly = [
  { h: "8a", s: 1200 }, { h: "10a", s: 3400 }, { h: "12p", s: 6800 },
  { h: "2p", s: 5200 }, { h: "4p", s: 4100 }, { h: "6p", s: 8400 },
  { h: "8p", s: 3200 }, { h: "10p", s: 900 },
];
const staffPerf = [
  { name: "Mercy A.", sales: 124000 },
  { name: "Grace W.", sales: 98500 },
  { name: "Linet A.", sales: 87200 },
  { name: "Daniel K.", sales: 64200 },
];

function Reports() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <PageHeader title="Reports" subtitle="Visual insights across your business." action={
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1.5" />Export PDF</Button>
      } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Weekly sales" value={KES(261500)} delta="+14.6%" tone="success" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Weekly profit" value={KES(73800)} delta="+9.2%" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Peak hour" value="6 PM" tone="mpesa" icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Inventory turnover" value="3.4x" tone="warning" icon={<Package className="h-5 w-5" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5 shadow-soft">
          <h3 className="font-semibold mb-1">Sales vs Profit</h3>
          <p className="text-xs text-muted-foreground mb-3">7 day comparison</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesTrend} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => KES(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="profit" stroke="var(--color-success)" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 shadow-soft">
          <h3 className="font-semibold mb-1">Peak sales hours</h3>
          <p className="text-xs text-muted-foreground mb-3">Today's footfall</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourly} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="h" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => KES(v)} />
              <Bar dataKey="s" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 shadow-soft">
          <h3 className="font-semibold mb-3">Staff performance</h3>
          <div className="space-y-3">
            {staffPerf.map((s, i) => {
              const pct = (s.sales / staffPerf[0].sales) * 100;
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium">{s.name}</span>
                    <span className="font-semibold">{KES(s.sales)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full gradient-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 shadow-soft">
          <h3 className="font-semibold mb-3">Top products this week</h3>
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/40">
                <div className="h-8 w-8 rounded-lg bg-primary-soft text-primary grid place-items-center font-bold text-sm">#{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.units} units</div>
                </div>
                <div className="text-sm font-semibold">{KES(p.revenue)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
