import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared";
import { ingredients, products, KES } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, AlertTriangle, Sparkles, ShoppingCart, UtensilsCrossed, Carrot } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/inventory")({
  head: () => ({ meta: [{ title: "Inventory — KaliPOS" }, { name: "description", content: "Track kitchen ingredients, menu items, expiry and shopping lists." }] }),
  component: Inventory,
});

type Tab = "ingredients" | "menu";

function Inventory() {
  const [tab, setTab] = useState<Tab>("ingredients");
  const [q, setQ] = useState("");

  const lowIngredients = ingredients.filter(i => i.stock <= i.reorder);
  const lowMenu = products.filter(p => p.stock <= p.reorder);

  const filteredIngredients = useMemo(
    () => ingredients.filter(i => i.name.toLowerCase().includes(q.toLowerCase()) || i.category.toLowerCase().includes(q.toLowerCase())),
    [q]
  );
  const filteredMenu = useMemo(
    () => products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  const shoppingListCost = lowIngredients.reduce((s, i) => s + i.costPerUnit * Math.max(i.reorder * 2 - i.stock, 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Inventory"
        subtitle={`${ingredients.length} ingredients · ${products.length} menu items · ${lowIngredients.length + lowMenu.length} need attention`}
        action={
          <Button className="gradient-primary border-0">
            <Plus className="h-4 w-4 mr-1.5" />
            {tab === "ingredients" ? "Add ingredient" : "Add menu item"}
          </Button>
        }
      />

      <Card className="p-4 border-warning/40 bg-warning/5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-warning/20 grid place-items-center shrink-0"><Sparkles className="h-5 w-5 text-warning-foreground" /></div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Today's market shopping list
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI suggests restocking <b>{lowIngredients.slice(0, 4).map(i => i.name).join(", ")}</b>
              {lowIngredients.length > 4 && ` +${lowIngredients.length - 4} more`}. Estimated cost: <b>{KES(shoppingListCost)}</b>.
            </p>
          </div>
          <Button size="sm" variant="outline" className="shrink-0">Send to WhatsApp</Button>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-xl border bg-card p-1">
          <button
            onClick={() => setTab("ingredients")}
            className={cn("flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
              tab === "ingredients" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
            <Carrot className="h-4 w-4" /> Ingredients ({ingredients.length})
          </button>
          <button
            onClick={() => setTab("menu")}
            className={cn("flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
              tab === "menu" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
            <UtensilsCrossed className="h-4 w-4" /> Menu ({products.length})
          </button>
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "ingredients" ? "Search tomatoes, fish..." : "Search dishes..."} className="pl-9" />
        </div>
        <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1.5" />Filter</Button>
      </div>

      {tab === "ingredients" ? (
        <Card className="overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-medium p-3">Ingredient</th>
                  <th className="text-left font-medium p-3 hidden md:table-cell">Category</th>
                  <th className="text-right font-medium p-3">Cost / unit</th>
                  <th className="text-right font-medium p-3">In stock</th>
                  <th className="text-right font-medium p-3 hidden sm:table-cell">Reorder at</th>
                  <th className="text-left font-medium p-3 hidden lg:table-cell">Supplier</th>
                  <th className="text-left font-medium p-3 hidden lg:table-cell">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {filteredIngredients.map(i => {
                  const low = i.stock <= i.reorder;
                  return (
                    <tr key={i.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-muted grid place-items-center text-lg">{i.emoji}</div>
                          <div>
                            <div className="font-medium">{i.name}</div>
                            <div className="text-xs text-muted-foreground md:hidden">{i.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell"><Badge variant="secondary">{i.category}</Badge></td>
                      <td className="p-3 text-right font-semibold">{KES(i.costPerUnit)}<span className="text-xs text-muted-foreground font-normal">/{i.unit}</span></td>
                      <td className="p-3 text-right">
                        <span className={cn("inline-flex items-center gap-1 font-semibold", low && "text-warning-foreground")}>
                          {low && <AlertTriangle className="h-3 w-3" />}
                          {i.stock} {i.unit}
                        </span>
                      </td>
                      <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">{i.reorder} {i.unit}</td>
                      <td className="p-3 hidden lg:table-cell text-xs text-muted-foreground">{i.supplier}</td>
                      <td className="p-3 hidden lg:table-cell text-xs text-muted-foreground">{i.expiry || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-medium p-3">Menu item</th>
                  <th className="text-left font-medium p-3 hidden md:table-cell">Category</th>
                  <th className="text-right font-medium p-3">Price</th>
                  <th className="text-right font-medium p-3 hidden md:table-cell">Food cost</th>
                  <th className="text-right font-medium p-3 hidden md:table-cell">Margin</th>
                  <th className="text-right font-medium p-3">Available</th>
                </tr>
              </thead>
              <tbody>
                {filteredMenu.map(p => {
                  const low = p.stock <= p.reorder;
                  const margin = Math.round(((p.price - p.cost) / p.price) * 100);
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
                      <td className="p-3 hidden md:table-cell"><Badge variant="secondary">{p.category}</Badge></td>
                      <td className="p-3 text-right font-semibold">{KES(p.price)}</td>
                      <td className="p-3 text-right hidden md:table-cell text-muted-foreground">{KES(p.cost)}</td>
                      <td className="p-3 text-right hidden md:table-cell">
                        <span className={cn("font-semibold", margin >= 50 ? "text-success" : "text-warning-foreground")}>{margin}%</span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={cn("inline-flex items-center gap-1 font-semibold", low && "text-warning-foreground")}>
                          {low && <AlertTriangle className="h-3 w-3" />}
                          {p.stock} {p.unit}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
