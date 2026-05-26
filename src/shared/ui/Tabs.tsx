"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/styles";

export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn("flex space-x-1 bg-secondary/50 p-1 rounded-md w-full relative select-none", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex-1 relative py-2.5 text-xs font-medium rounded-sm transition-colors cursor-pointer text-muted-foreground hover:text-foreground flex items-center justify-center z-10 touch-target",
              isActive && "text-foreground font-semibold"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute inset-0 bg-card rounded-sm -z-10 shadow-premium-sm border border-border/20"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
