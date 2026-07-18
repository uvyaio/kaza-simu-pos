import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/shared";
import { KES, salesTrend, paymentSplit, topProducts, aiInsights, branches } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from "recharts";
import { TrendingUp, Wallet, ShoppingBag, Receipt, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — KaliPOS" }, { name: "description", content: "Live sales, profit, AI insights for your shop." }] }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Habari, Kato 👋"
        subtitle="Here's what's cooking at Kato's Kitchen today."
        action={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 py-1 px-2.5"><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />Live</Badge>
            <Button variant="outline" size="sm">Today</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's sales" value={KES(58420)} delta="+12.4% vs yesterday" tone="success" icon={<Wallet className="h-5 w-5" />} />
        <StatCard label="Profit" value={KES(16780)} delta="+8.2%" tone="default" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Transactions" value="184" delta="+22 vs avg" tone="mpesa" icon={<Receipt className="h-5 w-5" />} />
        <StatCard label="Items sold" value="412" tone="warning" icon={<ShoppingBag className="h-5 w-5" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Sales & profit trend</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary" />Sales</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-success" />Profit</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={salesTrend} margin={{ left: -10, right: 5, top: 5 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => KES(v)} />
              <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" fill="url(#g1)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="profit" stroke="var(--color-success)" fill="url(#g2)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg gradient-primary grid place-items-center"><Sparkles className="h-4 w-4 text-primary-foreground" /></div>
            <div>
              <h3 className="font-semibold text-sm">KaliPOS AI</h3>
              <p className="text-[11px] text-muted-foreground">Today's smart insights</p>
            </div>
          </div>
          <div className="space-y-2">
            {aiInsights.map((i) => (
              <div key={i.title} className="rounded-xl border bg-muted/30 p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-start gap-2.5">
                  <span className="text-lg leading-none mt-0.5">{i.icon}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{i.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{i.body}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-3 text-primary justify-between">
            Ask AI a question <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 shadow-soft">
          <h3 className="font-semibold mb-1">Payment methods</h3>
          <p className="text-xs text-muted-foreground mb-2">Today's split</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={paymentSplit} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {paymentSplit.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {paymentSplit.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />{p.name}</span>
                <span className="font-semibold">{p.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Top selling dishes</h3>
              <p className="text-xs text-muted-foreground">By plates served today</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topProducts} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="units" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Branch performance</h3>
            <p className="text-xs text-muted-foreground">Compare your shops at a glance</p>
          </div>
          <Button variant="outline" size="sm">Manage branches</Button>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {branches.map((b) => (
            <div key={b.id} className="rounded-xl border p-4 hover:border-primary transition-colors">
              <div className="text-sm font-medium">{b.name}</div>
              <div className="text-xl font-bold mt-1">{KES(b.sales)}</div>
              <div className={`text-xs mt-1 font-medium ${b.growth >= 0 ? "text-success" : "text-destructive"}`}>
                {b.growth >= 0 ? "↑" : "↓"} {Math.abs(b.growth)}% this week
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
