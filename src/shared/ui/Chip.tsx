"use client";

import React from "react";
import { cn } from "@/utils/styles";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "income" | "expense" | "transfer" | "outline";
  size?: "sm" | "md";
}

export const Chip: React.FC<ChipProps> = ({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full transition-colors select-none";
  
  const variants = {
    default: "bg-secondary text-secondary-foreground",
    income: "bg-income/10 text-income border border-income/20",
    expense: "bg-expense/10 text-expense border border-expense/20",
    transfer: "bg-transfer/10 text-transfer border border-transfer/20",
    outline: "border border-border text-muted-foreground",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};
