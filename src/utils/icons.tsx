import React from "react";
import {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Zap,
  Coffee,
  Briefcase,
  Laptop,
  TrendingUp,
  Award,
  Gift,
  HelpCircle,
  TrendingDown,
  ArrowRightLeft,
  CreditCard,
  PiggyBank,
  CircleDollarSign,
  type LucideIcon,
} from "lucide-react";

// Strict lookup mapping for standard seeded categories
export const categoryIconMap: Record<string, LucideIcon> = {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Zap,
  Coffee,
  Briefcase,
  Laptop,
  TrendingUp,
  Award,
  Gift,
  // Account/Transfer Icons
  CreditCard,
  PiggyBank,
  CircleDollarSign,
  ArrowRightLeft,
};

/**
 * Returns a React Component representing the category icon based on its string key.
 * Fallbacks to HelpCircle if unknown.
 */
export function getCategoryIcon(iconName?: string): LucideIcon {
  if (!iconName) return HelpCircle;
  return categoryIconMap[iconName] || HelpCircle;
}

/**
 * Renders the category icon as a TSX node with dynamic styling.
 */
export function renderCategoryIcon(iconName: string | undefined, className = "h-4 w-4") {
  const Icon = getCategoryIcon(iconName);
  return <Icon className={className} />;
}
