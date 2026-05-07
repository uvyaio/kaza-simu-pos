import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { products, KES, type Product } from "@/lib/mock-data";
import { Search, ScanLine, Plus, Minus, Trash2, Smartphone, Banknote, Split, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/pos")({
  head: () => ({ meta: [{ title: "POS Checkout — KaliPOS" }, { name: "description", content: "Fast, mobile-first checkout with M-Pesa." }] }),
  component: POS,
});

type CartItem = Product & { qty: number };

function POS() {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([
    { ...products[1], qty: 2 },
    { ...products[9], qty: 1 },
  ]);
  const [paying, setPaying] = useState<null | "mpesa" | "cash" | "split" | "done">(null);
  const [activeCat, setActiveCat] = useState("All");
  const [scanOpen, setScanOpen] = useState(false);

  const handleScanned = (code: string) => {
    setScanOpen(false);
    const match = products.find(p => p.sku === code || p.id === code || p.name.toLowerCase().includes(code.toLowerCase()));
    if (match) {
      addToCart(match);
      toast.success(`Added ${match.name}`, { description: `Code: ${code}` });
    } else {
      setQuery(code);
      toast.warning("Product not found", { description: `Scanned ${code}. Search shown.` });
    }
  };

  const cats = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = useMemo(() => products.filter(p =>
    (activeCat === "All" || p.category === activeCat) &&
    (p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))
  ), [query, activeCat]);

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = Math.round(subtotal * 0.16);
  const total = subtotal + tax;

  const addToCart = (p: Product) => setCart(c => {
    const ex = c.find(x => x.id === p.id);
    return ex ? c.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x) : [...c, { ...p, qty: 1 }];
  });
  const setQty = (id: string, d: number) => setCart(c => c.flatMap(x => x.id === id ? (x.qty + d <= 0 ? [] : [{ ...x, qty: x.qty + d }]) : [x]));
  const remove = (id: string) => setCart(c => c.filter(x => x.id !== id));

  return (
    <div className="grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] h-[calc(100vh-3.5rem)]">
      <div className="overflow-auto p-4 lg:p-6 border-r">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products or scan SKU..." className="pl-10 h-12 text-base" />
          </div>
          <Button size="lg" variant="outline" className="h-12 w-12 p-0" onClick={() => setScanOpen(true)} title="Scan barcode"><ScanLine className="h-5 w-5" /></Button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {cats.map(c => (
            <button key={c} onClick={() => setActiveCat(c)}
              className={cn("px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                activeCat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted")}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(p => (
            <button key={p.id} onClick={() => addToCart(p)}
              className="text-left rounded-2xl border bg-card p-4 hover:border-primary hover:shadow-elevated transition-all active:scale-[0.98]">
              <div className="text-3xl mb-2">{p.emoji}</div>
              <div className="text-sm font-medium leading-tight line-clamp-2">{p.name}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-base font-bold text-primary">{KES(p.price)}</span>
                <Badge variant="secondary" className={cn("text-[10px]", p.stock <= p.reorder && "bg-warning/20 text-warning-foreground")}>
                  {p.stock} {p.unit}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col bg-card max-h-[calc(100vh-3.5rem)]">
        <div className="p-5 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Current sale</h2>
            <Badge variant="outline" className="gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success" />Receipt #1842</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Cashier: Mercy A. · Westlands</p>
        </div>

        <div className="flex-1 overflow-auto p-3 space-y-2">
          {cart.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">Cart is empty. Tap a product to add.</div>
          )}
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
              <div className="text-2xl">{item.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.name}</div>
                <div className="text-xs text-muted-foreground">{KES(item.price)} × {item.qty}</div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQty(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQty(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
    </div>
  );
}
