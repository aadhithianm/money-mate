"use client";

import React, { useState, useRef, useEffect } from "react";
import { Moon, Sun, Menu, ChevronDown, Plus, Check } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/utils/styles";

export interface HeaderProps {
  title?: string;
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
  const { theme, toggleTheme, toggleSidebar, addToast } = useUIStore();
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [newSpaceOpen, setNewSpaceOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setNewSpaceOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;

    try {
      await createWorkspace(newSpaceName, currentWorkspace?.currency || "USD", false);
      addToast(`Workspace "${newSpaceName}" created!`, "success");
      setNewSpaceName("");
      setNewSpaceOpen(false);
      setDropdownOpen(false);
    } catch {
      addToast("Failed to create workspace", "error");
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full bg-background/85 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center justify-between transition-colors pt-[calc(12px+var(--spacing-safe-top))]",
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

      {/* Workspace Switcher Display */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-border/40 hover:bg-secondary/40 active:scale-95 transition-all text-sm font-semibold tracking-tight text-foreground cursor-pointer"
        >
          <span>{currentWorkspace?.name || title || "Ledger Feed"}</span>
          <ChevronDown className={cn("h-3.5 w-3.5 opacity-60 transition-transform", dropdownOpen && "rotate-180")} />
        </button>

        {dropdownOpen && (
          <div className="absolute top-11 left-1/2 -translate-x-1/2 w-56 rounded-lg border border-border/60 bg-card p-1 shadow-premium-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-2.5 py-1.5 border-b border-border/40 mb-1">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                Active Ledger Workspaces
              </p>
            </div>
            
            <div className="max-h-48 overflow-y-auto no-scrollbar space-y-0.5">
              {workspaces.map((space) => {
                const isActive = space.id === currentWorkspace?.id;
                return (
                  <button
                    key={space.id}
                    onClick={() => {
                      switchWorkspace(space.id);
                      setDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium cursor-pointer transition-all hover:bg-secondary text-left",
                      isActive ? "bg-secondary text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="truncate">{space.name}</span>
                    {isActive && <Check className="h-3.5 w-3.5 text-foreground flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Create New Workspace Segment */}
            <div className="border-t border-border/40 mt-1 pt-1">
              {newSpaceOpen ? (
                <form onSubmit={handleCreateWorkspace} className="p-1 space-y-1.5">
                  <input
                    type="text"
                    placeholder="New Workspace Name"
                    value={newSpaceName}
                    onChange={(e) => setNewSpaceName(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 rounded border border-border bg-background focus:outline-none focus:border-ring"
                    autoFocus
                    maxLength={30}
                    required
                  />
                  <div className="flex space-x-1">
                    <button
                      type="submit"
                      className="flex-1 text-[10px] font-bold py-1 bg-primary text-primary-foreground rounded cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSpaceOpen(false)}
                      className="flex-1 text-[10px] font-bold py-1 border border-border rounded cursor-pointer text-muted-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setNewSpaceOpen(true)}
                  className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-md text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-secondary/40 text-left cursor-pointer transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Workspace</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

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
export default Header;
