import { Outlet, useNavigate, Link } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import {
  Bell, Search, Sun, Moon, LogOut, Wifi, WifiOff, RefreshCw,
  AlertTriangle, ShoppingBag, Sparkles, CheckCircle2, TrendingUp, ArrowRight, CheckCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "alert" | "order" | "ai" | "mpesa" | "report";
  unread: boolean;
  link: string;
  icon: any;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "n-1",
    title: "Low Stock: Tilapia & Tomatoes ⚠️",
    body: "Fresh Tilapia (4 kg left) and Tomatoes (3 kg left) below reorder levels.",
    time: "5m ago",
    type: "alert",
    unread: true,
    link: "/inventory",
    icon: AlertTriangle,
  },
  {
    id: "n-2",
    title: "New Online Order #KK-1046 🛍️",
    body: "Mercy Akinyi ordered Nyama Choma (KSh 1,130) — M-Pesa SJ42KD9L1M Confirmed.",
    time: "12m ago",
    type: "order",
    unread: true,
    link: "/orders",
    icon: ShoppingBag,
  },
  {
    id: "n-3",
    title: "KaliPOS AI Business Insight ✨",
    body: "Pilau ya Kuku sales up 22% this week! Tap to review smart restocking advice.",
    time: "1h ago",
    type: "ai",
    unread: true,
    link: "/ai",
    icon: Sparkles,
  },
  {
    id: "n-4",
    title: "M-Pesa Auto-Reconciled 📱",
    body: "Till 174379 matched 18 customer STK transactions totaling KSh 58,420.",
    time: "2h ago",
    type: "mpesa",
    unread: false,
    link: "/dashboard",
    icon: CheckCircle2,
  },
  {
    id: "n-5",
    title: "Lunch Peak Sales Milestone 📈",
    body: "Grace Wairimu recorded KSh 24,800 between 12 PM – 2 PM.",
    time: "3h ago",
    type: "report",
    unread: false,
    link: "/reports",
    icon: TrendingUp,
  },
];

export function AppLayout() {
  const [dark, setDark] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");

  const navigate = useNavigate();
  const qc = useQueryClient();

  const unreadCount = notifications.filter((n) => n.unread).length;

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success("All notifications marked as read");
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    setPopoverOpen(false);
    navigate({ to: item.link });
    toast.info(item.title, { description: `Navigating to ${item.link}` });
  };

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const displayedNotifications = notifications.filter(
    (n) => activeFilter === "all" || n.unread
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {!isOnline && (
            <div className="bg-amber-600 text-amber-50 px-4 py-1.5 text-xs font-medium flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-2">
                <WifiOff className="h-3.5 w-3.5 animate-pulse" />
                <span>Working offline — Sales and orders will automatically sync once your internet connection returns.</span>
              </div>
              <Badge variant="outline" className="bg-amber-700/50 border-amber-400 text-white text-[10px]">
                Offline Mode
              </Badge>
            </div>
          )}
          <header className="h-14 flex items-center gap-3 border-b bg-card/60 backdrop-blur px-3 sticky top-0 z-30">
            <SidebarTrigger />
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products, sales, customers..." className="pl-9 h-9 bg-muted/40 border-0" />
              </div>
            </div>
            <div className="flex-1 md:hidden" />
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5">
                {isOnline ? (
                  <Badge variant="outline" className="gap-1.5 py-1 px-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online & Synced
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1.5 py-1 px-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs">
                    <WifiOff className="h-3 w-3 text-amber-500" />
                    Offline Queue
                  </Badge>
                )}
              </div>

              <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} className="h-9 w-9">
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* NOTIFICATION BELL POPOVER */}
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 relative" title="Notifications">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground font-bold text-[10px] grid place-items-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 sm:w-96 p-0 shadow-xl border-border/80" align="end">
                  <div className="p-3.5 border-b bg-card flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <Badge className="bg-primary/15 text-primary text-[10px] py-0 px-1.5 border-0">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                      >
                        <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="px-3 py-2 border-b bg-muted/30 flex items-center gap-2 text-xs">
                    <button
                      onClick={() => setActiveFilter("all")}
                      className={cn(
                        "px-2.5 py-1 rounded-md transition-colors",
                        activeFilter === "all" ? "bg-card shadow-xs font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      onClick={() => setActiveFilter("unread")}
                      className={cn(
                        "px-2.5 py-1 rounded-md transition-colors",
                        activeFilter === "unread" ? "bg-card shadow-xs font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y">
                    {displayedNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        No notifications found
                      </div>
                    ) : (
                      displayedNotifications.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            className={cn(
                              "p-3.5 flex items-start gap-3 hover:bg-muted/50 transition-colors cursor-pointer group relative",
                              item.unread && "bg-primary/5"
                            )}
                          >
                            <div
                              className={cn(
                                "h-8 w-8 rounded-lg grid place-items-center shrink-0 mt-0.5",
                                item.type === "alert"
                                  ? "bg-warning/20 text-warning-foreground"
                                  : item.type === "order"
                                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                  : item.type === "ai"
                                  ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                                  : item.type === "mpesa"
                                  ? "bg-mpesa/15 text-mpesa"
                                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className={cn("text-xs font-semibold truncate", item.unread && "text-foreground font-bold")}>
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                                {item.body}
                              </p>
                              <div className="mt-1.5 flex items-center text-[11px] font-medium text-primary group-hover:underline gap-1">
                                View details <ArrowRight className="h-3 w-3" />
                              </div>
                            </div>

                            {item.unread && (
                              <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2 border-t bg-muted/20 text-center">
                    <button
                      onClick={() => {
                        setPopoverOpen(false);
                        navigate({ to: "/dashboard" });
                      }}
                      className="text-xs text-muted-foreground hover:text-primary font-medium transition-colors"
                    >
                      View all activity in Dashboard →
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={signOut} title="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto animate-slide-up">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}


