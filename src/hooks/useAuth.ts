"use client";

import { useAuthStore } from "@/stores/authStore";

/**
 * Money Mate — Custom Authentication Hook
 * Standardized client interface to manage login sessions, mock credentials, and password recoveries.
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);
  const initialized = useAuthStore((state) => state.initialized);
  const isDemoMode = useAuthStore((state) => state.isDemoMode);
  const error = useAuthStore((state) => state.error);

  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const startDemoMode = useAuthStore((state) => state.startDemoMode);
  const logout = useAuthStore((state) => state.logout);
  const sendPasswordResetEmail = useAuthStore((state) => state.sendPasswordResetEmail);
  const updatePassword = useAuthStore((state) => state.updatePassword);
  const clearError = useAuthStore((state) => state.clearError);

  const isAuthenticated = !!user;

  return {
    // State
    user,
    session,
    loading,
    initialized,
    isDemoMode,
    error,
    isAuthenticated,

    // Actions
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    startDemoMode,
    logout,
    sendPasswordResetEmail,
    updatePassword,
    clearError,
  };
}

export default useAuth;
