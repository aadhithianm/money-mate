import { create } from "zustand";
import { workspaceService } from "@/services/workspaceService";
import { settingsService } from "@/services/settingsService";
import type { Workspace } from "@/types/entities";
import { queryClient } from "@/lib/queryClient";

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  loadWorkspaces: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string, currency: string, isDefault?: boolean) => Promise<Workspace>;
  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  loading: false,
  initialized: false,

  loadWorkspaces: async () => {
    set({ loading: true });
    try {
      const spaces = await workspaceService.getWorkspaces();
      
      let active = null;
      if (spaces.length > 0) {
        const savedActiveId = localStorage.getItem("money-mate-active-workspace-id");
        active = spaces.find((s) => s.id === savedActiveId) || spaces[0];
        localStorage.setItem("money-mate-active-workspace-id", active.id);
        
        // Dynamically apply workspace theme settings
        if (typeof window !== "undefined") {
          try {
            const settings = await settingsService.getSettings(active.id);
            const activeTheme = settings?.theme || "system";
            
            let themeToApply: "light" | "dark" = "light";
            if (activeTheme === "system") {
              themeToApply = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            } else {
              themeToApply = activeTheme as "light" | "dark";
            }
            
            const root = window.document.documentElement;
            root.classList.remove("light", "dark");
            root.classList.add(themeToApply);
          } catch (e) {
            console.error("[WorkspaceStore] Theme application failed:", e);
          }
        }
      }

      set({
        workspaces: spaces,
        currentWorkspace: active,
        initialized: true,
      });
    } catch (err) {
      console.error("[WorkspaceStore] Failed to load workspaces:", err);
    } finally {
      set({ loading: false });
    }
  },

  switchWorkspace: async (workspaceId: string) => {
    const { workspaces } = get();
    const active = workspaces.find((s) => s.id === workspaceId);
    if (!active) return;

    localStorage.setItem("money-mate-active-workspace-id", active.id);
    set({ currentWorkspace: active });

    // Dynamically apply workspace theme settings
    if (typeof window !== "undefined") {
      try {
        const settings = await settingsService.getSettings(active.id);
        const activeTheme = settings?.theme || "system";
        
        let themeToApply: "light" | "dark" = "light";
        if (activeTheme === "system") {
          themeToApply = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        } else {
          themeToApply = activeTheme as "light" | "dark";
        }
        
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(themeToApply);
      } catch (e) {
        console.error("[WorkspaceStore] Theme switch failed:", e);
      }
    }

    // Invalidate ALL queries in React Query cache to trigger instant reactive re-renders
    // for transactions, categories, and accounts corresponding to the new workspace context.
    queryClient.invalidateQueries();
  },

  createWorkspace: async (name: string, currency: string, isDefault = false) => {
    set({ loading: true });
    try {
      const newSpace = await workspaceService.createWorkspace({
        name,
        currency,
        is_default: isDefault,
      });

      // Reload all spaces to update state
      await get().loadWorkspaces();
      
      // Automatically switch to the newly created workspace
      await get().switchWorkspace(newSpace.id);

      return newSpace;
    } catch (err) {
      console.error("[WorkspaceStore] Failed to create workspace:", err);
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  reset: () => {
    localStorage.removeItem("money-mate-active-workspace-id");
    set({
      workspaces: [],
      currentWorkspace: null,
      initialized: false,
    });
  },
}));
