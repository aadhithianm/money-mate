"use client";

import React from "react";
import { cn } from "@/utils/styles";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverable = false, children, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/70 bg-card p-5 text-card-foreground shadow-premium-sm transition-all",
        hoverable && "hover:border-border hover:shadow-premium-md cursor-pointer active:scale-99",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
