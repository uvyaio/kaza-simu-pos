import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { products as seedProducts, KES, DAYS, type Product, type Day } from "@/lib/mock-data";
import { Search, ScanLine, Plus, Minus, Trash2, Smartphone, Banknote, Split, CheckCircle2, X, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/pos")({
  head: () => ({ meta: [{ title: "Menu & POS — Kato's Kitchen" }, { name: "description", content: "Kato's Kitchen menu, day-of-week planner and fast M-Pesa checkout." }] }),
  component: POS,
});

type CartItem = Product & { qty: number };

const todayDay = (): Day => DAYS[(new Date().getDay() + 6) % 7]; // Mon-first

function POS() {
  const [menu, setMenu] = useState<Product[]>(seedProducts);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([
    { ...seedProducts[0], qty: 1 },
    { ...seedProducts[8], qty: 2 },
  ]);
  const [paying, setPaying] = useState<null | "mpesa" | "cash" | "split" | "done">(null);
  const [activeCat, setActiveCat] = useState("All");
  const [activeDay, setActiveDay] = useState<Day>(todayDay());
  const [scanOpen, setScanOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const handleScanned = (code: string) => {
    setScanOpen(false);
    const match = menu.find(p => p.sku === code || p.id === code || p.name.toLowerCase().includes(code.toLowerCase()));
    if (match) {
      addToCart(match);
      toast.success(`Added ${match.name}`, { description: `Code: ${code}` });
    } else {
      setQuery(code);
      toast.warning("Dish not found", { description: `Scanned ${code}. Search shown.` });
    }
  };

  const cats = ["All", ...Array.from(new Set(menu.map((p) => p.category)))];
  const filtered = useMemo(() => menu.filter(p =>
    p.days.includes(activeDay) &&
    (activeCat === "All" || p.category === activeCat) &&
    (p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))
  ), [menu, query, activeCat, activeDay]);

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = Math.round(subtotal * 0.16);
  const total = subtotal + tax;

  const addToCart = (p: Product) => setCart(c => {
    const ex = c.find(x => x.id === p.id);
    return ex ? c.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x) : [...c, { ...p, qty: 1 }];
  });
  const setQty = (id: string, d: number) => setCart(c => c.flatMap(x => x.id === id ? (x.qty + d <= 0 ? [] : [{ ...x, qty: x.qty + d }]) : [x]));
  const remove = (id: string) => setCart(c => c.filter(x => x.id !== id));

  const handleAddDish = (dish: Product) => {
    setMenu(m => [...m, dish]);
    toast.success(`Added "${dish.name}" to the menu`);
    setAddOpen(false);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] h-[calc(100vh-3.5rem)] bg-muted/30">
      <div className="overflow-auto border-r">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 lg:px-6 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search today's menu…" className="pl-10 h-11 rounded-xl bg-card" />
            </div>
            <Button variant="outline" className="h-11 w-11 p-0 rounded-xl shrink-0" onClick={() => setScanOpen(true)} title="Scan code"><ScanLine className="h-5 w-5" /></Button>
            <Button className="h-11 rounded-xl gap-1.5 gradient-primary border-0 shrink-0" onClick={() => setAddOpen(true)}>
              <PlusCircle className="h-4 w-4" /> <span className="hidden sm:inline">Add dish</span>
            </Button>
          </div>

          {/* Day-of-week segmented control */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/70 overflow-x-auto">
            {DAYS.map(d => (
              <button key={d} onClick={() => setActiveDay(d)}
                className={cn("flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                  activeDay === d ? "bg-card text-primary shadow-soft" : "text-muted-foreground hover:text-foreground")}>
                {d}{d === todayDay() && <span className="ml-1 text-primary">•</span>}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {cats.map(c => (
              <button key={c} onClick={() => setActiveCat(c)}
                className={cn("px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors",
                  activeCat === c ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground hover:text-foreground")}>
                {c}
              </button>
            ))}
            <span className="ml-auto shrink-0 text-[11px] text-muted-foreground pl-2">{filtered.length} dishes</span>
          </div>
        </div>

        <div className="p-4 lg:p-6">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground bg-card">
            No dishes on the {activeDay} menu yet. Tap <span className="font-semibold text-foreground">Add dish</span> to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filtered.map(p => {
              const low = p.stock <= p.reorder;
              return (
              <button key={p.id} onClick={() => addToCart(p)}
                className="group relative text-left rounded-2xl border bg-card p-3.5 flex gap-3.5 items-center hover:border-primary/60 hover:shadow-elevated transition-all active:scale-[0.985]">
                <div className="h-16 w-16 shrink-0 rounded-xl bg-primary-soft grid place-items-center text-3xl">
                  {p.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold leading-tight truncate">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {p.category}
                        {p.days.length !== 7 && <span> · {p.days.join(", ")}</span>}
                      </div>
                    </div>
                    {low && (
                      <Badge variant="secondary" className="shrink-0 text-[10px] bg-warning/20 text-warning-foreground">Low</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold tracking-tight">{KES(p.price)}</span>
                    <span className="text-[11px] text-muted-foreground">{p.stock} {p.unit}</span>
                  </div>
                </div>
                <div className="absolute right-3 -top-2 h-7 w-7 rounded-full gradient-primary grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity shadow-soft">
                  <Plus className="h-4 w-4 text-primary-foreground" />
                </div>
              </button>
            );})}
          </div>
        )}
        </div>
      </div>


      <div className="flex flex-col bg-card max-h-[calc(100vh-3.5rem)]">
        <div className="px-5 py-4 border-b">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-semibold text-base truncate">Current order</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">Mercy A. · Kato's Kitchen</p>
            </div>
            <Badge variant="outline" className="gap-1.5 shrink-0"><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />#1842</Badge>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3 space-y-2">
          {cart.length === 0 && (
            <div className="rounded-2xl border border-dashed py-14 text-center text-sm text-muted-foreground">
              <div className="text-3xl mb-2">🧾</div>
              No dishes yet — tap a menu card.
            </div>
          )}
          {cart.map(item => (
            <div key={item.id} className="group flex items-center gap-3 p-2.5 rounded-xl border bg-background/60 hover:border-primary/40 transition-colors">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-primary-soft grid place-items-center text-xl">{item.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{item.name}</div>
                <div className="text-[11px] text-muted-foreground">{KES(item.price)} × {item.qty} = <span className="font-medium text-foreground">{KES(item.price * item.qty)}</span></div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => setQty(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => setQty(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => remove(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>


        <div className="border-t p-4 space-y-3 bg-card">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{KES(subtotal)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>VAT (16%)</span><span>{KES(tax)}</span></div>
            <div className="flex justify-between text-lg font-bold pt-1.5 border-t"><span>Total</span><span>{KES(total)}</span></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button onClick={() => setPaying("mpesa")} className="h-14 flex-col gap-0.5 bg-mpesa text-mpesa-foreground hover:bg-mpesa/90">
              <Smartphone className="h-4 w-4" /><span className="text-xs font-semibold">M-Pesa</span>
            </Button>
            <Button onClick={() => setPaying("cash")} variant="outline" className="h-14 flex-col gap-0.5">
              <Banknote className="h-4 w-4" /><span className="text-xs font-semibold">Cash</span>
            </Button>
            <Button onClick={() => setPaying("split")} variant="outline" className="h-14 flex-col gap-0.5">
              <Split className="h-4 w-4" /><span className="text-xs font-semibold">Split</span>
            </Button>
          </div>
        </div>
      </div>

      {paying && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 backdrop-blur-sm p-4 animate-slide-up">
          <Card className="w-full max-w-sm p-6 shadow-elevated">
            <button onClick={() => setPaying(null)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            {paying === "done" ? (
              <div className="text-center py-4">
                <div className="h-16 w-16 rounded-full bg-success/15 grid place-items-center mx-auto mb-3">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-bold">Payment received</h3>
                <p className="text-sm text-muted-foreground mt-1">{KES(total)} via M-Pesa</p>
                <Button className="w-full mt-5" onClick={() => { setPaying(null); setCart([]); }}>Print receipt & close</Button>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="h-14 w-14 rounded-2xl gradient-primary grid place-items-center mx-auto mb-3">
                  {paying === "mpesa" ? <Smartphone className="h-6 w-6 text-primary-foreground" /> : <Banknote className="h-6 w-6 text-primary-foreground" />}
                </div>
                <h3 className="text-xl font-bold capitalize">{paying} payment</h3>
                <p className="text-sm text-muted-foreground mt-1">Amount due</p>
                <div className="text-3xl font-bold mt-2">{KES(total)}</div>
                {paying === "mpesa" && (
                  <p className="text-xs text-muted-foreground mt-3">STK push sent to customer phone. Waiting for confirmation...</p>
                )}
                <Button className="w-full mt-5 h-11" onClick={() => setPaying("done")}>Confirm payment</Button>
              </div>
            )}
          </Card>
        </div>
      )}
      <BarcodeScanner open={scanOpen} onClose={() => setScanOpen(false)} onDetected={handleScanned} />
      <AddDishDialog open={addOpen} onOpenChange={setAddOpen} onAdd={handleAddDish} defaultDay={activeDay} existingCats={cats.filter(c => c !== "All")} />
    </div>
  );
}

function AddDishDialog({
  open, onOpenChange, onAdd, defaultDay, existingCats,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (dish: Product) => void;
  defaultDay: Day;
  existingCats: string[];
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(existingCats[0] ?? "Mains");
  const [price, setPrice] = useState<number | "">("");
  const [cost, setCost] = useState<number | "">("");
  const [emoji, setEmoji] = useState("🍽️");
  const [days, setDays] = useState<Day[]>([defaultDay]);

  const toggleDay = (d: Day) =>
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const reset = () => {
    setName(""); setPrice(""); setCost(""); setEmoji("🍽️"); setDays([defaultDay]);
  };

  const submit = () => {
    if (!name.trim() || price === "" || days.length === 0) {
      toast.error("Add a name, price and at least one day");
      return;
    }
    const id = `m-${Date.now()}`;
    onAdd({
      id,
      name: name.trim(),
      sku: `MENU-${id.slice(-4).toUpperCase()}`,
      category,
      price: Number(price),
      cost: Number(cost || 0),
      stock: 20,
      reorder: 5,
      unit: "plate",
      emoji: emoji || "🍽️",
      supplier: "Kitchen",
      days,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a new dish</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Emoji</Label>
              <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2} className="text-2xl h-11 text-center" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Dish name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mukimo" className="h-11" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Price (KES)</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} placeholder="450" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Food cost</Label>
              <Input type="number" value={cost} onChange={(e) => setCost(e.target.value === "" ? "" : Number(e.target.value))} placeholder="180" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-2 text-sm">
                {existingCats.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Specials">Specials</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Available on</Label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map(d => (
                <button key={d} type="button" onClick={() => toggleDay(d)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                    days.includes(d) ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted")}>
                  {d}
                </button>
              ))}
              <button type="button" onClick={() => setDays([...DAYS])}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-muted hover:bg-muted/80">
                Everyday
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="gradient-primary border-0" onClick={submit}>Add dish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
