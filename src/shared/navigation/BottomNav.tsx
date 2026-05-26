"use client";

import React, { useState } from "react";
import { cn } from "@/utils/styles";
import { navigationConfig } from "./config";

export const BottomNav: React.FC = () => {
  const [activeTab, setActiveTab] = useState("transactions");

  // Keep 5 items including centered FAB, exclude settings page
  const navItems = navigationConfig.filter((item) => item.id !== "settings");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/40 pb-safe-bottom select-none transition-colors shadow-premium-lg">
      <div className="h-16 flex items-center justify-around px-2 max-w-md mx-auto relative">
        {navItems.map((item) => {
          if (item.id === "fab-placeholder") {
            return <div key="fab-placeholder" className="w-14 h-14" />; // Reserve space for the floating button
          }
          
          const Icon = item.icon!;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1.5 transition-colors cursor-pointer touch-target",
                isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-105")} />
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
