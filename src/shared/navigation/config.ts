import { Wallet, Landmark, CreditCard, BarChart3, Settings, LucideIcon } from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon | null;
  path?: string;
  isPlaceholder?: boolean;
}

/**
 * Reusable core navigation config for Money Mate.
 * Shared between mobile bottom nav bars and desktop collapsible sidebars.
 */
export const navigationConfig: NavigationItem[] = [
  { id: "transactions", label: "Ledger", icon: Wallet, path: "/" },
  { id: "accounts", label: "Accounts", icon: Landmark, path: "/accounts" },
  { id: "fab-placeholder", label: "", icon: null, isPlaceholder: true }, // Reserved slot for mobile thumb FAB
  { id: "budgets", label: "Budgets", icon: CreditCard, path: "/budgets" },
  { id: "stats", label: "Analytics", icon: BarChart3, path: "/stats" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];
