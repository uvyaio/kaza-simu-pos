import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ShoppingCart, Package, BarChart3, Sparkles,
  Users, UserCog, Settings, Smartphone, Store, Wifi, WifiOff, ChefHat, LayoutGrid,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { useMyContext, type Role } from "@/hooks/use-my-context";

type Item = { title: string; url: string; icon: any; roles: Role[] };

const operate: Item[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["owner", "manager"] },
  { title: "POS Checkout", url: "/pos", icon: ShoppingCart, roles: ["owner", "manager", "cashier"] },
  { title: "Kitchen", url: "/kitchen", icon: ChefHat, roles: ["owner", "manager", "kitchen"] },
  { title: "Tables", url: "/tables", icon: LayoutGrid, roles: ["owner", "manager", "waiter"] },
  { title: "Inventory", url: "/inventory", icon: Package, roles: ["owner", "manager"] },
  { title: "Reports", url: "/reports", icon: BarChart3, roles: ["owner", "manager"] },
  { title: "AI Assistant", url: "/ai", icon: Sparkles, roles: ["owner", "manager"] },
];
const manage: Item[] = [
  { title: "Customers", url: "/customers", icon: Users, roles: ["owner", "manager", "cashier", "waiter"] },
  { title: "Staff", url: "/staff", icon: UserCog, roles: ["owner"] },
  { title: "Owner App", url: "/owner", icon: Smartphone, roles: ["owner"] },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["owner"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [online, setOnline] = useState(true);
  const { data } = useMyContext();
  const role = data?.role ?? "owner";
  const visibleOp = operate.filter((i) => i.roles.includes(role));
  const visibleMg = manage.filter((i) => i.roles.includes(role));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-2.5">
          <div className="h-9 w-9 rounded-xl gradient-primary grid place-items-center shadow-soft">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display text-base font-bold tracking-tight">Kato's Kitchen</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {data?.profile?.full_name ? `${data.profile.full_name} · ${role}` : "Powered by KaliPOS"}
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleOp.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={path === item.url}>
                    <Link to={item.url} className="flex items-center gap-2.5">
                      <item.icon className="h-[18px] w-[18px]" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {visibleMg.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Manage</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleMg.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={path === item.url}>
                      <Link to={item.url} className="flex items-center gap-2.5">
                        <item.icon className="h-[18px] w-[18px]" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <button
          onClick={() => setOnline(!online)}
          className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          {online ? <Wifi className="h-4 w-4 text-success" /> : <WifiOff className="h-4 w-4 text-warning" />}
          {!collapsed && (
            <div className="flex flex-col items-start text-left">
              <span className="text-xs font-medium">{online ? "Online & synced" : "Working offline"}</span>
              <span className="text-[10px] text-muted-foreground">{online ? "All data live" : "Will sync when back"}</span>
            </div>
          )}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
