import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label, value, delta, tone = "default", icon,
}: { label: string; value: string; delta?: string; tone?: "default" | "success" | "warning" | "danger" | "mpesa"; icon?: ReactNode }) {
  const toneCls: Record<string, string> = {
    default: "bg-primary-soft text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    danger: "bg-destructive/15 text-destructive",
    mpesa: "bg-mpesa/15 text-mpesa",
  };
  return (
    <div className="rounded-2xl bg-card border p-5 shadow-soft hover:shadow-elevated transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {delta && <div className="text-xs text-success font-medium">{delta}</div>}
        </div>
        {icon && <div className={cn("h-10 w-10 rounded-xl grid place-items-center", toneCls[tone])}>{icon}</div>}
      </div>
    </div>
  );
}
