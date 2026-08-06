import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyContext } from "@/lib/auth.functions";

export type Role = "owner" | "manager" | "cashier" | "kitchen" | "waiter";

export function useMyContext() {
  const fetcher = useServerFn(getMyContext);
  return useQuery({
    queryKey: ["me"],
    queryFn: () => fetcher(),
    staleTime: 60_000,
  });
}

export const roleLandingPath: Record<Role, string> = {
  owner: "/owner",
  manager: "/dashboard",
  cashier: "/pos",
  kitchen: "/orders",
  waiter: "/orders",
};

export const rolesAllowedByPath: Record<string, Role[]> = {
  "/owner": ["owner"],
  "/dashboard": ["owner", "manager"],
  "/reports": ["owner", "manager"],
  "/inventory": ["owner", "manager"],
  "/ai": ["owner", "manager"],
  "/settings": ["owner"],
  "/staff": ["owner"],
  "/customers": ["owner", "manager", "cashier", "waiter"],
  "/pos": ["owner", "manager", "cashier"],
  "/orders": ["owner", "manager", "kitchen", "waiter"],
};
