"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { db } from "@/db/DexieDB";
import { supabase } from "@/lib/supabase";
import { Wallet } from "lucide-react";

// Check if credentials are placeholder URLs
const isMockSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url") ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder-anon-key");

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isDemoMode, initialized } = useAuthStore();
  const {
    currentWorkspace,
    workspaces,
    initialized: workspacesInitialized,
    loadWorkspaces,
  } = useWorkspaceStore();
  
  const router = useRouter();
  const pathname = usePathname();
  const [isOnboardingCheckComplete, setIsOnboardingCheckComplete] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // 1. Load workspaces once authenticated
  useEffect(() => {
    if (initialized && (user || isDemoMode)) {
      loadWorkspaces();
    }
  }, [initialized, user, isDemoMode, loadWorkspaces]);

  // 2. Perform deep onboarding check (workspace + account count)
  useEffect(() => {
    const runOnboardingCheck = async () => {
      if (!initialized) return;

      if (!user && !isDemoMode) {
        setIsOnboardingCheckComplete(true);
        setNeedsOnboarding(false);
        return;
      }

      if (!workspacesInitialized) return;

      if (workspaces.length === 0 || !currentWorkspace) {
        setNeedsOnboarding(true);
        setIsOnboardingCheckComplete(true);
        return;
      }

      try {
        // Deep verification: Check if current workspace has at least one account
        const accountCount = await db.accounts
          .where("workspace_id")
          .equals(currentWorkspace.id)
          .filter((a) => !a.deleted_at)
          .count();

        setNeedsOnboarding(accountCount === 0);
      } catch (err) {
        console.error("[RouteGuard] Account verification failed:", err);
        setNeedsOnboarding(true);
      } finally {
        setIsOnboardingCheckComplete(true);
      }
    };

    runOnboardingCheck();
  }, [initialized, workspacesInitialized, workspaces, currentWorkspace, user, isDemoMode]);

  // 3. Routing enforcement
  useEffect(() => {
    if (!initialized || ((user || isDemoMode) && (!workspacesInitialized || !isOnboardingCheckComplete))) {
      return;
    }

    const isPublicRoute = pathname === "/welcome";
    const isOnboardingRoute = pathname === "/onboarding";

    if (!user && !isDemoMode) {
      // Unauthenticated -> Force redirect to welcome
      if (!isPublicRoute) {
        router.replace("/welcome");
      }
    } else {
      // Authenticated -> Check onboarding status
      if (needsOnboarding) {
        if (!isOnboardingRoute) {
          router.replace("/onboarding");
        }
      } else {
        // Setup complete -> Direct away from public and onboarding routes
        if (isPublicRoute || isOnboardingRoute) {
          router.replace("/");
        }
      }
    }
  }, [
    initialized,
    user,
    isDemoMode,
    workspacesInitialized,
    isOnboardingCheckComplete,
    needsOnboarding,
    pathname,
    router,
  ]);

  // Show a premium, custom, branded loader until checks finish
  const showLoader =
    !initialized ||
    ((user || isDemoMode) && (!workspacesInitialized || !isOnboardingCheckComplete));

  if (showLoader) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a] text-white">
        <div className="relative flex flex-col items-center space-y-4">
          <div className="relative h-16 w-16 flex items-center justify-center">
            {/* Spinning ambient border */}
            <div className="absolute inset-0 rounded-2xl border border-white/5 border-t-white/60 animate-spin" />
            <Wallet className="h-6 w-6 text-white opacity-85" />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <h2 className="text-sm font-semibold tracking-wide text-zinc-200">
              MONEY MATE
            </h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 animate-pulse">
              Securing Session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Start session initialization
    initialize();

    if (isMockSupabase) return;

    // Listen to real Supabase auth state changes to synchronize session seamlessly
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const { user: storeUser, session: storeSession, logout, startDemoMode } = useAuthStore.getState();
        const { loadWorkspaces } = useWorkspaceStore.getState();

        if (session) {
          useAuthStore.setState({
            user: session.user,
            session,
            isDemoMode: false,
          });
          loadWorkspaces();
        } else {
          // If a session does not exist, only trigger logout if we're not running in local demo mode
          const savedDemoMode = localStorage.getItem("money-mate-demo-mode") === "true";
          if (savedDemoMode) {
            startDemoMode();
          } else {
            useAuthStore.setState({
              user: null,
              session: null,
              isDemoMode: false,
            });
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize]);

  return <RouteGuard>{children}</RouteGuard>;
}
export default AuthProvider;
