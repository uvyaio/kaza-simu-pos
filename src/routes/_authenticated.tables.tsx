import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared";
import { LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tables")({
  head: () => ({ meta: [{ title: "Tables — KaliPOS" }] }),
  component: TablesView,
});

const tables = Array.from({ length: 12 }, (_, i) => ({
  n: i + 1,
  seats: [2, 4, 4, 6, 2, 4, 8, 4, 2, 4, 6, 4][i],
  status: ["free", "seated", "ordered", "free", "seated", "free", "ordered", "free", "free", "seated", "free", "ordered"][i] as "free" | "seated" | "ordered",
}));

const colors = {
  free: "bg-success/10 border-success/40 text-success",
  seated: "bg-warning/10 border-warning/40 text-warning",
  ordered: "bg-primary/10 border-primary/40 text-primary",
};

function TablesView() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <PageHeader title="Tables" subtitle="Tap a table to take an order or send to kitchen." />
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {tables.map((t) => (
          <Card key={t.n} className={cn("p-4 border-2 cursor-pointer hover:scale-[1.02] transition-transform", colors[t.status])}>
            <div className="font-display text-2xl font-bold">T{t.n}</div>
            <div className="text-xs opacity-80">{t.seats} seats</div>
            <Badge variant="outline" className="mt-2 capitalize border-current">{t.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
