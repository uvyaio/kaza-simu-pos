import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared";
import { staff, KES } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield } from "lucide-react";

export const Route = createFileRoute("/_app/staff")({
  head: () => ({ meta: [{ title: "Staff — KaliPOS" }, { name: "description", content: "Manage cashiers, managers, roles and permissions." }] }),
  component: Staff,
});

function Staff() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <PageHeader title="Staff" subtitle="Roles, permissions and performance." action={
        <Button className="gradient-primary border-0"><Plus className="h-4 w-4 mr-1.5" />Invite staff</Button>
      } />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map(s => (
          <Card key={s.id} className="p-5 shadow-soft hover:shadow-elevated transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full gradient-primary text-primary-foreground grid place-items-center font-semibold">
                  {s.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.branch}</div>
                </div>
              </div>
              <Badge variant={s.status === "active" ? "default" : "secondary"} className={s.status === "active" ? "bg-success text-success-foreground" : ""}>
                {s.status === "active" ? "● On shift" : "Off"}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-xs">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">{s.role}</span>
            </div>
            {s.sales > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-xs text-muted-foreground">Sales this week</div>
                <div className="text-lg font-bold">{KES(s.sales)}</div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
