"use client";

import React, { useEffect, useState } from "react";
import { useUIStore } from "@/stores/uiStore";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useNetwork } from "@/hooks/useNetwork";

function InnerUIProvider({ children }: { children: React.ReactNode }) {
  // Initialize the network listener hook inside the provider tree
  useNetwork();
  return <>{children}</>;
}

export function UIProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check local storage or system default
    const savedTheme = localStorage.getItem("money-mate-theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    setMounted(true);
  }, [setTheme]);

  // Sync theme changes with local storage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("money-mate-theme", theme);
    }
  }, [theme, mounted]);

  // Prevent flash by avoiding rendering themed layouts until hydration is finished
  if (!mounted) {
    return <div className="invisible">{children}</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <InnerUIProvider>{children}</InnerUIProvider>
    </QueryClientProvider>
  );
}
