"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/styles";

export interface ListItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "prefix"> {
  prefix?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  suffix?: React.ReactNode;
  showArrow?: boolean;
  interactive?: boolean;
  divider?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  className,
  prefix,
  title,
  subtitle,
  suffix,
  showArrow = false,
  interactive = false,
  divider = false,
  onClick,
  children,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-4 py-3.5 select-none touch-target",
        interactive && "hover:bg-secondary/40 active:bg-secondary/60 cursor-pointer transition-colors",
        divider && "border-b border-border/40",
        className
      )}
      {...props}
    >
      <div className="flex items-center space-x-3.5 min-w-0 flex-1">
        {prefix && <div className="flex-shrink-0 flex items-center justify-center">{prefix}</div>}
        <div className="min-w-0 flex flex-col flex-1">
          <span className="text-sm font-medium text-foreground truncate">{title}</span>
          {subtitle && <span className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</span>}
        </div>
      </div>
      
      <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
        {suffix && <div className="text-sm font-medium text-foreground">{suffix}</div>}
        {showArrow && <ChevronRight className="h-4 w-4 text-muted-foreground/60" />}
      </div>
      {children}
    </div>
  );
};
