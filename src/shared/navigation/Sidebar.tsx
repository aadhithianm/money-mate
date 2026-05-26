"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { ChevronLeft, ChevronRight, LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/utils/styles";
import { navigationConfig } from "./config";
import { Avatar } from "@/shared/ui/Avatar";

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar, addToast } = useUIStore();
  const { user, logout } = useAuthStore();
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");

  // Filter out mobile-only action placeholders
  const navigationItems = navigationConfig.filter((item) => !item.isPlaceholder);

  const isOpen = sidebarOpen || isHovered;

  const handleLogout = async () => {
    try {
      await logout();
      addToast("Successfully logged out", "info");
    } catch {
      addToast("Failed to log out", "error");
    }
  };

  const getInitials = () => {
    if (!user) return "MM";
    const name = user.user_metadata?.full_name || user.email || "MM";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <motion.aside
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 left-0 bg-card border-r border-border/40 select-none z-30 overflow-x-hidden flex-shrink-0 transition-colors"
      )}
      animate={{ width: isOpen ? 240 : 68 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/40 flex-shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">M</span>
          </div>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-bold text-sm truncate text-foreground"
            >
              Money Mate
            </motion.span>
          )}
        </div>

        {isOpen && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors cursor-pointer text-muted-foreground hover:text-foreground hidden md:block"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          if (!Icon) return null;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-md transition-colors text-sm font-medium cursor-pointer relative group touch-target",
                isActive
                  ? "bg-secondary text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4.5 w-4.5 flex-shrink-0", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="ml-3 truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile & Logout Section at bottom */}
      <div className="p-3 border-t border-border/40 mt-auto flex-shrink-0 space-y-2">
        <div className="flex items-center space-x-3 px-1">
          <Avatar
            size="sm"
            fallback={getInitials()}
            src={user?.user_metadata?.avatar_url}
          />
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 min-w-0"
            >
              <p className="text-xs font-bold text-foreground truncate">
                {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
              </p>
              <p className="text-[9px] font-medium text-muted-foreground truncate">
                {user?.email}
              </p>
            </motion.div>
          )}
        </div>

        {isOpen ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 rounded-md hover:bg-secondary/60 text-xs font-semibold text-destructive/80 hover:text-destructive cursor-pointer transition-all"
          >
            <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
            <span>Logout</span>
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-2 rounded-md hover:bg-secondary/60 text-destructive/80 hover:text-destructive cursor-pointer transition-all"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Collapsed Toggle Button */}
      {!sidebarOpen && !isHovered && (
        <div className="p-3 flex justify-center border-t border-border/40">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </motion.aside>
  );
};
export default Sidebar;
