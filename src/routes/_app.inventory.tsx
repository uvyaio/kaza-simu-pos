import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared";
import { products, KES } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, AlertTriangle, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/inventory")({
  head: () => ({ meta: [{ title: "Inventory — KaliPOS" }, { name: "description", content: "Track stock, expiry, suppliers and reorder smartly." }] }),
  component: Inventory,
});

function Inventory() {
  const [q, setQ] = useState("");
  const list = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  const lowStock = products.filter(p => p.stock <= p.reorder);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Inventory"
        subtitle={`${products.length} products · ${lowStock.length} need reorder`}
        action={<Button className="gradient-primary border-0"><Plus className="h-4 w-4 mr-1.5" />Add product</Button>}
      />

      <Card className="p-4 border-warning/40 bg-warning/5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-warning/20 grid place-items-center"><Sparkles className="h-5 w-5 text-warning-foreground" /></div>
          <div className="flex-1">
            <div className="font-semibold text-sm">AI reorder suggestion</div>
            <p className="text-xs text-muted-foreground mt-0.5">Based on sales velocity, reorder these in the next 2 days: <b>Mumias Sugar, Daawat Rice, Supa Loaf, Tropikal Apples</b>.</p>
          </div>
          <Button size="sm" variant="outline">Create order</Button>
        </div>
      </Card>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1.5" />Filter</Button>
      </div>

      <Card className="overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium p-3">Product</th>
                <th className="text-left font-medium p-3 hidden md:table-cell">SKU</th>
                <th className="text-left font-medium p-3 hidden md:table-cell">Category</th>
                <th className="text-right font-medium p-3">Price</th>
                <th className="text-right font-medium p-3">Stock</th>
                <th className="text-left font-medium p-3 hidden lg:table-cell">Supplier</th>
                <th className="text-left font-medium p-3 hidden lg:table-cell">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {list.map(p => {
                const low = p.stock <= p.reorder;
                return (
                  <tr key={p.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted grid place-items-center text-lg">{p.emoji}</div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground md:hidden">{p.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground font-mono text-xs">{p.sku}</td>
                    <td className="p-3 hidden md:table-cell"><Badge variant="secondary">{p.category}</Badge></td>
                    <td className="p-3 text-right font-semibold">{KES(p.price)}</td>
                    <td className="p-3 text-right">
                      <span className={cn("inline-flex items-center gap-1 font-semibold", low && "text-warning-foreground")}>
                        {low && <AlertTriangle className="h-3 w-3" />}
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell text-xs text-muted-foreground">{p.supplier}</td>
                    <td className="p-3 hidden lg:table-cell text-xs text-muted-foreground">{p.expiry || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
