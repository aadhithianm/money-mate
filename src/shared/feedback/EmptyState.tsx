"use client";

import React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/utils/styles";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Entries Yet",
  description = "Start your ledger by adding your first financial transaction below.",
  icon,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/60 rounded-lg bg-card/30 select-none",
        className
      )}
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-secondary text-muted-foreground/80 mb-4 border border-border/20">
        {icon || <Inbox className="h-5.5 w-5.5" />}
      </div>
      
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed mb-4">
        {description}
      </p>
      
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};
export default EmptyState;
