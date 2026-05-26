"use client";

import React from "react";
import { Moon, Sun, Menu } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/utils/styles";

export interface HeaderProps {
  title: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  leftAction,
  rightAction,
  className,
}) => {
  const { theme, toggleTheme, toggleSidebar } = useUIStore();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center justify-between transition-colors pt-[calc(12px+var(--spacing-safe-top))]",
        className
      )}
    >
      <div className="flex items-center min-w-[44px]">
        {leftAction !== undefined ? leftAction : (
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 -ml-2 rounded-full hover:bg-secondary transition-colors cursor-pointer text-muted-foreground hover:text-foreground touch-target flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      <h1 className="text-sm font-semibold tracking-tight text-foreground select-none text-center truncate px-2">
        {title}
      </h1>

      <div className="flex items-center justify-end min-w-[44px]">
        {rightAction !== undefined ? rightAction : (
          <button
            onClick={toggleTheme}
            className="p-2 -mr-2 rounded-full hover:bg-secondary transition-colors cursor-pointer text-muted-foreground hover:text-foreground touch-target flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>
        )}
      </div>
    </header>
  );
};
